import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import { signup, login, googleAuth, getMe, updateMe, deleteMe, logout, forgotPassword, verifyResetCode, resetPassword } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

const getBodyValue = (req: Request, field: string): string | undefined => {
    const value = req.body?.[field];
    return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : undefined;
};

const keyByUserIdentifier = (...fields: string[]) => {
    return (req: Request): string => {
        for (const field of fields) {
            const value = getBodyValue(req, field);
            if (value) {
                return `${field}:${value}`;
            }
        }

        return `ip:${ipKeyGenerator(req.ip || "")}`;
    };
};

// LOGIN — strictest: brute force target (10 attempts / 15 min)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: keyByUserIdentifier("email"),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
});

// SIGNUP — prevents mass registration (5 accounts / hour)
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: keyByUserIdentifier("email", "username"),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many accounts created. Please try again after an hour." },
});

// GOOGLE AUTH — OAuth flow, slightly more lenient (15 / 15 min)
const googleLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    keyGenerator: keyByUserIdentifier("email", "googleId"),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
});

// FORGOT PASSWORD — very tight: prevents email enumeration (3 / hour)
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator: keyByUserIdentifier("email"),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many password reset requests. Please try again after an hour." },
});

// VERIFY CODE / RESET PASSWORD — prevents code guessing (5 / 15 min)
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: keyByUserIdentifier("email"),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Please try again after 15 minutes." },
});

// Authentication
router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/google", googleLimiter, googleAuth);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);
router.post("/logout", protect, logout);

// Password reset routes
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-reset-code", resetLimiter, verifyResetCode);
router.post("/reset-password", resetLimiter, resetPassword);

export default router;
