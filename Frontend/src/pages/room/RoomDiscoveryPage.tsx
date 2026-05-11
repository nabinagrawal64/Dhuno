export default function RoomDiscoveryPage() {
    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                    }
                    .glow-shadow-primary {
                        box-shadow: 0 0 40px rgba(90, 255, 225, 0.08);
                    }
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    body {
                        min-height: max(884px, 100dvh);
                    }`,
                }}
            />

            <main className="pt-6 md:pt-12 lg:pt-20 pb-32 px-4 md:px-6 lg:px-8 h-screen overflow-y-auto hide-scrollbar">
                <section className="mb-10 flex flex-col gap-6">
                    <div className="flex items-start gap-3 md:gap-4">
                        <button
                            className="lg:hidden p-1 -ml-2 text-slate-400 hover:text-white shrink-0"
                            onClick={() =>
                                document.dispatchEvent(
                                    new CustomEvent("toggle-mobile-sidebar"),
                                )
                            }
                        >
                            <span className="material-symbols-outlined text-3xl">
                                menu
                            </span>
                        </button>

                        <div className="min-w-0 flex-1">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-headline tracking-tighter text-on-surface">
                                Rooms Discovery
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex bg-surface-container-lowest p-1 rounded-full border border-outline-variant/10">
                                <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                                    5km
                                </button>
                                <button className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-on-surface">
                                    10km
                                </button>
                                <button className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-on-surface">
                                    50km
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button className="px-4 py-1.5 rounded-full text-xs font-bold glass-panel border border-primary/20 text-primary">
                                    Public
                                </button>
                                <button className="px-4 py-1.5 rounded-full text-xs font-bold glass-panel border border-outline-variant/20 text-slate-400">
                                    Friends
                                </button>
                                <button className="px-4 py-1.5 rounded-full text-xs font-bold glass-panel border border-outline-variant/20 text-slate-400">
                                    Electronic
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 border border-white/5 w-fit">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold tracking-widest uppercase text-on-surface">
                                Live Network Active
                            </span>
                        </div>
                    </div>
                </section>

                <section className="mb-12 relative h-[320px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                    <div
                        className="absolute inset-0 bg-cover bg-center grayscale opacity-40 mix-blend-luminosity"
                        style={{
                            backgroundImage:
                                'url("https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop")',
                        }}
                    />

                    <div className="absolute inset-0 z-20 p-5 md:p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 border border-white/5">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs font-bold tracking-widest uppercase text-on-surface">
                                    Tokyo Grid
                                </span>
                            </div>
                            <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all">
                                <span className="material-symbols-outlined">
                                    my_location
                                </span>
                            </button>
                        </div>

                        <div className="absolute top-1/4 left-1/3 cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full animate-ping" />
                                <div className="w-8 h-8 rounded-full border-2 border-primary bg-surface-container flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-primary text-lg">
                                        headphones
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-1/2 left-2/3 cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 w-6 h-6 bg-secondary/20 rounded-full animate-pulse" />
                                <div className="w-6 h-6 rounded-full border-2 border-secondary bg-surface-container flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-secondary text-sm">
                                        music_note
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="glass-panel p-4 rounded-2xl border border-white/5 max-w-xs">
                                <p className="text-xs text-slate-400 mb-1">
                                    Current Focus
                                </p>
                                <h2 className="text-lg font-bold text-on-surface mb-2">
                                    Shibuya District
                                </h2>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    14 active rooms detected within 2km. Trending:
                                    <span className="text-primary"> #FutureFunk</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-2xl font-bold font-headline tracking-tight">
                            Nearby Experiences
                        </h2>
                        <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                            View All
                            <span className="material-symbols-outlined text-sm">
                                arrow_forward
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Neon Synthwave Hub",
                                location: "0.8 km away • Tokyo Central",
                                live: "1.2K LIVE",
                                track: "Midnight City — M83",
                                accent: "primary",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF9UG7Mt3BKMRv4Yhl7Z21-gSkW_RUYU67LbYndZJok50V4RIGmI2Ke28bvISfcct6hsQr9F1XJTJO1mUYTMdJ9g_c_klBfP4S8Hw2IvIFIQXMOCP6zW4HG48j7gvRXp_G7nkLoAVkdff7oL223wDYDJuWt4vrgi_PxqIxY2jMHExnJvs03qoTUI6NevBzGtArjo6c4kIWuRfpd4kOnC50cLNoNSI_SpE0wMhr03QvqkR8L9LldDpoy4yXtv2RfhfDi911_q2s7q4",
                                avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOcSAu_fXHEqSukLyqQ09MltL1D9PwN8bfQJdDcrnNUqCDTw-8H8FsFWrwo3G31Pbt_5h9EsmY9XyFYi5SCJJckmo0mzJRC9C_ONG9dHMwZFC6FYdimUEPH2-e7QVT6ziO_aHpjkrf5z-U8FlBdw0jhszeG11a-7wRgpQQHFYnYoIDzwDd70xeY0KNBbKv762WJBwpO7PgOwMnGhWDvIYEYc9q46_YE-TCZm3pgkKJEpWPrR5pAGe05aYbvMXHMVR5k13LYAx5q90",
                            },
                            {
                                title: "Lo-fi Rain Forest",
                                location: "2.4 km away • Harajuku",
                                live: "420 LIVE",
                                track: "Chill Vibes — Sleepy Fish",
                                accent: "secondary",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBApknpg1aOKKNOXSWGr5WwZCKjIdjvHHvpmq9j3eOX6P1ZGtf5NphmkCioXVnLb4D4_PGtHqIuQLWktMedRmNRStSun7OHqHL3rIMAHd2oNbcJb_i_IfPoNxazKFFFwJ_beogl6eUm-gZMJX7HJtv43u7Kuvgju3zEY3AWvO2_cNH9P8lMAfn-Mw0e2oCtNMitwkYPNABJ6yI67bMrKF4L1Yn6HdZaNcztLZytLtaoaSIYoBtMrZGK4MKRxpVzf9SIJPxYooIryp4",
                                avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyhVJYRmQhvK_tR0mQL58uFy9T6CR6eE5jRfpdrZM18mK-g6C2UTHS5Hp3hHPbOJLGyJUUQJUEPg_LO-dTcJWadW7OLGGoyIZCiTgSGX5J41c5bKCXDYoJnPBANsKNKaEGEDiNnW7osPjDvGy4lFeJMbFU9wv9ZXrhSNpUewFi4FNcKP_d1jXSttbOqz71HYBSoqYbeuKbYmvcIhwKxz2gZgkxysREwEzq099co-mxtO6xTkrOchwhCTyFvfh26E9SgW8tqL9MWY4",
                            },
                            {
                                title: "Underground Techno",
                                location: "5.1 km away • Shinjuku",
                                live: "3.5K LIVE",
                                track: "Acid Rain — Charlotte de Witte",
                                accent: "tertiary",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDy29iTNYajJOQmCAsWwOg9t0aOjD13pmmDki1mQn1MqqZnVR8WWOto69UEmFbmf460eWQUquKuYiwck67ZqYjtuqVT7tfBhczrvykq57Z6tbfqkkZ8bZVbUR-GvIWUi9lpqtHjfndI2F4KC9yHuLtRr7f3RuMwmy2guO1OXVVh5FGAO7zb3nC_ZWvU2yw91C1EdtuIqhQxtuLLIHrO_oSE_wtseSYpHHXUKRReuxz2p0VfCUsAsGqi1fBxHcVDM3gscTHDKP4P2ww",
                                avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeZ-tyhJPczyff47y5JyRYKMEvAQAiN0aqcy-_M3SEXBo1qnLGcGDLMSxDjvWVPPUI7rUnWBw4SMlh10pDEyNxuLnfr-G3GfPoOq8MMfWkAPLcSOeF0M8NXL4x7bUyuui-hj4EAmSuy8a8kRz3nnQsYRNI3sxTIAOTcT-jnoIobja8PTiR5jWXBPQC036WdVGSj76kRzG8Y_fxJbZRvmFcePjhLPa2iU9b-gh-PL3tJJWCK0e1STyBuQ2mESTL1JxWnWgsFzRskG8",
                            },
                        ].map((room) => (
                            <div
                                key={room.title}
                                className="group relative flex flex-col bg-surface-container/40 rounded-3xl overflow-hidden hover:bg-surface-container-high/60 transition-all duration-500 border border-transparent hover:border-primary/20 shadow-xl glow-shadow-primary"
                            >
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        src={room.image}
                                        alt={room.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[10px] font-bold text-on-surface tracking-wider">
                                            {room.live}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold font-headline mb-1 text-on-surface">
                                            {room.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="material-symbols-outlined text-xs">
                                                location_on
                                            </span>
                                            <span>{room.location}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6 flex items-center gap-3 glass-panel p-3 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden ring-1 ring-primary/30">
                                            <img
                                                className="w-full h-full object-cover"
                                                src={room.avatar}
                                                alt=""
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                Currently Playing
                                            </p>
                                            <p className="text-sm font-semibold text-primary truncate">
                                                {room.track}
                                            </p>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-full active:scale-95 transition-transform">
                                        Join Room
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
