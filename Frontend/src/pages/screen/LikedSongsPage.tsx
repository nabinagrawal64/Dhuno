import { Heart } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80';

function formatTime(sec?: number) {
    if (!sec || !isFinite(sec) || isNaN(sec)) return '--:--';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

export default function LikedSongsPage() {
    const { likedSongs, playSong } = usePlayer();
    const navigate = useNavigate();

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen w-full">
            <main className="pt-6 md:pt-12 lg:pt-20 pb-44 px-4 md:px-6 lg:px-8 w-full max-w-none">
                <button
                    type="button"
                    onClick={() => navigate('/library')}
                    className="mb-6 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                >
                    Back to Library
                </button>

                <section className="rounded-3xl p-4 sm:p-6 md:p-8 bg-linear-to-br from-[#ffb8bb]/20 via-[#0f131b] to-surface-container border border-white/5 mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-row sm:items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-linear-to-br from-tertiary-container to-secondary flex items-center justify-center shadow-lg shrink-0">
                            <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" fill="currentColor" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-headline tracking-tighter leading-tight">
                                Liked Songs
                            </h1>
                            <p className="text-sm sm:text-base text-slate-300 font-medium">
                                {likedSongs.length} saved tracks
                            </p>
                        </div>
                    </div>
                </section>

                {likedSongs.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-500">
                        Tap the heart on the player to save songs here.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {likedSongs.map(song => (
                            <button
                                key={song._id}
                                type="button"
                                onClick={() => playSong(song)}
                                className="w-full flex items-center gap-4 rounded-2xl bg-black/10 hover:bg-white/5 border border-white/5 px-4 py-3 text-left transition-colors"
                            >
                                <img
                                    src={song.coverImage || DEFAULT_COVER}
                                    alt={song.title}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold truncate">{song.title}</p>
                                    <p className="text-sm text-slate-500 truncate">{song.artistName || 'Unknown artist'}</p>
                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                        <span className="rounded-full bg-white/5 px-2 py-0.5">Liked song</span>
                                        <span>•</span>
                                        <span>{formatTime(song.duration)}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="text-xs text-slate-400 block">Play</span>
                                    <span className="text-[11px] text-slate-500 block mt-1">
                                        {song.duration ? formatTime(song.duration) : 'Unknown'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
