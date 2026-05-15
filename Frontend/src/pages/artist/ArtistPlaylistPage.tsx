import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { playlistService, type PlaylistItem } from '../../api/playlist.service';
import { songService, type SongItem } from '../../api/song.service';
import { Play, Plus, ArrowLeft, Music2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePlayer } from '../../context/PlayerContext';

const DEFAULT_COVER = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80";

export default function ArtistPlaylistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playSong } = usePlayer();

    const [playlist, setPlaylist] = useState<PlaylistItem | null>(null);
    const [playlistSongs, setPlaylistSongs] = useState<SongItem[]>([]);
    const [availableSongs, setAvailableSongs] = useState<SongItem[]>([]);
    const [showAvailable, setShowAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setIsLoading(true);
                const [plRes, mySongsRes] = await Promise.all([
                    playlistService.getMyPlaylists(),
                    songService.getMySongs(),
                ]);

                const pl = plRes.playlists.find(p => p.id === id) || null;
                const mySongs = mySongsRes.songs || [];

                if (!mounted) return;
                setPlaylist(pl);
                setPlaylistSongs(pl?.songs ?? []);

                const inSet = new Set((pl?.songs ?? []).map(s => s._id));
                setAvailableSongs(mySongs.filter(s => !inSet.has(s._id)));
            } catch {
                toast.error('Failed to load playlist');
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();

        return () => { mounted = false };
    }, [id]);

    const handleAddSong = async (songId: string) => {
        if (!playlist) return;
        try {
            await playlistService.addSongToPlaylist(playlist.id, songId);
            const added = availableSongs.find(s => s._id === songId);
            if (added) {
                setPlaylistSongs(current => [...current, added]);
                setAvailableSongs(current => current.filter(s => s._id !== songId));
                toast.success('Song added to playlist');
            }
        } catch {
            toast.error('Failed to add song');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
                    <button onClick={() => navigate('/artist/songs')} className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors">
                        Back to Songs
                    </button>
                </div>
            </div>
        );
    }

    const coverImage = playlist.coverImage || DEFAULT_COVER;
    const totalDuration = playlistSongs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 sm:px-6 py-2 sm:py-3">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-on-surface"
                    aria-label="Back"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Hero Section */}
            <div className="pt-3 sm:pt-4 pb-8 sm:pb-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-row items-start gap-4 sm:gap-6">
                        {/* Playlist Cover */}
                        <div className="flex-[0_0_40%] max-w-40 sm:max-w-50 lg:max-w-60 shrink-0">
                            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl">
                                <img
                                    src={coverImage}
                                    alt={playlist.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Playlist Info */}
                        <div className="flex-[1_1_60%] min-w-0 pt-1 sm:pt-2">
                            <div className="text-[10px] sm:text-sm font-bold text-primary uppercase tracking-[0.35em] sm:tracking-widest mb-1 sm:mb-2">Playlist</div>
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-on-surface mb-1 sm:mb-2 leading-tight break-words">
                                {playlist.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-400 mb-3 sm:mb-5">
                                <span className="text-xs sm:text-sm">{playlistSongs.length} tracks</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-xs sm:text-sm">
                                    {minutes > 0 ? `${minutes}h ${seconds}m` : `${seconds}s`}
                                </span>
                                {playlist.updatedAt && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="text-xs sm:text-sm">Updated {new Date(playlist.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-nowrap items-center gap-2 sm:gap-3 pt-1 sm:pt-0">
                                <button
                                    onClick={() => {
                                        if (playlistSongs.length > 0) {
                                            playSong(playlistSongs[0] as unknown as Parameters<typeof playSong>[0]);
                                        }
                                    }}
                                    disabled={playlistSongs.length === 0}
                                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary hover:bg-primary/90 disabled:bg-slate-600 text-on-primary flex items-center justify-center transition-all hover:scale-105 disabled:cursor-not-allowed shrink-0"
                                >
                                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                </button>
                                <button
                                    onClick={() => setShowAvailable(!showAvailable)}
                                    className="min-w-0 sm:flex-none py-2.5 rounded-full px-3 lg:px-4 bg-white/10 hover:bg-white/20 text-on-surface text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5 shrink-0" />
                                    Add Songs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Songs Table */}
            <div className="">
                <div className="max-w-7xl mx-auto">
                    {playlistSongs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-8 sm:p-12 text-center">
                            <Music2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                            <p className="text-slate-500 font-medium">No songs in this playlist yet</p>
                            <p className="text-slate-600 text-sm mt-1">Click "Add Songs" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Table Header */}
                            <div className="hidden sm:grid grid-cols-[36px_1fr_72px] gap-4 px-3 sm:px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5">
                                <div />
                                <div>Title / Artist</div>
                                <div className="text-right">Duration</div>
                            </div>

                            {/* Table Rows */}
                            <div className="space-y-1">
                                {playlistSongs.map((song) => {
                                    const mins = Math.floor((song.duration || 0) / 60);
                                    const secs = (song.duration || 0) % 60;
                                    return (
                                        <button
                                            key={song._id}
                                            onClick={() => playSong(song as unknown as Parameters<typeof playSong>[0])}
                                            className="w-full grid grid-cols-[24px_1fr_52px] sm:grid-cols-[36px_1fr_72px] gap-3 sm:gap-4 px-3 sm:px-4 py-3 items-center rounded-lg hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="text-slate-500/70 group-hover:text-primary transition-colors flex items-center justify-center">
                                                <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </div>

                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={song.coverImage}
                                                    alt={song.title}
                                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-md object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm sm:text-base font-semibold text-on-surface truncate group-hover:text-primary transition-colors text-left">
                                                        {song.title}
                                                    </div>
                                                    <div className="text-xs text-slate-400 truncate text-left">
                                                        {song.artistName}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right text-sm text-slate-500 group-hover:text-on-surface transition-colors">
                                                {mins}:{String(secs).padStart(2, '0')}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Songs Modal */}
            {showAvailable && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-container rounded-2xl w-full max-w-full sm:max-w-2xl max-h-[82vh] overflow-y-auto">
                        <div className="sticky top-0 bg-surface-container border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold">Add Songs to Playlist</h3>
                            <button
                                onClick={() => setShowAvailable(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 shrink-0"
                            >
                                ✕
                            </button>
                        </div>

                        {availableSongs.length === 0 ? (
                            <div className="p-6 sm:p-8 text-center text-slate-500">
                                No available songs to add
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {availableSongs.map(song => (
                                    <button
                                        key={song._id}
                                        onClick={() => handleAddSong(song._id)}
                                        className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <img
                                            src={song.coverImage}
                                            alt={song.title}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                                                {song.title}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {song.artistName}
                                            </div>
                                        </div>
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-primary flex-shrink-0 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
