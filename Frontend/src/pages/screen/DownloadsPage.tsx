import { Download, Trash2, Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80';

function formatTime(sec?: number) {
    if (!sec || !isFinite(sec) || isNaN(sec)) return '--:--';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

export default function DownloadsPage() {
    const { downloadedSongs, playSong, removeDownload } = usePlayer();
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

                <section className="rounded-3xl p-4 sm:p-6 md:p-8 bg-linear-to-br from-secondary/20 via-[#0f131b] to-surface-container border border-white/5 mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-row sm:items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-linear-to-br from-secondary to-primary flex items-center justify-center shadow-lg shrink-0">
                            <Download className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-headline tracking-tighter leading-tight">
                                Downloads
                            </h1>
                            <p className="text-sm sm:text-base text-slate-300 font-medium">
                                {downloadedSongs.length} tracks available offline
                            </p>
                        </div>
                    </div>
                </section>

                {downloadedSongs.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Download className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-lg font-medium mb-2">No downloads yet</p>
                        <p className="text-sm opacity-60">Songs you download will appear here for offline listening.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {downloadedSongs.map(song => (
                            <div
                                key={song._id}
                                className="group w-full flex items-center gap-4 rounded-2xl bg-black/10 hover:bg-white/5 border border-white/5 px-4 py-3 text-left transition-all"
                            >
                                <div 
                                    className="relative cursor-pointer shrink-0"
                                    onClick={() => playSong(song)}
                                >
                                    <img
                                        src={song.coverImage || DEFAULT_COVER}
                                        alt={song.title}
                                        className="w-14 h-14 rounded-xl object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                        <Play size={20} fill="currentColor" className="text-white" />
                                    </div>
                                </div>
                                
                                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => playSong(song)}>
                                    <p className="font-semibold truncate group-hover:text-primary transition-colors">{song.title}</p>
                                    <p className="text-sm text-slate-500 truncate">{song.artistName || 'Unknown artist'}</p>
                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                        <span className="rounded-full bg-secondary/20 text-secondary px-2 py-0.5 flex items-center gap-1">
                                            <Download size={10} />
                                            Offline
                                        </span>
                                        <span>•</span>
                                        <span>{formatTime(song.duration)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => removeDownload(song._id)}
                                        className="p-2 rounded-full hover:bg-error/10 text-slate-500 hover:text-error transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove download"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="text-right hidden sm:block">
                                        <span className="text-[11px] text-slate-500 block">
                                            {song.duration ? formatTime(song.duration) : '--:--'}
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
