import { Heart } from "lucide-react";

export default function HomePage() {
    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen overflow-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    .neon-glow {
                        box-shadow: 0 0 40px rgba(90, 255, 225, 0.08);
                    }

            .material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .bloom-shadow {
                        box-shadow: 0 0 40px rgba(90, 255, 225, 0.08);
                    }
                    .glass-panel {
                        backdrop-filter: blur(16px);
                        background: rgba(28, 32, 39, 0.4);
                    }
                    body {
                        background-color: #0f131b;
                        font-family: 'Manrope', sans-serif;
                        color: #dfe2ed;
                    }

            body {
                min-height: max(884px, 100dvh);
                }` }}
            />
            <div>
                {/* Main Content Canvas */}
                <main className="pt-6 md:pt-12 lg:pt-20 pb-32 px-4 md:px-6 lg:px-8 h-screen overflow-y-auto no-scrollbar">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 relative">
                        <div>
                            <div className="flex items-center gap-3 lg:gap-0 mb-4">
                                {/* Mobile Hamburger Menu */}
                                <button className="lg:hidden p-1 -ml-2 text-slate-400 hover:text-white" onClick={() => document.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'))}>
                                    <span className="material-symbols-outlined text-3xl">menu</span>
                                </button>
                                <h1 className="lg:text-4xl sm:text-3xl text-2xl font-extrabold font-headline tracking-tighter">Good evening, Alex</h1>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-5 py-1.5 rounded-full bg-surface-container-high text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-300">Calm</button>
                                <button className="px-5 py-1.5 rounded-full bg-surface-container-high text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-300">Energetic</button>
                                <button className="px-5 py-1.5 rounded-full bg-surface-container-high text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-300">Focus</button>
                            </div>
                        </div>
                        <div className="lg:flex hidden items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase cursor-pointer group">
                            <span>View My Analytics</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="trending_up">trending_up</span>
                        </div>
                    </div>

                    {/* Hero: Continue Listening */}
                    <section className="lg:mb-12 mb-5">
                        <div className="relative group overflow-hidden rounded-3xl h-auto md:h-80 bg-surface-container shadow-2xl flex flex-col lg:flex-row lg:items-center items-start">
                            {/* top header text */}
                            <div className="absolute inset-0 z-0">
                                <img alt="Hero background" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" data-alt="Vibrant abstract neon wave lines in deep purple and cyan colors, dark cinematic background, high energy visuals" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrGbD9rdY6kxLzCb9m7ClK285o1hlb3ONQcqem7MUafMBdX6EZiWLVYrw2HGt4PJmpm0Ie9tW6vS43aR7rcgLFcHw9lCOUcARLo7FJu3KbNKtNX7wBtoevioZFUQK3Ixf0ypzV3FzJ-Ph-C1wPxSGOLrJHIR2bFoB5f83A7-osxHtdt0qGChxxtnZn-Xh4YF-3BqgFbB2xFvskKaJtCGDgmGte2e3nAPOWvrcJuNFgd2xvpJBbR65svpbEMTAPRTzyHWg-PfcZePk" />
                                <div className="absolute inset-0 bg-linear-to-r from-surface via-surface/60 to-transparent" />
                            </div>

                            {/* resume and favourite */}
                            <div className="relative z-10 pl-4 pr-4 pb-4 md:pl-8 md:pr-6 lg:pl-12 max-w-2xl">
                                <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3 block">Continue Listening</span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tighter mb-4 leading-tight">Nocturnal Pulsar <span className="text-secondary opacity-80">Vol. 4</span></h2>
                                <p className="text-slate-300 text-lg mb-8 max-w-md font-medium leading-relaxed">The journey through the neon grid continues. Deep synths and heavy rhythmic basslines await your return.</p>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <button className="px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3.5 text-sm lg:text-base rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 flex items-center gap-1.5 md:gap-2 hover:scale-105 transition-transform">
                                        <span className="material-symbols-outlined fill text-xl lg:text-2xl" data-icon="play_arrow" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                        Resume Session
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Add to favorites"
                                        className="h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 shrink-0 rounded-full bg-surface-container-high border border-white/10 grid place-items-center text-primary focus-visible:ring-primary/40 transition-all"
                                    >
                                        <Heart className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* laptop */}
                            <div className="absolute right-12 bottom-0 top-0 hidden lg:flex items-center justify-center">
                                <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <img alt="Album Art" className="w-full h-full object-cover" data-alt="Album cover art featuring a lone neon tower in a foggy cyberpunk city at night, moody lighting, futuristic aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbo8eFxO9NTvVHr1NraLXz0PPQRBveYsB5vO_JBwb4-Vv_Sla3c0HDGP-i-gd3NV2fnyXVvzIJhyw9l--BrEfvkOw3QfFL2iNu4kE92KAkCLGzBd09Fd1VH6fw_nf9NGCwVDyFR9Cbp6Yp8gej06fkNfyEDomKjQqz3f1RaS9_9DXPzQZdMlwo5KFjvm48zYB6zk6KOfMRKSR-ul5h8jR1bnNcXcfBz9U0lrmTuVmTwpfqnADQx2ubqh3O9a4pfz4QVdffed3It_0" />
                                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                                </div>
                            </div>

                            {/* Tablet album art (medium) */}
                            <div className="hidden md:flex lg:hidden absolute right-8 bottom-4 items-center">
                                <div className="w-40 h-40 rounded-xl overflow-hidden shadow-md">
                                    <img alt="Album Art" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbo8eFxO9NTvVHr1NraLXz0PPQRBveYsB5vO_JBwb4-Vv_Sla3c0HDGP-i-gd3NV2fnyXVvzIJhyw9l--BrEfvkOw3QfFL2iNu4kE92KAkCLGzBd09Fd1VH6fw_nf9NGCwVDyFR9Cbp6Yp8gej06fkNfyEDomKjQqz3f1RaS9_9DXPzQZdMlwo5KFjvm48zYB6zk6KOfMRKSR-ul5h8jR1bnNcXcfBz9U0lrmTuVmTwpfqnADQx2ubqh3O9a4pfz4QVdffed3It_0" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Nearby Active Rooms (Asymmetric layout) */}
                    <section className="lg:mb-12 mb-5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold font-headline tracking-tight">Nearby Active Rooms</h3>
                            <a className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors" href="#">See all local hubs</a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Room Card 1 */}
                            <div className="glass-panel p-6 rounded-3xl group cursor-pointer hover:bg-surface-container-high transition-all duration-300 flex flex-col justify-between h-56">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined" data-icon="sensors">sensors</span>
                                        </div>
                                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest px-2 py-1 bg-secondary/10 rounded">0.4 km away</span>
                                    </div>
                                    <h4 className="text-xl font-bold font-headline tracking-tight group-hover:text-primary transition-colors">Electric Dreams Lounge</h4>
                                    <p className="text-slate-400 text-sm mt-1">Listening to: Synthwave Essentials</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        <img className="w-8 h-8 rounded-full border-2 border-surface object-cover" data-alt="Face of a woman smiling subtly" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABGAA5f7C83phYAQofomDDJJ9kfuGOmW6ydu_NiV86vrL-w9EfyWgCE39NMROSZuPSLQKnO9dTnKvKRgxqN1JKOx1bpsUfC3rwc_td-G6NoYfWcAhiBwSlHOcaomF080d6z-U1pfCoNyEphvaxFreZaJ5vI0LZ_4p0Yufs_ZrMYXG_SLGyXFZUVgHMapSfYtvLVzuo5aISglZ-9M0GBdpWkJY5b88CieTsV9u290pOQ6dwmUXYTTxOY9dMS5ed5Xw2btPvfd1IUbg" />
                                        <img className="w-8 h-8 rounded-full border-2 border-surface object-cover" data-alt="Face of a young man with glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo3U1R0i7poQZmwNdClq-QFMZfkULtoi2oTMRIeO4M9ef0xj_kZ1LS4naxE4TjNBhjPM_qQZzjM-zYrngjXpHTQjjSH8VrMT_i_LRoaw0VjdrAxiDAFG7EKFT14GG-cWuCBBvuBGdtrq-JEqItPsdM0q3OZu8XXi9UEuEFcdBpXnmV59fWE2igMPqqJnAgGKZB1BT9536HRoVbtbOHAMe2d5bheeCVKifrgm3AHKJRbPpl_Vd2uQXyf6TWHoOi5yKzXWo4xls26jY" />
                                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">+12</div>
                                    </div>
                                    <button className="text-primary font-bold text-xs uppercase hover:underline">Join Now</button>
                                </div>
                            </div>

                            {/* Room Card 2 */}
                            <div className="glass-panel p-6 rounded-3xl group cursor-pointer hover:bg-surface-container-high transition-all duration-300 flex flex-col justify-between h-56 border-l-4 border-primary">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined" data-icon="podcasts">podcasts</span>
                                        </div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/10 rounded">Live Session</span>
                                    </div>
                                    <h4 className="text-xl font-bold font-headline tracking-tight group-hover:text-primary transition-colors">The Vinyl Vault</h4>
                                    <p className="text-slate-400 text-sm mt-1">Hosting: DJ Midnight</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                        <span className="material-symbols-outlined text-sm" data-icon="group">group</span>
                                        <span>42 listeners</span>
                                    </div>
                                    <button className="bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary hover:text-on-primary transition-all">Join Live</button>
                                </div>
                            </div>

                            {/* Room Card 3 */}
                            <div className="glass-panel p-6 rounded-3xl group cursor-pointer hover:bg-surface-container-high transition-all duration-300 flex flex-col justify-between h-56">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded">2.1 km away</span>
                                    </div>
                                    <h4 className="text-xl font-bold font-headline tracking-tight group-hover:text-primary transition-colors">Urban Echoes</h4>
                                    <p className="text-slate-400 text-sm mt-1">Lo-fi beats for reading</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        <img className="w-8 h-8 rounded-full border-2 border-surface object-cover" data-alt="Portrait of a smiling young man" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCphFvmbnnHDTs973aB1ttFrfeQQmikIvSprY3VhCOPl68ZJ48UxIfNxACkV9yjyEwV7hlKpYlsK7KpJxz3iKNQ8oHyPND2oWYEsvRJgfe5hnVdDrEHb4SD9Vt8N0khew8PJTme6Wj_a7FFT1sqxv1WDBQhHNnRrZtFwzdpjE79fnhq_jfM9JVrxNinbHbItwIBSelGoOmmnY9j__cogIpYp0xwfN8zZFIM5_oV8LwlFmf2UPZqqcmXRjZZDIJNMBxFKyjZyveixKA" />
                                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">+8</div>
                                    </div>
                                    <button className="text-primary font-bold text-xs uppercase hover:underline">Explore</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recommended for You (Song Grid) */}
                    <section className="lg:mb-12 mb-5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold font-headline tracking-tight">Recommended for You</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {/* Song 1 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                    <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Vivid macro photograph of a retro microphone with soft pink and blue lighting bokeh in background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_8JRE5E1SJ3i1vvh4M-gZo2WAcKNQkJ5-47aGCTQ2tx4QurxI6hACplvnE9IbFmBI4UB_Wja10pxm6HJ92xljXuNI0oKd_Ss7rcbOxICW3OCfz03Q-3PUFEvQFKXQpt_Jkb0gxGXXFOtI4dOQnMYmd9qpr2x2-QA5q4vXShhc8YXJt45GlbgQu6JCxq0V5kZ0vu3JKn2CXEzhyd6cwQs2z2QzPrqTfib-qZCq4YrnATzooqJfO0tgroAN5qllWkXCd0d8P7cepDI" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <span className="material-symbols-outlined fill" data-icon="play_arrow" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="font-bold text-sm truncate">Crystal Visions</h5>
                                <p className="text-xs text-slate-500 truncate">Lumina Ray</p>
                            </div>
                            {/* Song 2 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                    <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="A silhouette of a DJ at a turntable with bright stage lights and smoke in the background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkJlkCra27ghHx-qpCIdufBR_dmwMMLype7Vo2wuDkSZIQxIR7n-REzqDz7p6IJ8R6JTsPwykQoguAk5zhyXNYrPV1tfxjBvkf4RF_e49YzeTiNuj8rYFPoe0SXM8dA_f1sr3j703jHwXDLZxaSCvJV4_gRsnHQgSOjw4R-PrUY8AOo13pIsv74iYK-TzHgM-eGUrUN5AGzLaQA9zYGmoLTH4WwL0VVjUsTeEcHFMgElQXe9OOR-Jg0h95Wu6bjIow9oFi6bKNWCM" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <span className="material-symbols-outlined fill" data-icon="play_arrow" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="font-bold text-sm truncate">Midnight Drift</h5>
                                <p className="text-xs text-slate-500 truncate">Neon Ghost</p>
                            </div>
                            {/* Song 3 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                    <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Abstract vibrant geometric shapes glowing in electric blue and magenta against dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPReeMfeVK3MfPb9qmbkkuf2zQ5MMSTHVVfHKDLRLaKxTja7IxNYzeD2XHZ45PQASddjE5S4pz-6dyg5vr_fLALzhDGxSurfM_rh77ApVH-pbofsyQh1oAGiylIs8zTnSXFGZO--RCqOzyUWt48zGZ53LJV5G9tmlCk7SmbxdH4SZ9ubkx5-OtwlkByp6_0KTbynoxk428XIOUnHm2gbyQd2vuC2UXGsICEr-PKiJ80LjKH009_YwbihGfWq1MtVqKbe5a7VPQJww" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <span className="material-symbols-outlined fill" data-icon="play_arrow" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="font-bold text-sm truncate">Pulse Frequency</h5>
                                <p className="text-xs text-slate-500 truncate">Static Void</p>
                            </div>
                            {/* Song 4 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                    <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Low-angle view of rain-slicked city streets reflecting neon signs at night in a futuristic metropolis" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDKiYUPJuPzE_LkJ_y4XJM463SqNShrBpPwQ2ooDC5y1Fu9Wg836LDHzf3UrgU7oSSOE_H1QwEynAd6z6QZLMYmQjGspj-CVzzNU3ggCCEiJK9ojnlA4apd6GmnDzNcLQmxPzsM4vxGGHkNdGhXheDK4-AVUK_o50cOGMkNf9U1MEHwwbe6iV86_ABGAWjOsabDixK5Yo99FebxTFMkrNZ8mXvAxrQ_ZL1FSvvQYoldAC7gjMuwVojhpM9qt65Q2sar2oMDat6bMU" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <span className="material-symbols-outlined fill" data-icon="play_arrow" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="font-bold text-sm truncate">Chrome Horizon</h5>
                                <p className="text-xs text-slate-500 truncate">Vector 77</p>
                            </div>
                            {/* Song 5 */}
                            <div className="group cursor-pointer">
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                    <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Creative swirling abstract oil painting style textures with bright teals and purples" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM43nP1fjOgE-WhYQcRWvTdYOPj-TDF8r6uxUllrySOag2qFuEn6UVQcgwuErqAzPZ-MA7LIbCVX6OUCNeZ1vayDNJUE3g-3r1LiALNojUPZxK2ZDmdbteXHd6xiTQz4eLfl-xjCCCxt79X1BYpD-nC8ySU5NPSbP8-1VXiOiHk65SrZoqUV9BO_NEnwH_OGaKtdrXKwfGwLfIpn9gFgTqJOpNIpVOPYzEEnIXsR8U2I85IBXRy8gdK-PvMGd-7S1fVL778iJmAKw" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <span className="material-symbols-outlined fill" data-icon="play_arrow" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="font-bold text-sm truncate">Liquid Ether</h5>
                                <p className="text-xs text-slate-500 truncate">Orbit Flux</p>
                            </div>
                        </div>
                    </section>

                    {/* Mood-based Mixes */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold font-headline tracking-tight">Mood-based Mixes</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-6 gap-3">
                            <div className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer">
                                <img className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" data-alt="Warm indoor setting with soft yellow string lights and a cup of steaming coffee on a wooden table" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7SaCcX9NgQKnI7MO0jndNmWGq-ORNXN3Km6ifQSlftRfRFLxKjCKDI70DJ1q1dbBxEcasMn12U_tFSv97XS7FrPBGTpS4VGZ9KcEPqzR60q9ilSfmNUlmtflg8fVE_p-zuZAqzh0QO3nKI26seEv6xWjEdlYBdpFjfAwYEyPkuNNv7mw9dp2pREIG7wEkz3TjB9E29zPZyxD17VTu1sfHAWc-byiBbz6UC7KA6z04TgkOPChoe4ApZ9-bqrHHiYulAXtcaytt9PM" />
                                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-linear-to-t from-black/80 to-transparent">
                                    <h4 className="text-3xl font-extrabold font-headline tracking-tighter">Slow Morning</h4>
                                    <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">Lo-fi &amp; Acoustic</p>
                                </div>
                            </div>
                            <div className="relative h-48 rounded-3xl overflow-hidden group cursor-pointer">
                                <img className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" data-alt="Explosion of colored powder in a stadium concert with dramatic lasers and lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnQN1TSFDD4tl8Cm2FeyDV7Pz6W9EjZ4F4Q3o93J6e2LtWLomy-DSuSOHGE62xq-uVsP9ceMsHyQm1VjXodbYnYQ9xKZFMW8MvEggDL9Vh4qCFEq93SV18rXHQHk4ym5QiiUsxdZ8LGxHMo06HtuYWuGbrjVivFDtLye5mbsHxfauRTJbsKkj2XGdVxRSccaRWX2FJMQqNreWQfJp-t1gEit9OPJK4ClQ1jd56BvV-AsWROaVmmNcAVwJZmuLPXGo6lTKF9-E2HxQ" />
                                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-linear-to-t from-black/80 to-transparent">
                                    <h4 className="text-3xl font-extrabold font-headline tracking-tighter">Ultra Energy</h4>
                                    <p className="text-secondary font-bold text-xs uppercase tracking-widest mt-1">Techno &amp; House</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
