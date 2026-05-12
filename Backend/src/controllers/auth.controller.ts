import type { Response } from "express";
import { AuthRequest } from "../types/request.types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/user.model";
import { sendResetOTP } from "../utils/email";

// VALIDATION SCHEMAS
const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(50),
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const googleAuthSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(1),
    googleId: z.string().min(1),
    avatar: z.string().optional(),
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
        const { fullName, username, email, password } = parsed.data;

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
        });

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
        const { email, password } = parsed.data;

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
        const { email, fullName, avatar, googleId } = parsed.data;

        // CHECK EXISTING USER
        let user = await User.findOne({email});
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
                avatar,
            });
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

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
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

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to reset password" });
    }
};
