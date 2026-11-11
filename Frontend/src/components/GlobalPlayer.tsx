import { useEffect, useRef, useState } from "react";
import {
    EllipsisVertical,
    Volume2,
    VolumeX,
    Heart,
    ListMusic,
    Download,
    Sparkles,
    Plus,
    X,
    ChevronDown,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import toast from "react-hot-toast";

function formatTime(sec: number) {
    if (!isFinite(sec) || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80";

function showActionToast(options: { title: string; message: string; accent: string; Icon: React.ElementType }) {
    toast.custom((t) => (
        <div
            className={`min-w-70 max-w-90 rounded-2xl border border-white/10 bg-surface-container-high shadow-2xl px-4 py-3 text-on-surface transition-all duration-200 ${t.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        >
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-10 w-10 rounded-xl ${options.accent} flex items-center justify-center shadow-lg shrink-0`}>
                    <options.Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold truncate">{options.title}</h4>
                        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{options.message}</p>
                </div>
            </div>
        </div>
    ), { duration: 2200 });
}

export default function GlobalPlayer() {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isCurrentSongLiked,
        toggleLikeCurrentSong,
        playlists,
        createPlaylistWithCurrentSong,
        addCurrentSongToPlaylist,
        downloadSong,
        isSongDownloaded,
        downloadingIds,
        togglePlay,
        seek,
        setVolume,
        skipNext,
        skipPrev,
        isRemoteControlled,
    } = usePlayer();
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isExpandedMobile, setIsExpandedMobile] = useState(false);
    const [shouldRenderExpanded, setShouldRenderExpanded] = useState(false);
    const [actionMenuView, setActionMenuView] = useState<"main" | "playlist">("main");
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const actionMenuRef = useRef<HTMLDivElement | null>(null);
    const progressFillRef = useRef<HTMLDivElement | null>(null);
    const volumeFillRef = useRef<HTMLDivElement | null>(null);

    const handleExpandMobile = () => {
        if (window.innerWidth < 1024) {
            setShouldRenderExpanded(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsExpandedMobile(true);
                });
            });
        }
    };

    const handleCollapseMobile = () => {
        setIsExpandedMobile(false);
        setTimeout(() => {
            setShouldRenderExpanded(false);
        }, 520);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsExpandedMobile(false);
                setShouldRenderExpanded(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!actionMenuRef.current?.contains(event.target as Node)) {
                setIsActionMenuOpen(false);
                setActionMenuView("main");
            }
        };

        window.addEventListener("pointerdown", handlePointerDown);
        return () => window.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    useEffect(() => {
        if (progressFillRef.current) {
            progressFillRef.current.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }
    }, [progress]);

    useEffect(() => {
        if (volumeFillRef.current) {
            volumeFillRef.current.style.width = `${Math.max(0, Math.min(100, volume * 100))}%`;
        }
    }, [volume]);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        seek(ratio * duration);
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        setVolume(ratio);
    };

    const updateVolumeFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        setVolume(ratio);
    };

    const renderActionMenuContent = () => (
        <div className="w-64 rounded-2xl border border-white/15 bg-[#1a1e26] shadow-[0_12px_40px_rgba(0,0,0,0.95)] overflow-hidden z-[120]">
            {actionMenuView === "main" ? (
                <div className="p-2 space-y-1">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            const willLike = !isCurrentSongLiked;
                            toggleLikeCurrentSong();
                            showActionToast({
                                title: willLike ? "Saved to Liked Songs" : "Removed from Liked Songs",
                                message: willLike ? "The current track is now in your liked collection." : "The current track was removed from your liked collection.",
                                accent: willLike ? "bg-gradient-to-br from-rose-500 to-pink-500" : "bg-gradient-to-br from-slate-600 to-slate-700",
                                Icon: Heart,
                            });
                            setIsActionMenuOpen(false);
                        }}
                        disabled={!currentSong}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${isCurrentSongLiked ? "text-primary bg-white/5" : "text-on-surface hover:bg-white/5"}`}
                    >
                        {isCurrentSongLiked ? "Remove from liked songs" : "Like song"}
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuView("playlist");
                        }}
                        disabled={!currentSong}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-on-surface hover:bg-white/5 transition-colors disabled:opacity-40"
                    >
                        Add to playlist
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (currentSong) {
                                downloadSong(currentSong);
                            }
                            setIsActionMenuOpen(false);
                        }}
                        disabled={!currentSong || isSongDownloaded(currentSong._id) || downloadingIds.includes(currentSong._id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${currentSong && isSongDownloaded(currentSong._id) ? "text-secondary bg-white/5" : "text-on-surface hover:bg-white/5"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span>
                                {currentSong && isSongDownloaded(currentSong._id)
                                    ? "Song downloaded"
                                    : downloadingIds.includes(currentSong?._id ?? '')
                                        ? "Downloading..."
                                        : "Download for offline"}
                            </span>
                            {currentSong && isSongDownloaded(currentSong._id) && (
                                <Download className="h-3.5 w-3.5 text-secondary" />
                            )}
                        </div>
                    </button>
                </div>
            ) : (
                <div className="p-3 space-y-3 max-w-sm" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuView("main");
                            }}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Back"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                        <div className="flex items-center gap-1.5">
                            <ListMusic className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-bold text-on-surface uppercase">Playlist</span>
                        </div>
                        <div className="w-6" />
                    </div>

                    {/* New Playlist Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            Create New
                        </label>
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(event) => setNewPlaylistName(event.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter' && newPlaylistName.trim() && currentSong) {
                                        const name = newPlaylistName.trim();
                                        createPlaylistWithCurrentSong(name);
                                        setNewPlaylistName("");
                                        setIsActionMenuOpen(false);
                                        showActionToast({
                                            title: "Playlist created",
                                            message: `"${name}" now includes this song.`,
                                            accent: "bg-gradient-to-br from-primary to-secondary",
                                            Icon: ListMusic,
                                        });
                                    }
                                }}
                                placeholder="Name..."
                                className="flex-1 rounded-md bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-on-surface placeholder-slate-600 outline-none focus:border-primary focus:bg-white/10 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const playlistName = newPlaylistName.trim();
                                    if (!playlistName || !currentSong) return;
                                    await createPlaylistWithCurrentSong(playlistName);
                                    setNewPlaylistName("");
                                    setIsActionMenuOpen(false);
                                    showActionToast({
                                        title: "Playlist created",
                                        message: `"${playlistName}" now includes this song.`,
                                        accent: "bg-gradient-to-br from-primary to-secondary",
                                        Icon: ListMusic,
                                    });
                                }}
                                disabled={!currentSong || !newPlaylistName.trim()}
                                className="rounded-md bg-primary hover:bg-primary/90 disabled:bg-slate-600 px-2.5 py-1.5 text-xs font-semibold text-on-primary transition-colors flex items-center gap-1 whitespace-nowrap"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Create
                            </button>
                        </div>
                    </div>

                    {/* Existing Playlists */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            Your Playlists
                        </label>

                        <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                            {playlists.length === 0 ? (
                                <div className="rounded-md border border-dashed border-white/20 p-2.5 text-center">
                                    <ListMusic className="w-4 h-4 text-slate-500 mx-auto mb-1 opacity-50" />
                                    <p className="text-[10px] text-slate-500 font-medium">No playlists yet</p>
                                </div>
                            ) : (
                                playlists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        type="button"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await addCurrentSongToPlaylist(playlist.id);
                                            setIsActionMenuOpen(false);
                                            showActionToast({
                                                title: "Added to playlist",
                                                message: `Added to "${playlist.name}"`,
                                                accent: "bg-gradient-to-br from-cyan-500 to-blue-500",
                                                Icon: ListMusic,
                                            });
                                        }}
                                        className="w-full text-left rounded-md border border-white/15 bg-white/5 hover:bg-white/10 px-2 py-1.5 transition-all hover:border-primary/50 group"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center shrink-0">
                                                    <ListMusic className="w-3 h-3 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{playlist.name}</p>
                                                    <p className="text-[10px] text-slate-500">{playlist.songs.length} songs</p>
                                                </div>
                                            </div>
                                            <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0 transition-colors" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            <footer
                onClick={handleExpandMobile}
                className={`fixed bottom-19 lg:bottom-0 left-2 right-2 lg:left-0 lg:right-0 w-[calc(100%-16px)]
            lg:w-full mx-auto h-16 md:h-20 lg:h-24 z-40 bg-surface-container-highest lg:bg-surface-container rounded-2xl
            lg:rounded-none border border-white/5 lg:border-none flex items-center px-3 lg:px-8
            shadow-[0_8px_32px_rgba(0,0,0,0.6)] justify-between overflow-visible cursor-pointer lg:cursor-default
            transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpandedMobile
                        ? "translate-y-8 opacity-0 pointer-events-none scale-95 lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto lg:scale-100"
                        : "translate-y-0 opacity-100 scale-100"
                    }`}
            >
                {/* Left: Song Info */}
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 overflow-hidden pr-2">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden relative group shrink-0">
                        <img
                            className="w-full h-full object-cover"
                            alt="album art"
                            src={currentSong?.coverImage || DEFAULT_COVER}
                        />
                        <div className="absolute inset-0 bg-primary/20 animate-pulse hidden group-hover:block" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 truncate">
                        <span className="text-on-background font-bold text-sm tracking-tight truncate block">
                            {currentSong?.title ?? "No song playing"}
                        </span>
                        <span className="text-slate-400 text-xs truncate block">
                            {currentSong?.artistName || "—"}
                        </span>
                    </div>
                </div>

                {/* Middle: Controls + Progress */}
                <div className="flex flex-col items-center gap-1 md:gap-2 shrink-0 px-2 lg:px-4 max-w-[40%]">
                    <div className={`flex items-center gap-2 md:gap-4 lg:gap-8 overflow-hidden ${isRemoteControlled ? "opacity-40 pointer-events-none" : ""}`}>
                        <button
                            onClick={skipPrev}
                            className="text-white hover:text-primary transition-all duration-150 hidden md:block shrink-0 active:scale-95 active:translate-y-px"
                            aria-label="Previous"
                        >
                            <span className="material-symbols-outlined">
                                skip_previous
                            </span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlay();
                            }}
                            disabled={!currentSong}
                            className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg shrink-0 disabled:opacity-40 transition-all duration-150 active:scale-95 active:translate-y-px active:brightness-90 cursor-pointer"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            <span className="material-symbols-filled">
                                {isPlaying ? "pause" : "play_arrow"}
                            </span>
                        </button>
                        <button
                            onClick={skipNext}
                            className="text-white hover:text-primary transition-all duration-150 hidden md:block shrink-0 active:scale-95 active:translate-y-px"
                            aria-label="Next"
                        >
                            <span className="material-symbols-outlined">
                                skip_next
                            </span>
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className={`absolute bottom-0 left-0 right-0 md:static w-full flex items-center md:gap-3 md:mt-1 ${isRemoteControlled ? "pointer-events-none" : ""}`}>
                        <span className="text-xs text-slate-400 font-medium hidden md:block shrink-0 min-w-9 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <div
                            aria-label="Seek"
                            className={`group h-1 flex-1 bg-white/10 rounded-full relative md:min-w-25 lg:min-w-50 ${isRemoteControlled ? "cursor-default" : "cursor-pointer"}`}
                            onClick={isRemoteControlled ? undefined : handleProgressClick}
                            onKeyDown={(e) => {
                                if (isRemoteControlled) return;
                                if (e.key === "ArrowRight")
                                    seek(Math.min(duration, currentTime + 5));
                                if (e.key === "ArrowLeft")
                                    seek(Math.max(0, currentTime - 5));
                            }}
                        >
                            <div
                                ref={progressFillRef}
                                className="absolute left-0 top-0 h-full bg-white group-hover:bg-primary rounded-full transition-colors"
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                            </div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium hidden md:block shrink-0 min-w-9">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="items-center justify-end gap-3 md:gap-4 lg:gap-6 flex-1 min-w-0 hidden sm:flex shrink-0">
                    <div ref={actionMenuRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsActionMenuOpen(prev => !prev)}
                            disabled={!currentSong}
                            aria-label="Song actions"
                            className="text-slate-400 hover:text-primary transition-all duration-150 shrink-0 disabled:opacity-40 active:scale-95"
                        >
                            <EllipsisVertical className="h-5 w-5 md:h-6 md:w-6" />
                        </button>

                        {isActionMenuOpen && (
                            <div className="absolute right-0 bottom-12">
                                {renderActionMenuContent()}
                            </div>
                        )}
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2 lg:gap-3 group shrink-0">
                        <button
                            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                            aria-label={volume === 0 ? "Unmute" : "Mute"}
                            className="text-slate-400 group-hover:text-primary text-xl lg:text-2xl"
                        >
                            {volume === 0 ? (
                                <VolumeX className="h-5 w-5" />
                            ) : (
                                <Volume2 className="h-5 w-5" />
                            )}
                        </button>
                        <div
                            className="group w-12 md:w-16 lg:w-24 h-1 bg-white/10 rounded-full relative hidden md:block cursor-pointer touch-none select-none"
                            onClick={handleVolumeClick}
                            onPointerDown={(e) => {
                                setIsDraggingVolume(true);
                                e.currentTarget.setPointerCapture(e.pointerId);
                                updateVolumeFromPointer(e);
                            }}
                            onPointerMove={(e) => {
                                if (!isDraggingVolume) return;
                                updateVolumeFromPointer(e);
                            }}
                            onPointerUp={(e) => {
                                if (
                                    e.currentTarget.hasPointerCapture(e.pointerId)
                                ) {
                                    e.currentTarget.releasePointerCapture(
                                        e.pointerId,
                                    );
                                }
                                setIsDraggingVolume(false);
                            }}
                            onPointerCancel={() => setIsDraggingVolume(false)}
                            aria-label="Volume"
                        >
                            <div
                                ref={volumeFillRef}
                                className="absolute left-0 top-0 h-full bg-white group-hover:bg-primary rounded-full transition-colors"
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Expanded Full Screen Spotify-Style Player Modal for md & below screens */}
            {shouldRenderExpanded && (
                <div
                    className={`fixed inset-0 z-100 bg-surface-dim/95 backdrop-blur-3xl flex flex-col p-4 font-body text-on-surface lg:hidden overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpandedMobile
                            ? "translate-y-0 opacity-100 pointer-events-auto"
                            : "translate-y-full opacity-0 pointer-events-none"
                        }`}
                >
                    {/* Background Ambient Glow */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div
                            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full blur-[100px] opacity-30"
                            style={{
                                background: `radial-gradient(circle, #5affe1 0%, transparent 70%)`
                            }}
                        />
                        <div className="absolute inset-0 bg-[#0a0e15]/80" />
                    </div>

                    {/* Top Header Bar */}
                    <div className="relative z-50 flex items-center justify-between shrink-0 mb-6 pt-2">
                        <button
                            type="button"
                            onClick={handleCollapseMobile}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all shadow-md cursor-pointer"
                            aria-label="Collapse player"
                        >
                            <ChevronDown className="w-6 h-6 text-white" />
                        </button>

                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                Now Playing
                            </p>
                            <p className="text-xs font-bold text-white truncate max-w-48 mt-0.5">
                                {currentSong?.title || "Dhuno Player"}
                            </p>
                        </div>

                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsActionMenuOpen((prev) => !prev);
                                }}
                                className="text-slate-300 hover:text-white cursor-pointer p-2"
                                aria-label="More actions"
                            >
                                <EllipsisVertical className="w-6 h-6" />
                            </button>

                            {isActionMenuOpen && (
                                <div className="absolute right-0 top-12 z-50">
                                    {renderActionMenuContent()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center Artwork Canvas */}
                    <div className="relative z-10 flex-1 flex items-center justify-center my-auto py-4">
                        <div className="w-66 h-66 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 relative group shrink-0">
                            <img
                                src={currentSong?.coverImage || DEFAULT_COVER}
                                alt={currentSong?.title || "Album Art"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Track Information & Like Button */}
                    <div className="relative z-10 flex items-center justify-between gap-4 mt-4 mb-4 shrink-0 px-2">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl sm:text-3xl font-black font-headline text-white truncate tracking-tight">
                                {currentSong?.title || "No song playing"}
                            </h2>
                            <p className="text-sm sm:text-base font-semibold text-primary truncate mt-1">
                                {currentSong?.artistName || "—"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const willLike = !isCurrentSongLiked;
                                toggleLikeCurrentSong();
                                showActionToast({
                                    title: willLike ? "Saved to Liked Songs" : "Removed from Liked Songs",
                                    message: willLike ? "Track added to liked collection." : "Track removed from liked collection.",
                                    accent: willLike ? "bg-gradient-to-br from-rose-500 to-pink-500" : "bg-gradient-to-br from-slate-600 to-slate-700",
                                    Icon: Heart,
                                });
                            }}
                            className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all shrink-0 cursor-pointer"
                            aria-label="Like song"
                        >
                            <Heart
                                className={`w-6 h-6 transition-all ${isCurrentSongLiked ? "fill-primary text-primary scale-110" : "text-slate-300"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Interactive Audio Waveform Progress Bar & Timers */}
                    <div className="relative z-10 w-full space-y-2 mb-6 shrink-0 px-2">
                        <div
                            className="relative h-12 w-full flex items-center justify-between gap-[3px] cursor-pointer group px-1 select-none"
                            onClick={(e) => {
                                if (isRemoteControlled || !duration) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                                seek(ratio * duration);
                            }}
                        >
                            {Array.from({ length: 36 }).map((_, index) => {
                                const barPercent = (index / 35) * 100;
                                const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
                                const isPlayed = currentPercent >= barPercent;
                                const baseHeights = [
                                    35, 60, 45, 80, 55, 90, 70, 40, 85, 65,
                                    95, 50, 75, 60, 88, 42, 70, 92, 58, 80,
                                    64, 85, 48, 72, 90, 55, 82, 60, 95, 45,
                                    78, 62, 88, 50, 70, 40
                                ];
                                const heightPercent = baseHeights[index % baseHeights.length];
                                const animName = `pitchBounce${(index % 3) + 1}`;
                                const animDuration = `${0.55 + (index % 4) * 0.18}s`;
                                const animDelay = `${(index * 65) % 600}ms`;

                                return (
                                    <div
                                        key={index}
                                        className={`flex-1 rounded-full transition-all duration-300 ${isPlayed
                                                ? "bg-primary shadow-[0_0_10px_rgba(90,255,225,0.7)]"
                                                : "bg-white/15 group-hover:bg-white/25"
                                            }`}
                                        style={{
                                            height: `${heightPercent}%`,
                                            animation: isPlaying
                                                ? `${animName} ${animDuration} ease-in-out infinite alternate`
                                                : "none",
                                            animationDelay: isPlaying ? animDelay : "0ms",
                                        }}
                                    />
                                );
                            })}

                            {/* Hidden Touch/Accessible Input Slider overlay */}
                            <input
                                type="range"
                                min={0}
                                max={Math.max(duration, 1)}
                                step={1}
                                value={Math.min(currentTime, Math.max(duration, 1))}
                                onChange={(e) => seek(Number(e.target.value))}
                                disabled={isRemoteControlled}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                aria-label="Seek track"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Core Playback Control Buttons */}
                    <div className={`relative z-10 flex items-center justify-center gap-8 mb-6 shrink-0 ${isRemoteControlled ? "opacity-40 pointer-events-none" : ""}`}>
                        <button
                            type="button"
                            onClick={skipPrev}
                            className="text-white hover:text-primary transition-all p-3 active:scale-90 cursor-pointer"
                            aria-label="Previous track"
                        >
                            <span className="material-symbols-outlined text-4xl sm:text-5xl">
                                skip_previous
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={togglePlay}
                            disabled={!currentSong}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-[0_0_30px_rgba(90,255,225,0.4)] active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-40"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            <span className="material-symbols-filled text-4xl sm:text-5xl">
                                {isPlaying ? "pause" : "play_arrow"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={skipNext}
                            className="text-white hover:text-primary transition-all p-3 active:scale-90 cursor-pointer"
                            aria-label="Next track"
                        >
                            <span className="material-symbols-outlined text-4xl sm:text-5xl">
                                skip_next
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
