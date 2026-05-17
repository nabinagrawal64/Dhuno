import { History, Download, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80';

function formatTime(sec?: number) {
    if (!sec || !isFinite(sec) || isNaN(sec)) return '--:--';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

export default function RecentlyPlayedPage() {
    const { recentSongs, playSong, downloadSong, isSongDownloaded, downloadingIds } = usePlayer();
    const navigate = useNavigate();

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen w-full">
            <main className="pt-6 md:pt-12 lg:pt-20 pb-44 px-4 md:px-6 lg:px-8 w-full max-w-none">
                <button
                    type="button"
                    onClick={() => navigate('/library')}
                    className="mb-6 text-sm font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to Library
                </button>

                <section className="rounded-3xl p-4 sm:p-6 md:p-8 bg-linear-to-br from-[#12202b] via-[#0f131b] to-surface-container border border-white/5 mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-row sm:items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shrink-0">
                            <History className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-headline tracking-tighter leading-tight">
                                Recently Played
                            </h1>
                            <p className="text-sm sm:text-base text-slate-300 font-medium">
                                {recentSongs.length} tracks in history
                            </p>
                        </div>
                    </div>
                </section>

                {recentSongs.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-500">
                        Songs you play will appear here for quick access.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {recentSongs.map(song => (
                            <div
                                key={song._id}
                                className="w-full flex items-center gap-4 rounded-2xl bg-black/10 hover:bg-white/5 border border-white/5 px-4 py-3 text-left transition-colors group"
                            >
                                <div className="cursor-pointer flex-1 flex items-center gap-4" onClick={() => playSong(song)}>
                                    <img
                                        src={song.coverImage || DEFAULT_COVER}
                                        alt={song.title}
                                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold truncate group-hover:text-primary transition-colors">{song.title}</p>
                                        <p className="text-sm text-slate-500 truncate">{song.artistName || 'Unknown artist'}</p>
                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                            <span className="rounded-full bg-white/5 px-2 py-0.5">Recently played</span>
                                            {isSongDownloaded(song._id) && (
                                                <span className="rounded-full bg-secondary/20 text-secondary px-2 py-0.5 flex items-center gap-1">
                                                    <CheckCircle2 size={10} />
                                                    Offline
                                                </span>
                                            )}
                                            <span>•</span>
                                            <span>{formatTime(song.duration)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isSongDownloaded(song._id)) {
                                                downloadSong(song);
                                            }
                                        }}
                                        disabled={downloadingIds.includes(song._id)}
                                        className={`p-2 rounded-full transition-all ${
                                            isSongDownloaded(song._id) 
                                                ? "text-secondary cursor-default" 
                                                : "text-slate-500 hover:text-primary hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                        } ${downloadingIds.includes(song._id) ? "animate-pulse" : ""}`}
                                    >
                                        {isSongDownloaded(song._id) ? (
                                            <CheckCircle2 size={20} />
                                        ) : (
                                            <Download size={20} className={downloadingIds.includes(song._id) ? "opacity-50" : ""} />
                                        )}
                                    </button>
                                    <div className="shrink-0 text-right min-w-12">
                                        <span className="text-[11px] text-slate-500 block">
                                            {song.duration ? formatTime(song.duration) : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
