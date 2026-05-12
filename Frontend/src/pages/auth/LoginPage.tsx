import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { authUtils } from "../../utils/auth";
import { rateLimitUtils } from "../../utils/rateLimit";
import { validationUtils } from "../../utils/validation";
import { loggerUtils } from "../../utils/logger";
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                
                const response = await authService.googleAuth({
                    email: userInfo.email,
                    fullName: userInfo.name,
                    avatar: userInfo.picture,
                    googleId: userInfo.sub,
                });
                
                if (response.token) {
                    authUtils.saveToken(response.token);
                    loggerUtils.logAuthEvent("googleLogin", { email: userInfo.email });
                }
                
                toast.success("Google login successful!");
                navigate("/home");
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.error(err.message || "Google login failed");
                } else {
                    toast.error("An unknown error occurred during Google login");
                }
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => toast.error('Google Login Failed'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form data
        const validation = validationUtils.validateLoginForm(formData);
        if (!validation.isValid) {
            Object.values(validation.errors).forEach((error) => {
                toast.error(error);
            });
            return;
        }

        // Check rate limit
        const rateLimitCheck = rateLimitUtils.checkLimit("login");
        if (!rateLimitCheck.allowed) {
            const remaining = rateLimitUtils.getRemaining("login");
            const retryAfter = rateLimitUtils.getRetryAfter("login");
            toast.error(
                `Too many login attempts. Please try again in ${retryAfter} seconds.\nRemaining attempts: ${remaining}`
            );
            return;
        }

        try {
            setIsLoading(true);
            const response = await authService.login(formData);
            
            // Save token to localStorage
            if (response.token) {
                authUtils.saveToken(response.token);
                // Reset rate limit on successful login
                rateLimitUtils.reset("login");
                // Log login event
                loggerUtils.logAuthEvent("login", { email: formData.email });
            }
            
            toast.success("Login successful!");
            navigate("/home"); // Navigate to home or dashboard after successful login
        } catch (err: unknown) {
            if (err instanceof Error) {
                loggerUtils.warn("Login failed", { email: formData.email, error: err.message });
                toast.error(err.message || "Login failed");
            } else {
                loggerUtils.error("Unknown login error", undefined, { email: formData.email });
                toast.error("An unknown error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface-dim text-on-surface font-body lg:h-screen lg:overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.glass-panel {
                            background: rgba(28, 32, 39, 0.4);
                            backdrop-filter: blur(24px);
                            -webkit-backdrop-filter: blur(24px);
                        }
                        .glow-shadow {
                            box-shadow: 0 0 40px rgba(90, 255, 225, 0.04);
                        }
                        .primary-gradient {
                            background: linear-gradient(45deg, #5affe1, #2de2c5);
                        }
                        .text-glow {
                            text-shadow: 0 0 15px rgba(90, 255, 225, 0.3);
                        }

                        .material-symbols-outlined {
                            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                        }
                        body {
                            font-family: 'Manrope', sans-serif;
                            background-color: #0f131b;
                        }
                        .font-sora { font-family: 'Sora', sans-serif; }
                        .font-manrope { font-family: 'Manrope', sans-serif; }
                        
                        .glass-card {
                            background: rgba(28, 32, 39, 0.6);
                            backdrop-filter: blur(24px);
                            -webkit-backdrop-filter: blur(24px);
                        }
                        .glow-button {
                            box-shadow: 0 0 20px rgba(90, 255, 225, 0.3);
                        }
                        .glow-button:hover {
                            box-shadow: 0 0 35px rgba(90, 255, 225, 0.5);
                        }
                        .bg-mesh {
                            background: radial-gradient(circle at 20% 30%, rgba(90, 255, 225, 0.15) 0%, transparent 50%),
                                        radial-gradient(circle at 80% 70%, rgba(146, 204, 255, 0.1) 0%, transparent 50%);
                        }

                body {
                    min-height: max(884px, 100dvh);
                    }`,
                }}
            />
            <div>
                {/* TopAppBar Shell (Suppressed as per rules for login but keeping for branding identity context if required by structure, however rules state "Automatic Suppression" for Login pages. Implementing subtle branding instead) */}
                <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-transparent">
                    <div className="text-2xl lg:flex hidden font-bold tracking-tighter text-[#5affe1] font-headline">
                        Dhuno
                    </div>
                </header>

                <main className="min-h-screen lg:h-screen flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                    {/* Left Panel: Cinematic Visual */}
                    <section className="relative w-full xl:w-7/12 lg:w-1/2 h-[40vh] sm:h-[50vh] lg:h-screen lg:min-h-screen overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                alt="Neon City"
                                className="w-full h-full object-cover grayscale-[0.3] brightness-[0.6]"
                                data-alt="Cinematic wide shot of a futuristic neon-lit city at night with glowing aqua and violet lights, rainy streets, and ethereal cyberpunk atmosphere."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVUYpqZcszCQpK373zM52RYxzzwRoD169aC45Z8p3wfI_L-ogHxJzJeL6NSgK-NPC1HRZ0elnHMO_PeP8EbAe23FRPruXaQW6xdvQ63uhD5iUHDFG34LZ9vSN8s8EoetyRnGp-u-b-fbybBnULFAvBcNl9ETY1Kk6RXVq6aX-hkdSmi-gvyJis8ITw3muubshnddGma6C_lL1HaG89JaMUzHp0lrUrZ2wkxGEDo32iQmixuHnCTGHmbZm3v3iF8J_-rcEoxlskf-Y"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-surface-dim via-transparent to-surface-dim/20 opacity-90" />
                            {/* Dynamic Light Blooms */}
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-20 xl:px-24">
                            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-8xl tracking-tighter leading-none mb-2 sm:mb-4 text-glow">
                                The Neon
                                <br />
                                Nocturne
                            </h1>
                            <p className="font-label uppercase tracking-[0.3em] text-secondary text-xs sm:text-sm md:text-base font-semibold opacity-80">
                                Dhuno • Immersive Audio Experience
                            </p>
                            <div className="mt-8 sm:mt-12 flex items-center gap-4">
                                <div className="h-px w-8 sm:w-12 bg-primary/40" />
                                <span className="text-[10px] sm:text-xs font-label tracking-widest text-on-surface-variant italic">
                                    SYNC YOUR RHYTHM
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel: Login Form */}
                    <section className="w-full xl:w-5/12 lg:w-1/2 h-full min-h-[60vh] lg:h-screen lg:min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-12 xl:p-20 relative bg-surface-dim overflow-y-visible lg:overflow-hidden">
                        {/* Decorative Glow behind form */}
                        <div className="absolute inset-0 items-center justify-center overflow-hidden pointer-events-none hidden sm:flex">
                            <div className="w-125 h-125 bg-primary/5 rounded-full blur-[150px]" />
                        </div>

                        <div className="glass-panel w-full max-w-[90%] sm:max-w-md p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl glow-shadow border border-white/5 relative z-10 mx-auto">
                            <div className="mb-8 pl-1 sm:mb-10 sm:pl-0">
                                <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-2">
                                    Welcome Back
                                </h2>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label
                                        className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1"
                                        htmlFor="email"
                                    >
                                        Email
                                    </label>
                                    <div className="relative group">
                                        <input
                                            className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-lg py-4 px-5 text-on-surface placeholder:text-slate-600 transition-all duration-300"
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label
                                            className="font-label text-xs uppercase tracking-widest text-on-surface-variant"
                                            htmlFor="password"
                                        >
                                            Password
                                        </label>
                                        <Link
                                            className="text-xs text-secondary hover:text-primary transition-colors"
                                            to="/forgot-password"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-lg py-4 px-5 text-on-surface placeholder:text-slate-600 transition-all duration-300"
                                            id="password"
                                            placeholder="Example@123"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface"
                                            type="button"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((current) => !current)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me Toggle */}
                                <div className="flex items-center gap-3 py-1">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            aria-label="remember"
                                            className="sr-only peer"
                                            type="checkbox"
                                            defaultChecked
                                        />
                                        <div className="w-10 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
                                    </label>
                                    <span className="text-sm text-on-surface-variant">
                                        Remember this session
                                    </span>
                                </div>

                                {/* Login Button */}
                                <button
                                    className="w-full cursor-pointer primary-gradient text-on-primary lg:py-4 py-2.5 rounded-full font-headline font-bold text-base hover:scale-[1.02] active:scale-95 transition-all duration-200 glow-shadow mt-4 disabled:opacity-70 disabled:hover:scale-100"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center my-8">
                                <div className="w-full h-px bg-outline-variant/30" />
                                <span className="absolute px-4 bg-[#14181f] text-[10px] uppercase tracking-widest text-slate-500">
                                    Or continue with
                                </span>
                            </div>

                            {/* Social Logins */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* google */}
                                <button type="button" onClick={() => handleGoogleLogin()} className="flex cursor-pointer items-center justify-center gap-3 bg-surface-container-high py-3 rounded-full hover:bg-surface-container-highest transition-colors border border-white/5">
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">
                                        Google
                                    </span>
                                </button>
                                
                                {/* apple */}
                                <button className="flex cursor-pointer items-center justify-center gap-3 bg-surface-container-high py-3 rounded-full hover:bg-surface-container-highest transition-colors border border-white/5">
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M17.05 20.28c-.98.95-2.05 1.88-3.72 1.92-1.61.04-2.14-.92-3.98-.92-1.85 0-2.43.92-3.98.96-1.61.04-2.86-1.07-3.83-2.03-2-1.96-3.53-5.54-1.48-9.04 1.02-1.74 2.81-2.84 4.75-2.87 1.48-.03 2.87 1 3.79 1 .91 0 2.61-1.25 4.39-1.07.75.03 2.85.3 4.19 2.27-.11.07-2.51 1.46-2.48 4.34.03 3.45 3.01 4.62 3.05 4.64-.03.1-.47 1.62-1.57 2.8M12.03 7.25c-.02-2.23 1.84-4.13 3.99-4.25.26 2.61-2.45 4.54-3.99 4.25"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">
                                        Apple
                                    </span>
                                </button>
                            </div>

                            <div className="mt-10 text-center">
                                <p className="text-on-surface-variant text-sm">
                                    New to the Dhuno?
                                    <Link
                                        className="text-primary font-bold ml-1 hover:underline"
                                        to="/signup"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
