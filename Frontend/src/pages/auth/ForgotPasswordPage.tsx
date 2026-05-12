import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import toast from "react-hot-toast";
import { validationUtils } from "../../utils/validation";
import { loggerUtils } from "../../utils/logger";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1: Request password reset
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        if (!validationUtils.isValidEmail(email)) {
            toast.error("Please enter a valid email");
            return;
        }

        try {
            setIsLoading(true);
            await authService.forgotPassword({ email });
            toast.success("Verification code sent to your email");
            setStep("code");
            loggerUtils.info("Password reset requested", { email });
        } catch (err: unknown) {
            if (err instanceof Error) {
                loggerUtils.warn("Password reset request failed", {
                    email,
                    error: err.message,
                });
                toast.error(err.message || "Failed to send reset code");
            } else {
                toast.error("An error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify reset code
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error("Verification code is required");
            return;
        }

        if (code.length !== 6) {
            toast.error("Code must be 6 digits");
            return;
        }

        try {
            setIsLoading(true);
            await authService.verifyResetCode({ email, code });
            toast.success("Code verified! Enter your new password");
            setStep("password");
            loggerUtils.info("Reset code verified", { email });
        } catch (err: unknown) {
            if (err instanceof Error) {
                loggerUtils.warn("Code verification failed", {
                    email,
                    error: err.message,
                });
                toast.error(err.message || "Invalid or expired code");
            } else {
                toast.error("An error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword.trim()) {
            toast.error("New password is required");
            return;
        }

        if (!confirmPassword.trim()) {
            toast.error("Please confirm your password");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const passwordCheck =
            validationUtils.validatePasswordStrength(newPassword);
        if (!passwordCheck.isStrong) {
            toast.error(passwordCheck.message);
            return;
        }

        try {
            setIsLoading(true);
            await authService.resetPassword({
                email,
                code,
                newPassword,
            });
            toast.success("Password reset successfully! Please login.");
            loggerUtils.info("Password reset completed", { email });
            navigate("/login");
        } catch (err: unknown) {
            if (err instanceof Error) {
                loggerUtils.error("Password reset failed", err, { email });
                toast.error(err.message || "Failed to reset password");
            } else {
                toast.error("An error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface-dim text-on-surface font-body min-h-screen lg:h-screen lg:overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.glass-panel {
                            background: rgba(28, 32, 39, 0.4);
                            backdrop-filter: blur(24px);
                        }
                        .glow-shadow {
                            box-shadow: 0 0 40px rgba(90, 255, 225, 0.04);
                        }
                        body {
                            font-family: 'Manrope', sans-serif;
                            background-color: #0f131b;
                        }
                    `,
                }}
            />

            <div className="h-full flex flex-col lg:flex-row">
                {/* Left Side */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12 relative overflow-hidden">
                    {/* Decorative Background Blurs */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute -top-10 -left-10 sm:top-10 sm:left-10 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-primary rounded-full blur-2xl sm:blur-3xl" />
                        <div className="absolute -bottom-10 -right-10 sm:bottom-10 sm:right-10 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-secondary rounded-full blur-2xl sm:blur-3xl" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-sm sm:max-w-md text-center lg:text-left">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline mb-3 sm:mb-6 tracking-tight sm:tracking-tighter">
                            Recover Access
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed max-w-xs sm:max-w-none mx-auto lg:mx-0">
                            Enter your email and follow the steps to reset your
                            password securely.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 ">
                        <div className="glass-panel rounded-3xl sm:rounded-4xl border border-white/10 p-6 sm:p-8 md:p-10 w-full max-w-sm sm:max-w-md glow-shadow mx-auto">
                            {/* Header */}
                            <div className="mb-6 sm:mb-8 text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline mb-2 text-on-surface">
                                    {step === "email" && "Forgot Password?"}
                                    {step === "code" && "Verify Code"}
                                    {step === "password" && "New Password"}
                                </h2>
                                <p className="text-slate-400 text-xs sm:text-sm lg:text-base">
                                    {step === "email" &&
                                        "Enter your email to receive a reset code"}
                                    {step === "code" &&
                                        "Enter the 6-digit code sent to your email"}
                                    {step === "password" &&
                                        "Create a strong new password"}
                                </p>
                            </div>

                            {/* Step 1: Email */}
                            {step === "email" && (
                                <form
                                    onSubmit={handleRequestReset}
                                    className="space-y-4 sm:space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5 sm:mb-2 text-on-surface">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="you@example.com"
                                            className="w-full bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-on-surface placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full cursor-pointer bg-linear-to-r from-primary to-primary-container text-on-primary font-bold py-3 sm:py-3.5 rounded-full hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        {isLoading
                                            ? "Sending..."
                                            : "Send Reset Code"}
                                    </button>
                                </form>
                            )}

                            {/* Step 2: Code */}
                            {step === "code" && (
                                <form
                                    onSubmit={handleVerifyCode}
                                    className="space-y-4 sm:space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5 sm:mb-2 text-on-surface">
                                            Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) =>
                                                setCode(
                                                    e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 6),
                                                )
                                            }
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-center text-xl sm:text-2xl font-bold tracking-widest text-on-surface placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        />
                                        <p className="text-xs text-slate-500 mt-2 text-center sm:text-left">
                                            Check your email for the 6-digit
                                            code
                                        </p>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full cursor-pointer bg-linear-to-r from-primary to-primary-container text-on-primary font-bold py-3 sm:py-3.5 rounded-full hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            {isLoading
                                                ? "Verifying..."
                                                : "Verify Code"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep("email")}
                                            className="w-full border border-slate-600 text-slate-400 font-semibold py-3 sm:py-3.5 rounded-full hover:bg-white/5 transition-colors text-sm sm:text-base"
                                        >
                                            Back to Email
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 3: Password */}
                            {step === "password" && (
                                <form
                                    onSubmit={handleResetPassword}
                                    className="space-y-4 sm:space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5 sm:mb-2 text-on-surface">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={newPassword}
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter new password"
                                                className="w-full bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-on-surface placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-16"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-on-surface text-sm p-1"
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5 sm:mb-2 text-on-surface">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Confirm new password"
                                            className="w-full bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-on-surface placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full cursor-pointer bg-linear-to-r from-primary to-primary-container text-on-primary font-bold py-3 sm:py-3.5 rounded-full hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base mt-2"
                                    >
                                        {isLoading
                                            ? "Resetting..."
                                            : "Reset Password"}
                                    </button>
                                </form>
                            )}

                            {/* Footer */}
                            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 text-center">
                                <p className="text-xs sm:text-sm text-slate-400">
                                    Remember your password?{" "}
                                    <Link
                                        to="/login"
                                        className="text-primary font-semibold hover:text-primary-container transition-colors ml-1"
                                    >
                                        Back to Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
