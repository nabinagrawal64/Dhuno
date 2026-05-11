
export default function LiveSessionPage() {
    return (
        <div className="bg-surface-dim text-on-surface font-body min-h-screen overflow-hidden selection:bg-primary/30">
            <style dangerouslySetInnerHTML={{
                __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .neon-glow {
                        text-shadow: 0 0 10px rgba(90, 255, 225, 0.5);
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    /* Custom scrollbar for sidebar sections */
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(90, 255, 225, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(90, 255, 225, 0.4);
                    }

            .material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .bg-glow-radial {
                        background: radial-linear(circle at 50% 50%, rgba(90, 255, 225, 0.15) 0%, transparent 70%);
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    ::-webkit-scrollbar {
                        display: none;
                    }

            body {
                min-height: max(884px, 100dvh);
                }` }} 
            />
            <div>
                {/* TopAppBar */}
                <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0f131b]/60 backdrop-blur-lg shadow-[0_0_40px_rgba(90,255,225,0.04)] border-b border-white/5">
                    <div className="flex items-center gap-8">
                        <span className="text-[#5affe1] font-['Sora'] font-black italic tracking-tighter text-xl" style={{}}>Nocturne Live</span>
                        <div className="hidden md:flex gap-6 items-center">
                            <a className="text-[#5affe1] border-b-2 border-[#5affe1] pb-1 font-['Sora'] tracking-tight font-bold text-sm" href="#" style={{}}>Live</a>
                            <a className="text-slate-400 font-['Manrope'] hover:text-[#92ccff] transition-colors duration-300 text-sm" href="#" style={{}}>Discover</a>
                            <a className="text-slate-400 font-['Manrope'] hover:text-[#92ccff] transition-colors duration-300 text-sm" href="#" style={{}}>Library</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-[#92ccff] transition-colors" style={{}}>
                            <span className="material-symbols-outlined" style={{}}>settings</span>
                        </button>
                        <button className="text-slate-400 hover:text-[#92ccff] transition-colors" style={{}}>
                            <span className="material-symbols-outlined" style={{}}>more_vert</span>
                        </button>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-primary/20">
                            <img alt="Host profile" className="w-full h-full object-cover" data-alt="Host profile portrait with colorful ambient lighting reflecting off skin" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTHD5H_cHZD1_bMof-AzxcllH-wPDJO0Ck9o3QW38IE1lId17-SW_ElEqM7249EAdhncHuKUcx0NY594RNavFf5opZJ9djWZNrbvZSzraz3NbXhIKCWUBCqT1tUzxRr_s0cH5uE8Yp3IykqM75ZAVlsTz4vTSK-iilGCfzKay1yp5fZ5RduLF49i5oMTbTkud7MtBOgF1K2HljnltauR69ILsFNmVSZ_nr7X2XyTQIusJhRbZa8sUOVtz-D0ibY1Y9p9PPUVC6tfg" style={{}} />
                        </div>
                    </div>
                </nav>

                {/* Expanded SideNavBar */}
                <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] z-40 flex flex-col bg-[#1c2027]/40 backdrop-blur-xl w-96 shadow-2xl border-l border-primary/10">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-1" style={{}}>Session Live</h3>
                        <div className="flex justify-between items-center">
                            <h2 className="font-headline font-bold text-base text-on-surface truncate" style={{}}>Midnight Jazz Lounge</h2>
                            <div className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-primary" style={{}}>In Sync</span>
                            </div>
                        </div>
                    </div>
                    {/* Segmented Tab Navigation */}
                    <div className="flex px-4 pt-4 gap-1">
                        <button className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-primary border-b-2 border-primary" style={{}}>Chat</button>
                        <button className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors" style={{}}>Queue</button>
                        <button className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors" style={{}}>Participants</button>
                    </div>
                    {/* Interactive Content Area (Chat View) */}
                    <div className="flex flex-col grow overflow-hidden">
                        {/* Chat Feed */}
                        <div className="grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            <div className="flex gap-3">
                                <img alt="User" className="w-8 h-8 rounded-full shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHDhT-9iEPtq5ONIC_8XjEG869z4nYpSWF1Rp1XTusImJPn20rUMilwu7uutrDJwse7W1ErDGM-8FXau8iNkrVdGYtnV6nkZVLLfVcmIttprDW36mnSwhPlwDiTcnjxggFjzs4cJvUh695mgL6GC0WOFGRgrAadZ5yFzlCvh8kn9v3jcbNf-xyZnYoFPvJ9mIKZUt3Ehe1hX3donq4lHX0OvHLNOYTXGqKXVX3anYFDfhgRT0J6_InKYsYnYEd3asG43onMSRiOKY" style={{}} />
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-secondary" style={{}}>DJ Midnight</span>
                                        <span className="text-[9px] text-slate-500" style={{}}>10:42 PM</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1 leading-relaxed" style={{}}>Welcome to the lounge everyone. Enjoy the vibes tonight!</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-sm text-primary" style={{}}>person</span>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-on-surface" style={{}}>SynthFan_99</span>
                                        <span className="text-[9px] text-slate-500" style={{}}>10:44 PM</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1 leading-relaxed" style={{}}>This track is absolute fire. Anyone know the producer?</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-sm text-secondary" style={{}}>person</span>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-on-surface" style={{}}>NeonDrifter</span>
                                        <span className="text-[9px] text-slate-500" style={{}}>10:45 PM</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1 leading-relaxed" style={{}}>Synthwave Collective. It's from their new album.</p>
                                </div>
                            </div>
                            {/* Queue Sample (Hidden by default in actual tab logic, shown for structural edit) */}
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4" style={{}}>Up Next (Queue Preview)</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <img alt="Art" className="w-10 h-10 rounded-md object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSbHz2NW8xU09QOKSv6_J9bqi0yeiqHsEzucVYCPlG7mk6nfAnu6dd2LDfhqyIwv2oXTSwrDK_4txi8T2DUA1k5TZTrnLlfVjg23ui4bSuATtXV9oSnz_zqmsZBamB1D1zqzvhxh_G1UsjBAInbrjAFu2iT8OaSxzQpkJOlx1S72VDpDeHcASzWc5bnlIFcaHyBXEPmwC160Qp2EhiEP76maZTDBcXG-7I2_gU_Ub0ui-v4xNLZVU8bTgPP7qihdrNVo_tr4AzTJM" style={{}} />
                                        <div className="grow min-w-0">
                                            <p className="text-xs font-bold text-on-surface truncate" style={{}}>Synthetic Dreams</p>
                                            <p className="text-[10px] text-slate-500 truncate" style={{}}>Vapor Runner</p>
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-600" style={{}}>03:45</span>
                                    </div>
                                </div>
                            </div>
                            {/* History Sample */}
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4" style={{}}>Played Recently</h4>
                                <div className="space-y-4 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-600" style={{}}>music_note</span>
                                        </div>
                                        <div className="grow min-w-0">
                                            <p className="text-xs font-bold text-on-surface truncate" style={{}}>Cyber Dawn</p>
                                            <p className="text-[10px] text-slate-500 truncate" style={{}}>Grid Master</p>
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-600" style={{}}>10:35 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Chat Input Area */}
                        <div className="p-4 bg-[#0f131b]/80 border-t border-white/5">
                            <div className="relative group">
                                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary/50 placeholder:text-slate-600 outline-none transition-all group-hover:border-white/20" placeholder="Type a message..." type="text" />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container p-2 transition-colors" style={{}}>
                                    <span className="material-symbols-outlined text-xl" style={{}}>send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Invite Friends Button (Bottom Fixed) */}
                    <div className="p-4 mt-auto">
                        <button className="w-full py-3 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(90,255,225,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2" style={{}}>
                            <span className="material-symbols-outlined text-lg" style={{}}>person_add</span>
                            Invite Friends
                        </button>
                    </div>
                </aside>

                {/* Main Canvas */}
                <main className="fixed left-0 top-16 right-96 bottom-0 overflow-y-auto p-12 bg-linear-to-br from-surface-dim to-background custom-scrollbar">
                    {/* Room Header Section */}
                    <header className="flex justify-between items-end mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter rounded border border-primary/20" style={{}}>Host Mode</span>
                                <span className="text-slate-400 text-xs font-medium" style={{}}>Session ID: #MNC-492</span>
                            </div>
                            <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface mb-2" style={{}}>Midnight Cyberdeck Sessions</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <img alt="DJ Midnight" className="w-6 h-6 rounded-full object-cover border border-primary/30" data-alt="Portrait of a modern DJ with neon highlights and cyberpunk accessories" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHDhT-9iEPtq5ONIC_8XjEG869z4nYpSWF1Rp1XTusImJPn20rUMilwu7uutrDJwse7W1ErDGM-8FXau8iNkrVdGYtnV6nkZVLLfVcmIttprDW36mnSwhPlwDiTcnjxggFjzs4cJvUh695mgL6GC0WOFGRgrAadZ5yFzlCvh8kn9v3jcbNf-xyZnYoFPvJ9mIKZUt3Ehe1hX3donq4lHX0OvHLNOYTXGqKXVX3anYFDfhgRT0J6_InKYsYnYEd3asG43onMSRiOKY" style={{}} />
                                    <span className="text-sm font-semibold text-secondary" style={{}}>DJ Midnight</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-sm text-slate-400" style={{}}>42 Listeners</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-2 rounded-full border border-error/30 text-error text-xs font-bold uppercase tracking-widest hover:bg-error/10 transition-colors" style={{}}>
                                Leave Room
                            </button>
                        </div>
                    </header>
                    {/* Player & Request Section */}
                    <div className="grid grid-cols-12 gap-8 items-start">
                        {/* Cinematic Player */}
                        <div className="col-span-8 group">
                            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500">
                                <img alt="Album Visualizer" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" data-alt="Cinematic synthwave aesthetic landscape with neon skyscrapers and digital grid floor in shades of cyan and purple" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgzxwdq_CGx333RpeZjUQJRFCbQ6G1obzqZlGstQSqq8NMVdyy-WAoXvxG8K6ZOXuBqOvA2neHhiRsz50cJsmbuHZRgtnSxpMKW5Mi5x8sLW8JMs7Zq_Y3X9nyXe6xUNK4lVRTBqVYwoswf49YYvM50vtFCDKNxt25YNXNQl_6-CPpzp5kpSfd6J8jPDYTo1OH7m9fA9xuZ8KIvBP0tSj8PxxIbZi7MJ-YvVQ3XwulF_0MshdjOU5SYpVPdSjkA-3wxMN6CJIBZnE" style={{}} />
                                {/* Overlay Glows */}
                                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />
                                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                                {/* Metadata Bottom Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
                                    <div className="grow">
                                        <h2 className="text-4xl font-headline font-bold text-white mb-1 tracking-tight" style={{}}>Neon Skyline</h2>
                                        <p className="text-primary font-medium text-lg" style={{}}>Synthwave Collective</p>
                                    </div>
                                    {/* Visualizer Graphic */}
                                    <div className="flex items-end gap-1 h-12 pb-2">
                                        <div className="w-1 bg-primary/40 h-1/2 animate-pulse" />
                                        <div className="w-1 bg-primary/60 h-3/4" />
                                        <div className="w-1 bg-primary h-full" />
                                        <div className="w-1 bg-primary/70 h-2/3" />
                                        <div className="w-1 bg-primary/30 h-1/3" />
                                    </div>
                                </div>
                            </div>
                            {/* Playback Controls */}
                            <div className="mt-8 glass-panel p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-6">
                                        <button className="text-slate-400 hover:text-primary transition-colors" style={{}}>
                                            <span className="material-symbols-outlined text-2xl" style={{}}>shuffle</span>
                                        </button>
                                        <button className="text-on-surface hover:text-primary transition-colors" style={{}}>
                                            <span className="material-symbols-outlined text-3xl" style={{}}>skip_previous</span>
                                        </button>
                                        <button className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-[0_0_30px_rgba(90,255,225,0.4)] hover:scale-105 transition-transform active:scale-95" style={{}}>
                                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>pause</span>
                                        </button>
                                        <button className="text-on-surface hover:text-primary transition-colors" style={{}}>
                                            <span className="material-symbols-outlined text-3xl" style={{}}>skip_next</span>
                                        </button>
                                        <button className="text-slate-400 hover:text-primary transition-colors" style={{}}>
                                            <span className="material-symbols-outlined text-2xl" style={{}}>repeat</span>
                                        </button>
                                    </div>
                                    {/* Progress Bar Section */}
                                    <div className="grow">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[10px] font-bold text-primary font-mono tracking-widest uppercase" style={{}}>02:45</span>
                                            <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase" style={{}}>04:12</span>
                                        </div>
                                        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="absolute top-0 left-0 h-full w-[65%] bg-linear-to-r from-primary to-secondary shadow-[0_0_10px_rgba(90,255,225,0.5)]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="material-symbols-outlined text-slate-500" style={{}}>volume_up</span>
                                        <div className="w-24 h-1 bg-white/10 rounded-full relative">
                                            <div className="absolute top-0 left-0 h-full w-[80%] bg-white/40 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Bento Card Right Side */}
                        <div className="col-span-4 space-y-6">
                            {/* Request Track Card */}
                            <div className="bg-linear-to-br from-primary/10 to-secondary/10 p-6 rounded-2xl border border-primary/10 relative overflow-hidden group h-full flex flex-col justify-center">
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl transition-transform group-hover:scale-150" />
                                <h4 className="text-primary text-xs font-bold uppercase tracking-widest mb-2" style={{}}>Request Box</h4>
                                <p className="text-sm text-slate-300 mb-4 leading-relaxed" style={{}}>Drop a track for DJ Midnight to spin in the next set.</p>
                                <div className="flex gap-2 relative z-10">
                                    <input className="grow bg-background/50 border border-white/5 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary placeholder:text-slate-600 outline-none" placeholder="Search tracks..." type="text" />
                                    <button className="bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-container transition-colors" style={{}}>
                                        <span className="material-symbols-outlined text-sm" style={{}}>add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Visualizer Background Decor */}
                <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none z-[-1] overflow-hidden opacity-20">
                    <div className="absolute inset-0 bg-linear-to-t from-primary/30 to-transparent" />
                    <div className="flex items-end justify-between w-full h-full px-4 gap-1">
                        <div className="w-full h-32 bg-primary/40 rounded-t-full scale-y-50" />
                        <div className="w-full h-48 bg-primary/50 rounded-t-full scale-y-75" />
                        <div className="w-full h-64 bg-primary/60 rounded-t-full scale-y-100" />
                        <div className="w-full h-40 bg-primary/50 rounded-t-full scale-y-60" />
                        <div className="w-full h-56 bg-primary/40 rounded-t-full scale-y-80" />
                        <div className="w-full h-32 bg-primary/30 rounded-t-full scale-y-40" />
                    </div>
                </div>
            </div>
        </div>
    );
}
