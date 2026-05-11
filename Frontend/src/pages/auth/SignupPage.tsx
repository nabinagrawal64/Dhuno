export default function SignupPage() {
    return (
        <div className="bg-surface-dim text-on-surface font-body selection:bg-primary selection:text-on-primary lg:h-screen lg:overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                        }
                        .glass-panel {
                            background: rgba(28, 32, 39, 0.4);
                            backdrop-filter: blur(16px);
                        }
                        .glow-shadow {
                            box-shadow: 0 0 40px rgba(90, 255, 225, 0.08);
                        }
                        .primary-gradient {
                            background: linear-gradient(45deg, #5affe1, #2de2c5);
                        }

                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-card {
                    background: rgba(28, 32, 39, 0.4);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    }
                    .aqua-glow {
                    box-shadow: 0 0 20px rgba(90, 255, 225, 0.3);
                    }
                    .bloom-bg {
                    filter: blur(80px);
                    opacity: 0.4;
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
                    {/* left */}
                    <section className="relative w-full xl:w-7/12 lg:w-1/2 h-[40vh] sm:h-[50vh] lg:h-screen lg:min-h-screen overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                alt="bg.png"
                                className="w-full h-full object-cover opacity-60"
                                data-alt="Cinematic close-up of professional studio headphones with neon aqua glowing accents in a dark misty environment with atmospheric bokeh lighting"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADcYXYfqWvOoToueCNjOhU9lRU3BkSmKqMuWHztcWyIMgyOhvG9qFWqqTz-89KU92JJECR3KHLtZKalwY5hyKTj_rqn0FQRaPRn8ojzgjJgbBAOkH30GRlPw8kjlumDOpuTnl2r4vJ3WE87rYCkqQWLWFaJNunYpQL-Q031ovsf4M4yzwAO5ueBIg1s2om6udb6hnrtPpj84rU0EGkOfMByoEVcjfJ6zTi9GzuCjPed7Kwwt6f103w8SJbYJD6U_83ZSyM7f3fE9w"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-surface-dim via-transparent to-surface-dim/40" />
                            <div className="absolute inset-0 bg-linear-to-b from-surface-dim/20 via-transparent to-surface-dim" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-20 xl:px-24">
                            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl md:text-6xl xl:text-8xl tracking-tighter leading-none mb-2 sm:mb-4 text-glow">
                                Join the 
                                <br />
                                Nocturne
                            </h1>
                            <p className="font-label uppercase tracking-[0.3em] text-secondary text-xs sm:text-sm md:text-base font-semibold opacity-80">
                                Step into the dark. Experience audio that 
                                <br />
                                breathes, pulses, and moves with your soul.
                            </p>
                            <div className="mt-8 sm:mt-12 flex items-center gap-4">
                                <div className="h-px w-8 sm:w-12 bg-primary" />
                                <span className="font-label text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary">
                                    Dhuno Premium Experience
                                </span>
                            </div>
                        </div>
                    </section>
                    
                    {/* Right */}
                    <section className="w-full xl:w-5/12 lg:w-1/2 h-full min-h-[60vh] lg:h-screen lg:min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-12 xl:p-20 relative bg-surface-dim overflow-y-visible lg:overflow-hidden">
                        <div className="glass-panel w-full max-w-[90%] sm:max-w-md p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl glow-shadow border border-white/5 relative z-10 mx-auto">
                            <div className="mb-8 pl-1 sm:mb-10 sm:pl-0">
                                <h1 className="font-headline text-2xl sm:text-3xl font-bold mb-2">
                                    Create Account
                                </h1>
                                <p className="text-on-surface-variant font-body text-sm">
                                    Start your immersive auditory journey today.
                                </p>
                            </div>

                            <form className="space-y-6">
                                <div className="space-y-1">
                                    <label className="font-label text-[10px] uppercase tracking-widest text-secondary opacity-70 ml-1">
                                        Full Name
                                    </label>
                                    <input
                                        className="w-full bg-surface-container-low border-transparent focus:border-transparent focus:ring-0 rounded-xl px-4 py-3.5 text-on-surface placeholder:text-slate-600 font-body transition-all focus:shadow-[0_2px_0_0_rgba(90,255,225,1)]"
                                        placeholder="Enter your name"
                                        type="text"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-label text-[10px] uppercase tracking-widest text-secondary opacity-70 ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        className="w-full bg-surface-container-low border-transparent focus:border-transparent focus:ring-0 rounded-xl px-4 py-3.5 text-on-surface placeholder:text-slate-600 font-body transition-all focus:shadow-[0_2px_0_0_rgba(90,255,225,1)]"
                                        placeholder="you@nocturne.com"
                                        type="email"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-label text-[10px] uppercase tracking-widest text-secondary opacity-70 ml-1">
                                            Password
                                        </label>
                                        <input
                                            className="w-full bg-surface-container-low border-transparent focus:border-transparent focus:ring-0 rounded-xl px-4 py-3.5 text-on-surface placeholder:text-slate-600 font-body transition-all focus:shadow-[0_2px_0_0_rgba(90,255,225,1)]"
                                            placeholder="Example@123"
                                            type="password"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-label text-[10px] uppercase tracking-widest text-secondary opacity-70 ml-1">
                                            Confirm
                                        </label>
                                        <input
                                            className="w-full bg-surface-container-low border-transparent focus:border-transparent focus:ring-0 rounded-xl px-4 py-3.5 text-on-surface placeholder:text-slate-600 font-body transition-all focus:shadow-[0_2px_0_0_rgba(90,255,225,1)]"
                                            placeholder="Example@123"
                                            type="password"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 py-2">
                                    <div className="flex items-center h-5">
                                        <input
                                            aria-label="term"
                                            className="w-4 h-4 rounded border-outline-variant bg-surface-container-high text-primary focus:ring-offset-surface-dim focus:ring-primary cursor-pointer"
                                            type="checkbox"
                                        />
                                    </div>
                                    <label className="text-xs text-on-surface-variant font-body leading-relaxed">
                                        I accept the{" "}
                                        <a
                                            className="text-secondary hover:text-primary transition-colors"
                                            href="#"
                                        >
                                            Terms of Service
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            className="text-secondary hover:text-primary transition-colors"
                                            href="#"
                                        >
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>

                                <button className="w-full primary-gradient text-on-primary lg:py-4 py-2.5 rounded-full font-headline font-bold text-base hover:scale-[1.02] active:scale-95 transition-all duration-200 glow-shadow mt-4">
                                    Create Account
                                </button>
                            </form>

                            <div className="mt-10 text-center">
                                <p className="text-sm text-on-surface-variant font-body">
                                    Already have an account?
                                    <a
                                        className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-2"
                                        href="#"
                                    >
                                        Login
                                    </a>
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
