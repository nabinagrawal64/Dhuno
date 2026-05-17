import type { Response } from "express";
import { AuthRequest } from "../types/request.types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/user.model";
import Artist from "../models/artist.model";
import Song from "../models/song.model";
import mongoose from "mongoose";
import { sendResetOTP, send2FAOTP, sendPasswordChangedEmail } from "../utils/email";

// VALIDATION SCHEMAS
const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(50),
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "artist"]).optional().default("user"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    role: z.enum(["user", "artist", "admin"]).optional(),
});

const googleAuthSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(1),
    googleId: z.string().min(1),
    avatar: z.string().optional(),
    role: z.enum(["user", "artist"]).optional().default("user"),
});

const updateProfileSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(50).optional(),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .optional(),
    bio: z.string().max(250, "Bio can be at most 250 characters").optional(),
    avatar: z.string().url("Avatar must be a valid URL").or(z.literal("")).optional(),
    bannerImage: z.string().url("Banner image must be a valid URL").or(z.literal("")).optional(),
});

// GENERATE JWT
const generateToken = ( userId: string ): string => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
    );
};

// COOKIE OPTIONS
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

// SIGNUP
export const signup = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        // VALIDATION
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: parsed.error.issues[0].message,
            });
            return;
        }
        const { fullName, username, email, password, role } = parsed.data;

        // CHECK EXISTING EMAIL
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            res.status(400).json({
                success: false,
                message: "Email already exists",
            });
            return;
        }

        // CHECK EXISTING USERNAME
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            res.status(400).json({
                success: false,
                message: "Username already taken",
            });
            return;
        }

        // HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // CREATE USER
        const user = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
            role,
        });

        if (role === "artist") {
            await Artist.findOneAndUpdate(
                { username: user.username },
                {
                    name: user.fullName,
                    username: user.username,
                    avatar: user.avatar,
                    bio: user.bio,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        // TOKEN
        const token = generateToken(user._id.toString());
        res.cookie("token", token, cookieOptions);

        const userObj = user.toObject();
        delete (userObj as any).password;

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: userObj,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Signup failed",
        });
    }
};

// LOGIN
export const login = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        // VALIDATION
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: parsed.error.issues[0].message,
            });
            return;
        }
        const { email, password, role } = parsed.data;

        // FIND USER
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        // COMPARE PASSWORD
        const isPasswordCorrect = await bcrypt.compare( password, user.password );

        if (!isPasswordCorrect) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }

        if (role && user.role !== role) {
            res.status(403).json({
                success: false,
                message: `This account is registered as a ${user.role}. Please login with the correct account type.`,
            });
            return;
        }

        // CHECK 2FA
        if (user.twoFactorEnabled) {
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const salt = await bcrypt.genSalt(10);
            user.twoFactorOTP = await bcrypt.hash(otp, salt);
            user.twoFactorOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
            await user.save();

            // Send Email
            await send2FAOTP(user.email, otp, user.fullName);

            res.status(200).json({
                success: true,
                twoFactorRequired: true,
                email: user.email,
                message: "2FA required. OTP sent to your email.",
            });
            return;
        }

        // TOKEN
        const token = generateToken(user._id.toString());
        res.cookie("token", token, cookieOptions);

        const userObj = user.toObject();
        delete (userObj as any).password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userObj,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message:
                "Login failed",
        });
    }
};

// GOOGLE SIGNUP / LOGIN
export const googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // VALIDATION
        const parsed = googleAuthSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Google authentication failed",
            });
            return;
        }
        const { email, fullName, avatar, googleId, role } = parsed.data;

        // CHECK EXISTING USER
        let user = await User.findOne({email});
        if (user && user.role !== role) {
            res.status(403).json({
                success: false,
                message: `This Google account is registered as a ${user.role}. Please use the correct account type.`,
            });
            return;
        }

        if (user && !user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        if (!user) {
            const username = email.split("@")[0].toLowerCase() + Math.floor(Math.random() * 1000);
            
            const generatedPassword = googleId + Date.now();
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(generatedPassword, salt);
            
            user = await User.create({
                fullName,
                username,
                email,
                password: hashedPassword,
                googleId,
                avatar,
                role,
            });

            if (role === "artist") {
                await Artist.findOneAndUpdate(
                    { username: user.username },
                    {
                        name: user.fullName,
                        username: user.username,
                        avatar: user.avatar,
                        bio: user.bio,
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }
        }

        // CHECK 2FA
        if (user.twoFactorEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const salt = await bcrypt.genSalt(10);
            user.twoFactorOTP = await bcrypt.hash(otp, salt);
            user.twoFactorOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();

            await send2FAOTP(user.email, otp, user.fullName);

            res.status(200).json({
                success: true,
                twoFactorRequired: true,
                email: user.email,
                message: "2FA required. OTP sent to your email.",
            });
            return;
        }

        // TOKEN
        const token = generateToken( user._id.toString() );
        res.cookie("token", token, cookieOptions);

        const userObj = user.toObject();
        delete (userObj as any).password;

        res.status(200).json({
            success: true,
            message: "Google authentication successful",
            token,
            user: userObj,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message:
                "Google auth failed",
        });
    }
};

// GET CURRENT USER
export const getMe = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        const user = await User.findById(
            req.user
        );

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        let totalSongs = 0;
        if (user.role === 'artist') {
            totalSongs = await Song.countDocuments({ uploadedBy: user._id });
        }

        const userObj = user.toObject();
        if (user.role === 'artist') {
            (userObj as any).totalSongs = totalSongs;
        }

        res.status(200).json({
            success: true,
            user: userObj,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};

// UPDATE CURRENT USER PROFILE
export const updateMe = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }

        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: parsed.error.issues[0].message,
            });
            return;
        }

        const updates = parsed.data;
        const hasUpdates = Object.values(updates).some((value) => value !== undefined);
        if (!hasUpdates) {
            res.status(400).json({
                success: false,
                message: "No profile fields provided for update",
            });
            return;
        }

        const user = await User.findById(req.user);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        if (updates.username && updates.username.toLowerCase() !== user.username) {
            const existingUsername = await User.findOne({ username: updates.username.toLowerCase() });
            if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
                res.status(400).json({
                    success: false,
                    message: "Username already taken",
                });
                return;
            }
            user.username = updates.username.toLowerCase();
        }

        if (updates.fullName !== undefined) user.fullName = updates.fullName;
        if (updates.bio !== undefined) user.bio = updates.bio;
        if (updates.avatar !== undefined) user.avatar = updates.avatar;
        if (updates.bannerImage !== undefined) user.bannerImage = updates.bannerImage;

        const updatedUser = await user.save();

        if (updatedUser.role === "artist") {
            await Artist.findOneAndUpdate(
                { username: updatedUser.username },
                {
                    name: updatedUser.fullName,
                    username: updatedUser.username,
                    avatar: updatedUser.avatar,
                    bio: updatedUser.bio,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

// DELETE CURRENT USER ACCOUNT
export const deleteMe = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }

        const user = await User.findById(req.user);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        if (user.role === "artist") {
            await Artist.findOneAndDelete({ username: user.username });
        }

        await User.deleteOne({ _id: user._id });

        res.clearCookie("token", cookieOptions);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete account",
        });
    }
};

// LOGOUT
export const logout = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        res.clearCookie("token", cookieOptions);
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};

// ── PASSWORD RESET ────────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const verifyResetCodeSchema = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().length(6, "Code must be exactly 6 digits"),
});

const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().length(6, "Code must be exactly 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const verify2FASchema = z.object({
    email: z.string().email(),
    code: z.string().min(1, "Code is required"), // Can be OTP or Backup Code
});

// 2FA: VERIFY LOGIN
export const verify2FALogin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsed = verify2FASchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: parsed.error.issues[0].message });
            return;
        }
        const { email, code } = parsed.data;

        const user = await User.findOne({ email }).select("+twoFactorOTP +twoFactorOTPExpires +twoFactorBackupCodes");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        let isValid = false;

        // Try OTP first
        if (user.twoFactorOTP && user.twoFactorOTPExpires && user.twoFactorOTPExpires > new Date()) {
            isValid = await bcrypt.compare(code, user.twoFactorOTP);
        }

        // Try Backup Codes if not valid
        if (!isValid && user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
            const backupMatchIdx = user.twoFactorBackupCodes.findIndex(bc => bc === code);
            if (backupMatchIdx !== -1) {
                isValid = true;
                // Consume backup code
                user.twoFactorBackupCodes.splice(backupMatchIdx, 1);
            }
        }

        if (!isValid) {
            res.status(400).json({ success: false, message: "Invalid or expired code" });
            return;
        }

        // Clear OTP
        user.twoFactorOTP = undefined;
        user.twoFactorOTPExpires = undefined;
        await user.save();

        // TOKEN
        const token = generateToken(user._id.toString());
        res.cookie("token", token, cookieOptions);

        const userObj = user.toObject();
        delete (userObj as any).password;
        delete (userObj as any).twoFactorOTP;
        delete (userObj as any).twoFactorBackupCodes;

        res.status(200).json({
            success: true,
            message: "2FA verification successful",
            token,
            user: userObj,
        });
    } catch (error) {
        console.error("2FA VERIFY LOGIN ERROR:", error);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

// 2FA: REQUEST ENABLE (SEND OTP)
export const requestEnable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const user = await User.findById(req.user);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        user.twoFactorOTP = await bcrypt.hash(otp, salt);
        user.twoFactorOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await send2FAOTP(user.email, otp, user.fullName);

        res.status(200).json({ success: true, message: "OTP sent to your email to enable 2FA." });
    } catch (error) {
        console.error("2FA REQUEST ENABLE ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
};

// 2FA: VERIFY AND ENABLE
export const verifyEnable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const { code } = req.body;
        if (!code) {
            res.status(400).json({ success: false, message: "Verification code is required" });
            return;
        }

        const user = await User.findById(req.user).select("+twoFactorOTP +twoFactorOTPExpires");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        if (!user.twoFactorOTP || !user.twoFactorOTPExpires || user.twoFactorOTPExpires < new Date()) {
            res.status(400).json({ success: false, message: "OTP expired or not found" });
            return;
        }

        const isValid = await bcrypt.compare(code, user.twoFactorOTP);
        if (!isValid) {
            res.status(400).json({ success: false, message: "Invalid verification code" });
            return;
        }

        // Enable 2FA
        user.twoFactorEnabled = true;
        user.twoFactorOTP = undefined;
        user.twoFactorOTPExpires = undefined;

        // Generate Backup Codes (The "extra layer")
        const backupCodes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
        user.twoFactorBackupCodes = backupCodes; // Note: In a real app, maybe hash these too, but for easy copy-paste we might keep them or hash them.
        // Actually, let's keep them readable for the response once, then save them (maybe hashed). 
        // For this project, I'll store them as plain strings for simplicity in the demo, but marked as select: false.

        await user.save();

        res.status(200).json({
            success: true,
            message: "2FA enabled successfully",
            backupCodes,
        });
    } catch (error) {
        console.error("2FA VERIFY ENABLE ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to enable 2FA" });
    }
};

// 2FA: DISABLE
export const disable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const user = await User.findById(req.user);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        user.twoFactorEnabled = false;
        user.twoFactorOTP = undefined;
        user.twoFactorOTPExpires = undefined;
        user.twoFactorBackupCodes = [];
        await user.save();

        res.status(200).json({ success: true, message: "2FA disabled successfully" });
    } catch (error) {
        console.error("2FA DISABLE ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to disable 2FA" });
    }
};

// CHANGE PASSWORD (AUTHENTICATED)
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const parsed = changePasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: parsed.error.issues[0].message });
            return;
        }
        const { currentPassword, newPassword } = parsed.data;

        const user = await User.findById(req.user).select("+password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // If user doesn't have a password (e.g. only Google auth), they might need to set one first
        // but our current logic always sets a generated password for Google users.
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Incorrect current password" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Send confirmation email
        await sendPasswordChangedEmail(user.email, user.fullName);

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

// FORGOT PASSWORD
export const forgotPassword = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: parsed.error.issues[0].message });
            return;
        }
        const { email } = parsed.data;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ success: false, message: "No account found with this email address" });
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        await sendResetOTP(user.email, otp, user.fullName);

        res.status(200).json({ success: true, message: "Reset code has been sent to your email." });
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to send reset code" });
    }
};

// VERIFY RESET CODE
export const verifyResetCode = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        const parsed = verifyResetCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: parsed.error.issues[0].message });
            return;
        }
        const { email, code } = parsed.data;

        const user = await User.findOne({ email }).select("+resetPasswordOTP +resetPasswordOTPExpires");

        if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
            res.status(400).json({ success: false, message: "Invalid or expired code" });
            return;
        }

        if (user.resetPasswordOTPExpires < new Date()) {
            res.status(400).json({ success: false, message: "Code has expired. Please request a new one." });
            return;
        }

        const isValid = await bcrypt.compare(code, user.resetPasswordOTP);
        if (!isValid) {
            res.status(400).json({ success: false, message: "Invalid code" });
            return;
        }

        res.status(200).json({ success: true, message: "Code verified successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to verify code" });
    }
};

// RESET PASSWORD
export const resetPassword = async ( req: AuthRequest, res: Response ): Promise<void> => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: parsed.error.issues[0].message });
            return;
        }
        const { email, code, newPassword } = parsed.data;

        const user = await User.findOne({ email }).select("+password +resetPasswordOTP +resetPasswordOTPExpires");

        if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
            res.status(400).json({ success: false, message: "Invalid or expired code" });
            return;
        }

        if (user.resetPasswordOTPExpires < new Date()) {
            res.status(400).json({ success: false, message: "Code has expired. Please request a new one." });
            return;
        }

        const isValid = await bcrypt.compare(code, user.resetPasswordOTP);
        if (!isValid) {
            res.status(400).json({ success: false, message: "Invalid code" });
            return;
        }

        // Hash new password and clear OTP atomically
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        // Send confirmation email
        await sendPasswordChangedEmail(user.email, user.fullName);

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to reset password" });
    }
};
