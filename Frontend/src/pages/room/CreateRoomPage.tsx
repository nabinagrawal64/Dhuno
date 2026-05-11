

export default function CreateRoomPage() {
    return (
        <div className="bg-background text-on-background font-body min-h-screen overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.6);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                    }
                    .neon-glow {
                        box-shadow: 0 0 20px rgba(90, 255, 225, 0.15);
                    }
                    .text-neon {
                        text-shadow: 0 0 8px rgba(90, 255, 225, 0.4);
                    }

            body { font-family: 'Manrope', sans-serif; }
                    .font-sora { font-family: 'Sora', sans-serif; }
                    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.45);
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                    }
                    .glow-shadow {
                        box-shadow: 0 0 40px rgba(90, 255, 225, 0.08);
                    }
                    input:focus, textarea:focus {
                        outline: none;
                        border-bottom-color: #5affe1;
                        box-shadow: 0 4px 12px -6px rgba(90, 255, 225, 0.3);
                    }
                    .custom-range::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        background: #5affe1;
                        border-radius: 50%;
                        cursor: pointer;
                        box-shadow: 0 0 10px rgba(90, 255, 225, 0.6);
                    }

            body {
                min-height: max(884px, 100dvh);
                }` }} 
            />
            <div>
                {/* TopNavBar */}
                <nav className="fixed top-0 w-full z-50 bg-[#0f131b]/60 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_4px_30px_rgba(15,19,27,0.1)]">
                    <div className="flex items-center space-x-12">
                        <span className="text-2xl font-black tracking-tighter text-[#5affe1] drop-shadow-[0_0_10px_rgba(90,255,225,0.4)] font-['Sora']">Neon Nocturne</span>
                        <div className="hidden md:flex space-x-8 font-['Sora'] tracking-tight font-bold">
                            <a className="text-slate-400 hover:text-slate-200 transition-all duration-300" href="#">Discover</a>
                            <a className="text-slate-400 hover:text-slate-200 transition-all duration-300" href="#">Live</a>
                            <a className="text-slate-400 hover:text-slate-200 transition-all duration-300" href="#">Library</a>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="material-symbols-outlined text-slate-400 hover:bg-[#5affe1]/10 p-2 rounded-full transition-all duration-300">cast</button>
                        <button className="material-symbols-outlined text-slate-400 hover:bg-[#5affe1]/10 p-2 rounded-full transition-all duration-300">notifications</button>
                        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20">
                            <img alt="User profile" data-alt="Close up portrait of a young man with cool neon lighting reflecting on his face, cinematic urban night aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHP0jvYVyPXV3ADnk7D5TkiuER56v_BBilojBJykZZ_AvIXJS7puxmK8qFf5jMdMiyIaWBLr5c_QGrSXC_p2Acdli5px30IGZ63HObRnIWJP7T9o5Ck7iStf8WB2vPi6T11PiIyV4x7t7CPLHaoYeMYlNDWyPF9Yh1mV7t-EocM9dnOM2_BtQC1rZ0rCNc_ISxl6P0Cb1AXRB8nHg7EVkr1edQCCWlY7zBMPoBXGwe9DTZ9N7mL9xQSIxwfHNo-khbwKPyUZ54LRI" />
                        </div>
                    </div>
                </nav>

                {/* SideNavBar */}
                <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 z-40 bg-[#0a0e15]/80 backdrop-blur-2xl flex-col pt-24 pb-8 shadow-[10px_0_40px_rgba(0,0,0,0.5)]">
                    <div className="px-6 mb-8">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>settings_input_component</span>
                            </div>
                            <span className="text-[#5affe1] font-['Sora'] font-bold text-lg">Studio</span>
                        </div>
                        <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">Create Room</p>
                    </div>
                    <nav className="flex-1 space-y-1 font-['Manrope'] text-sm font-medium tracking-wide">
                        <a className="flex items-center space-x-4 text-slate-500 px-6 py-4 hover:bg-white/5 hover:text-white transition-colors duration-200 ease-in-out" href="#">
                            <span className="material-symbols-outlined">home</span>
                            <span>Home</span>
                        </a>
                        <a className="flex items-center space-x-4 text-slate-500 px-6 py-4 hover:bg-white/5 hover:text-white transition-colors duration-200 ease-in-out" href="#">
                            <span className="material-symbols-outlined">equalizer</span>
                            <span>Trending</span>
                        </a>
                        <a className="flex items-center space-x-4 text-slate-500 px-6 py-4 hover:bg-white/5 hover:text-white transition-colors duration-200 ease-in-out" href="#">
                            <span className="material-symbols-outlined">radio</span>
                            <span>Stations</span>
                        </a>
                        <a className="flex items-center space-x-4 text-slate-500 px-6 py-4 hover:bg-white/5 hover:text-white transition-colors duration-200 ease-in-out" href="#">
                            <span className="material-symbols-outlined">filter_drama</span>
                            <span>Moods</span>
                        </a>
                        <a className="flex items-center space-x-4 bg-linear-to-r from-[#5affe1]/20 to-transparent text-[#5affe1] border-l-4 border-[#5affe1] px-6 py-4 transition-colors duration-200 ease-in-out" href="#">
                            <span className="material-symbols-outlined">settings_input_component</span>
                            <span>Studio</span>
                        </a>
                    </nav>
                    <div className="px-6 mt-auto space-y-4">
                        <button className="w-full py-3 px-4 bg-linear-to-r from-[#5affe1] to-[#2de2c5] text-on-primary font-bold rounded-full active:scale-95 transition-transform shadow-lg shadow-primary/20">
                            Go Live
                        </button>
                        <div className="space-y-1 pt-4 font-['Manrope'] text-sm font-medium">
                            <a className="flex items-center space-x-4 text-slate-500 px-2 py-2 hover:text-white transition-colors" href="#">
                                <span className="material-symbols-outlined text-lg">help_outline</span>
                                <span>Support</span>
                            </a>
                            <a className="flex items-center space-x-4 text-slate-500 px-2 py-2 hover:text-white transition-colors" href="#">
                                <span className="material-symbols-outlined text-lg">settings</span>
                                <span>Settings</span>
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Main Content Canvas */}
                <main className="md:ml-64 pt-28 pb-12 px-6 flex items-center justify-center min-h-screen relative overflow-hidden">
                    {/* Abstract Background Glows */}
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary-container/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="w-full max-w-2xl glass-panel rounded-4xl p-8 md:p-12 relative z-10 neon-glow border border-white/5">
                        <header className="mb-10 text-center md:text-left">
                            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">Create Room</h1>
                            <p className="text-slate-400 text-sm md:text-base font-medium">Ignite a new sonic experience and invite the world.</p>
                        </header>
                        <form className="space-y-8">
                            {/* Room Name */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold tracking-widest text-[#5affe1] uppercase ml-1">Room Name</label>
                                <input className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary/50 focus:ring-0 rounded-xl px-4 py-4 text-on-surface placeholder:text-slate-600 transition-all font-medium" placeholder="e.g. Midnight Cyberdeck Sessions" type="text" />
                            </div>
                            {/* Room Description */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold tracking-widest text-[#5affe1] uppercase ml-1">Description</label>
                                <textarea className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary/50 focus:ring-0 rounded-xl px-4 py-4 text-on-surface placeholder:text-slate-600 transition-all font-medium resize-none" placeholder="Describe the vibe..." rows={3} defaultValue={""} />
                            </div>
                            {/* Privacy Type - Segmented Control */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold tracking-widest text-[#5affe1] uppercase ml-1">Privacy Type</label>
                                <div className="flex p-1.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                                    <label className="flex-1 cursor-pointer">
                                        <input defaultChecked className="hidden peer" name="privacy" type="radio" />
                                        <div className="text-center py-2.5 rounded-xl text-sm font-bold transition-all peer-checked:bg-primary/20 peer-checked:text-primary text-slate-500 hover:text-slate-300">Public</div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input className="hidden peer" name="privacy" type="radio" />
                                        <div className="text-center py-2.5 rounded-xl text-sm font-bold transition-all peer-checked:bg-primary/20 peer-checked:text-primary text-slate-500 hover:text-slate-300">Friends</div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input className="hidden peer" name="privacy" type="radio" />
                                        <div className="text-center py-2.5 rounded-xl text-sm font-bold transition-all peer-checked:bg-primary/20 peer-checked:text-primary text-slate-500 hover:text-slate-300">Private</div>
                                    </label>
                                </div>
                            </div>
                            {/* Genre Tags */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold tracking-widest text-[#5affe1] uppercase ml-1">Genre Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    <button className="px-5 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold tracking-wide transition-all hover:bg-primary/30" type="button">Synthwave</button>
                                    <button className="px-5 py-2 rounded-full bg-surface-container-highest text-slate-400 text-xs font-bold tracking-wide transition-all hover:bg-surface-container-high hover:text-white" type="button">Lo-fi</button>
                                    <button className="px-5 py-2 rounded-full bg-surface-container-highest text-slate-400 text-xs font-bold tracking-wide transition-all hover:bg-surface-container-high hover:text-white" type="button">Techno</button>
                                    <button className="px-5 py-2 rounded-full bg-surface-container-highest text-slate-400 text-xs font-bold tracking-wide transition-all hover:bg-surface-container-high hover:text-white" type="button">Cyberpunk</button>
                                    <button className="px-5 py-2 rounded-full bg-surface-container-highest text-slate-400 text-xs font-bold tracking-wide transition-all hover:bg-surface-container-high hover:text-white" type="button">Ambient</button>
                                    <button className="px-5 py-2 rounded-full bg-surface-container-highest text-slate-400 text-xs font-bold tracking-wide transition-all hover:bg-surface-container-high hover:text-white" type="button">
                                        <span className="material-symbols-outlined text-sm align-middle">add</span>
                                    </button>
                                </div>
                            </div>
                            {/* Max Listeners & Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="block text-xs font-bold tracking-widest text-[#5affe1] uppercase">Max Listeners</label>
                                        <span className="text-xs font-bold text-white bg-primary/10 px-2 py-0.5 rounded">150</span>
                                    </div>
                                    <input className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" max={500} min={10} type="range" defaultValue={150} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-300">Allow Guest Control</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input className="sr-only peer" type="checkbox" defaultChecked />
                                            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-300">Location Visibility</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <div className="pt-8">
                                <button className="w-full py-5 bg-linear-to-r from-[#5affe1] to-[#2de2c5] text-on-primary font-black font-headline text-lg tracking-widest uppercase rounded-2xl shadow-[0_8px_30px_rgba(90,255,225,0.3)] active:scale-95 transition-all" type="submit">
                                    Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Decorative Floating Artist Card (Asymmetric Layout) */}
                    <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-64 rotate-3 opacity-80 hover:rotate-0 transition-transform duration-500">
                        <div className="glass-panel p-4 rounded-3xl border border-white/10 shadow-2xl">
                            <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                                <img alt="Music Visualizer" className="w-full h-full object-cover" data-alt="Abstract vibrant 3D wave patterns with cyan and magenta glowing edges on deep black background, cinematic wallpaper" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgEqXm6rH6pQYsqeQBDvp6IiiYLYGbrXz3YxhFC7kAm5jU7JGB5Jy4rMn7Pq_1d3wucXEySeSSSl4JkVG5QHOsY6Y7JGWU3Z52GlSathNS_k_MBPHvm9LMqXOHLOe3w8VM4AyMaI9SurPjR7nRC71p5waqHZwfCLlNU_qAYRYGcbGJq-OAkso0b5Nf2OjmaG7adX3YMCjEdfZFmUnCH5WYWUq2ONr4G4P9f_o3aTII7bBl3krfD21tq_qTzv4ZdDUEPyv2_yjNG_A" />
                                <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
                                <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Live Pulse</span>
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Upcoming Host</p>
                            <h4 className="text-white font-headline font-bold text-lg leading-tight">Project: Midnight</h4>
                        </div>
                    </div>
                </main>

                {/* Background Cinematic Texture */}
                <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
                    <div className="absolute inset-0 bg-[radial-linear(circle_at_center,rgba(90,255,225,0.05)_0%,transparent_70%)]" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB4hyvTWmIBnRkUYbUkzcg6KTDGrofRO8g1hdBCiXn68zNTau8AhrNiMhzSv6uyQyYi0XK1MQ6nira4cqN1g_tp8k4nGhGBZFgFCIydYMLI9vua2DIUNRrDaZfZGhf6NvwmgET0La8sEY0ZT92q0MGrEqghcO7jYeyQfNy5PR3-aVY6bgsuooOSjklgBLCQ4G-GL66qgMo8SqA_su2QJ_7h6Qaah0bI5e3H5zdF-Yy9xIVnjNnLqlV5BdpGdsP2U3GEPS5nU6d2a5w")' }} />
                </div>
                {/* Mobile Bottom NavBar (hidden on desktop) */}
            </div>
        </div>
    );
}
