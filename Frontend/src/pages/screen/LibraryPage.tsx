import { Heart } from "lucide-react";

export default function LibraryPage() {
    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    body {
                        background-color: #0f131b;
                        font-family: 'Manrope', sans-serif;
                        color: #dfe2ed;
                        min-height: max(884px, 100dvh);
                    }`,
                }}
            />

            <main className="pt-6 md:pt-12 lg:pt-20 pb-32 px-4 md:px-6 lg:px-8 h-screen overflow-y-auto no-scrollbar">
                <section className="md:mb-5 mb-2">
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
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tighter">
                                Library
                            </h1>
                        </div>
                    </div>
                </section>

                <section className="mb-5 md:mb-8 flex flex-wrap gap-3">
                    <span className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-bold">
                        Playlists
                    </span>
                    <span className="px-5 py-2 rounded-full bg-surface-container-high text-slate-400 text-sm font-semibold">
                        Artists
                    </span>
                    <span className="px-5 py-2 rounded-full bg-surface-container-high text-slate-400 text-sm font-semibold">
                        Albums
                    </span>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-14">
                    <div className="xl:col-span-4">
                        <div className="rounded-3xl p-8 bg-gradient-to-br from-[#ffb8bb]/20 via-[#0f131b] to-[#1c2027] relative overflow-hidden border border-white/5 min-h-[260px] flex flex-col justify-between">
                            <div>
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-tertiary-container to-secondary flex items-center justify-center mb-6 shadow-lg">
                                    <Heart className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold font-headline mb-2">
                                    Liked Songs
                                </h2>
                                <p className="text-slate-300 font-medium">
                                    1,248 tracks saved
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <span>Play Everything</span>
                                <span className="material-symbols-outlined">
                                    play_arrow
                                </span>
                            </div>
                            <div className="absolute -right-10 -bottom-10 opacity-10 blur-2xl w-64 h-64 bg-tertiary-container rounded-full" />
                        </div>
                    </div>

                    <div className="xl:col-span-4">
                        <div className="glass-panel h-full rounded-3xl p-8 border border-dashed border-white/10 flex flex-col items-center justify-center text-center min-h-[260px] hover:bg-surface-container-high/60 transition-all">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-primary text-4xl">
                                    add
                                </span>
                            </div>
                            <h2 className="text-xl font-bold font-headline mb-1">
                                Create Playlist
                            </h2>
                            <p className="text-sm text-slate-500">
                                Organize your auditory journey
                            </p>
                        </div>
                    </div>

                    <div className="xl:col-span-4 space-y-4">
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary">
                                        download_for_offline
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold">Downloads</h3>
                                    <p className="text-xs text-slate-500">
                                        42 albums • 12GB
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-500">
                                chevron_right
                            </span>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">
                                        history
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold">Recently Played</h3>
                                    <p className="text-xs text-slate-500">
                                        Last played 2m ago
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-500">
                                chevron_right
                            </span>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold font-headline tracking-tight">
                            Your Playlists
                        </h2>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg bg-surface-container-high text-on-surface">
                                <span className="material-symbols-outlined text-sm">
                                    grid_view
                                </span>
                            </button>
                            <button className="p-2 rounded-lg text-slate-500 hover:bg-surface-container-high transition-colors">
                                <span className="material-symbols-outlined text-sm">
                                    format_list_bulleted
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                        {[
                            {
                                title: "Midnight Cyberpunk",
                                meta: "142 tracks",
                                updated: "Updated 2h ago",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu8lvQVyp6jbZMWRrKn6xWgOXVIecWPWLarzZHQ2vV08ODDDJuOGTxO8X_7HTwuy1zhWYBgHEh24pgMFhXY97BvsM2pWzXlPST-vqPaMElmK3dL6R-kumtd3cQEpX34ONUjW2avLGbzqPia46V_i4BdBm-7r_40CZk-FFgWLg8BFNwXyiz63qLsuwSutfEv5QhDuMoK3maNbvyJHK_pLH9adbvZZc1LqViOASWtXLL8INdtHXJyL34WmP2YSqowwm6BQQhP2ZHEgg",
                            },
                            {
                                title: "Ethereal Focus",
                                meta: "85 tracks",
                                updated: "Updated 1d ago",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXTDuEZTLaVcH-hnasinvt0laiH-VVeeo1lBlLXns93A2Nhy83upfT51IQS8b0YLXUryFZZnvqeur7QZNz8CSGLRT465-57qnFbowz5YvO4ntj1vccJcAYMaHAwgu04n2K6S9rbhG3RWNYllaMOt4AsEhH7hRb94BRbMJgcbWW2n1LQWs901630SL6nVo-GXzE40nQRmLanTvn5DHBIrp4mZsZ8C8vhchA7hBU_L-HfXsLb_sK_kWcLrZQpKY2ngNpMI-Uj4QOzLU",
                            },
                            {
                                title: "Heavy Bass Theory",
                                meta: "210 tracks",
                                updated: "Updated 4d ago",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiq-YTxCTVB1BSfm8xmdsZg58XYCxZMD23Kgo1CBXm_bqrnSWmOKKVuMeHLEMzGSAzr7h1SlAUopVk29UBAXtE2pdnKbvLaPK-_le9XGI9XmLYSSrZiYYJjbAQ-S2ul3hRcTXJg1CYBTMZK206w3kmjlTkeFOJ1dJXarg19XWpqJ3XiXL5ekiWz5P0m9dBL5RFmQtH_Ao4RYpTW3mjyHONl95hGd6AMzpOmxdaLWz26nDSK7x_ayHXqhdlzPuhFXa4QCfRmfKBeNY",
                            },
                            {
                                title: "Summer Rewind '23",
                                meta: "350 tracks",
                                updated: "Updated 1w ago",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS5ESHrusOd-UzFI_toM7sWxjkVW-jqr3jLOwbd4uc_-ltOrg-Qy8HPz-rdaEoOZa88DOgINsPrOLGVcBWjy74PSMrXv1ajHS9C-VkEFJSYIYZMP13eP-hTfP2qS276hoH6IXXfDQcqaLvVDLW0S5H5bXpCOOEmFkCAuTLxRFQOXXV9gV_y6NvV0qkFwcGuAUOibW77Au34qFL8pm4EPYRqFXc0HKKQELzzRLlUSEGPI4Ir_2fynn2kL9GJ4WnOIK0ckUD6RY6UhY",
                            },
                            {
                                title: "Golden Era Jazz",
                                meta: "64 tracks",
                                updated: "Updated 2w ago",
                                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqPFNkVz5KYuDFwOXohvmZlpMsJMUjAyH1B1BaImjqR_WJZFKHp4lr1BHFIb1cvO-2za_59qJjXh_IP9ZIFJqgUGNs5Hye5i0UV-umoa_1Zf0_B_c8-NLncoeiCH1vbfvQLDZEzg7gANbgSucEb5gMq57VzBtpkyvlqHkXkkUpkny0swE7MeejuP4pmhcljVCS67KEvU5GF6DwytQXt2R9wUhCpMTHoXeUjkZwG6EPfYipiScl5Ja_BvsXxf4CjJm9A8pa-iu-pCE",
                            },
                        ].map((playlist) => (
                            <div key={playlist.title} className="group cursor-pointer">
                                <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative shadow-2xl">
                                    <img
                                        alt={playlist.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={playlist.image}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center scale-75 group-hover:scale-100 transition-transform">
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontVariationSettings: '"FILL" 1' }}
                                            >
                                                play_arrow
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-bold truncate">{playlist.title}</h3>
                                <div className="flex items-center justify-between mt-1 gap-3">
                                    <span className="text-xs text-slate-500">
                                        {playlist.meta}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-tight text-slate-600">
                                        {playlist.updated}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
