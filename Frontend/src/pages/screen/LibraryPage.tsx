import { Heart, Play, LayoutGrid, List as ListIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";

function formatSavedCount(count: number) {
    return count === 1 ? "1 track saved" : `${count} tracks saved`;
}

export default function LibraryPage() {
    const { likedSongs, recentSongs, playlists } = usePlayer();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const navigate = useNavigate();

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary/30 w-full">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }`,
                }}
            />

            <main className="pt-6 md:pt-12 lg:pt-20 pb-44 px-4 md:px-6 lg:px-8 w-full">
                {/* ... existing header and quick access cards ... */}
                <section className="md:mb-5 mb-2">
                    <div className="flex items-start justify-between lg:justify-start gap-3 md:gap-4 w-full">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tighter">
                                Library
                            </h1>
                        </div>
                        <a
                            href="/notifications"
                            className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors bg-surface-container-high rounded-full w-10 h-10 flex items-center justify-center shrink-0"
                        >
                            <span className="material-symbols-outlined text-2xl">
                                notifications
                            </span>
                        </a>
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

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 xl:gap-6 mb-5 md:mb-10">
                    <div className="h-25">
                        <button
                            type="button"
                            onClick={() => navigate("/library/liked")}
                            className="glass-panel w-full h-full p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/5 flex items-center justify-between text-left hover:bg-surface-container-high/60 transition-all"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-tertiary-container/30 flex items-center justify-center shrink-0">
                                    <Heart
                                        className="h-4 w-4 md:h-5 md:w-5 text-tertiary-container"
                                        fill="currentColor"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base leading-tight">Liked Songs</h3>
                                    <p className="text-[10px] md:text-xs text-slate-500">{formatSavedCount(likedSongs.length)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-primary font-bold">
                                <span>Open</span>
                                <Play className="h-3 w-3 fill-current" />
                            </div>
                        </button>
                    </div>
                    {/* ... (Downloads and Recently Played cards - omitting for brevity as they remain same) ... */}
                    <div className="h-25">
                        <div className="glass-panel h-full rounded-2xl md:rounded-3xl p-4 md:p-5 border border-white/5 flex items-center justify-between gap-3 md:gap-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-secondary text-lg">download_for_offline</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base leading-tight">Downloads</h3>
                                    <p className="text-[10px] md:text-xs text-slate-500">42 albums • 12GB</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-500 text-base">chevron_right</span>
                        </div>
                    </div>
                    <div className="h-25">
                        <button
                            type="button"
                            onClick={() => navigate("/library/recently-played")}
                            className="glass-panel w-full h-full p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/5 flex items-center justify-between text-left hover:bg-surface-container-high/60 transition-all"
                        >
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-lg">history</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base leading-tight">Recently Played</h3>
                                    <p className="text-[10px] md:text-xs text-slate-500">{recentSongs.length > 0 ? `${recentSongs.length} tracks` : "No history"}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-500 text-base">chevron_right</span>
                        </button>
                    </div>
                </section>
                
                {/* your playlists */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold font-headline tracking-tight">
                            Your Playlists
                        </h2>
                        <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-2xl border border-white/5">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
                            >
                                <ListIcon size={18} />
                            </button>
                        </div>
                    </div>

                    {playlists.length === 0 ? (
                        <div className="col-span-full rounded-[2.5rem] border border-dashed border-white/10 bg-surface-container-high/20 p-12 text-center text-slate-500">
                            No playlists yet.
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
                            {playlists.map((playlist) => {
                                const coverLabel = playlist.name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "PL";
                                return (
                                    <div
                                        key={playlist.id}
                                        onClick={() => navigate(`/library/playlist/${playlist.id}`)}
                                        className="group cursor-pointer flex flex-col"
                                    >
                                        <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-5 relative shadow-2xl border border-white/5 bg-surface-container-high transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                                            {playlist.songs.length > 0 && playlist.songs[0].coverImage ? (
                                                <img alt={playlist.name} className="w-full h-full object-cover" src={playlist.songs[0].coverImage} />
                                            ) : (
                                                <div className="w-full h-full bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-4xl font-black text-white/50">{coverLabel}</div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-500 shadow-xl shadow-primary/20">
                                                    <Play fill="currentColor" size={24} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-1">
                                            <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{playlist.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{playlist.songs.length} Tracks • {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(playlist.updatedAt))}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    onClick={() => navigate(`/library/playlist/${playlist.id}`)}
                                    className="group cursor-pointer flex items-center gap-5 p-4 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                                >
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-white/5 shrink-0 bg-surface-container-high relative">
                                        {playlist.songs.length > 0 && playlist.songs[0].coverImage ? (
                                            <img alt={playlist.name} className="w-full h-full object-cover" src={playlist.songs[0].coverImage} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10 text-xl font-bold text-white/20">PL</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Play fill="currentColor" size={16} className="text-primary" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{playlist.name}</h3>
                                        <p className="text-sm text-slate-500 truncate mt-0.5">
                                            {playlist.songs.length} Tracks • Last updated {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(playlist.updatedAt))}
                                        </p>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end text-right shrink-0">
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Visibility</span>
                                        <span className="text-sm text-slate-400 font-medium mt-1">Private</span>
                                    </div>
                                    <div className="p-3 rounded-full hover:bg-white/5 text-slate-600 group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

