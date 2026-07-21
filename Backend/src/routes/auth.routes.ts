import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import { signup, login, googleAuth, getMe, updateMe, deleteMe, logout, forgotPassword, verifyResetCode, resetPassword, changePassword, verify2FALogin, requestEnable2FA, verifyEnable2FA, disable2FA } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { createRedisRateLimitStore } from "../utils/redis-rate-limit-store";
const createLimiter = (prefix: string, windowMs: number, max: number, keyGenerator: (req: Request) => string, message: string) => {
    const store = createRedisRateLimitStore(prefix, windowMs);

    return rateLimit({
        windowMs,
        max,
        keyGenerator,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message },
        ...(store ? { store } : {}),
    });
};

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
const loginLimiter = createLimiter("rl:login", 15 * 60 * 1000, 10, keyByUserIdentifier("email"), "Too many login attempts. Please try again after 15 minutes.");

// SIGNUP — prevents mass registration (5 accounts / hour)
const signupLimiter = createLimiter("rl:signup", 60 * 60 * 1000, 5, keyByUserIdentifier("email", "username"), "Too many accounts created. Please try again after an hour.");

// GOOGLE AUTH — OAuth flow, slightly more lenient (15 / 15 min)
const googleLimiter = createLimiter("rl:google", 15 * 60 * 1000, 15, keyByUserIdentifier("email", "googleId"), "Too many requests. Please try again later.");

// FORGOT PASSWORD — very tight: prevents email enumeration (3 / hour)
const forgotPasswordLimiter = createLimiter("rl:forgot-password", 60 * 60 * 1000, 3, keyByUserIdentifier("email"), "Too many password reset requests. Please try again after an hour.");

// VERIFY CODE / RESET PASSWORD — prevents code guessing (5 / 15 min)
const resetLimiter = createLimiter("rl:reset", 15 * 60 * 1000, 5, keyByUserIdentifier("email"), "Too many attempts. Please try again after 15 minutes.");

// Authentication
router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/google", googleLimiter, googleAuth);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);
router.post("/logout", protect, logout);
router.post("/change-password", protect, changePassword);

// 2FA
router.post("/2fa/verify-login", resetLimiter, verify2FALogin);
router.post("/2fa/request-enable", protect, requestEnable2FA);
router.post("/2fa/verify-enable", protect, verifyEnable2FA);
router.post("/2fa/disable", protect, disable2FA);

// Password reset routes
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-reset-code", resetLimiter, verifyResetCode);
router.post("/reset-password", resetLimiter, resetPassword);

export default router;
