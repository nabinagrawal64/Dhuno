import { Heart, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

function formatTime(sec: number) {
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80';

export default function GlobalPlayer() {
    const { currentSong, isPlaying, currentTime, duration, volume, togglePlay, seek, setVolume, skipNext, skipPrev } = usePlayer();
    const navigate = useNavigate();

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        seek(ratio * duration);
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(ratio);
    };

    return (
        <footer className="fixed bottom-19 lg:bottom-0 left-2 right-2 lg:left-0 lg:right-0 w-[calc(100%-16px)]
            lg:w-full mx-auto h-16 md:h-20 lg:h-24 z-40 bg-surface-container-highest lg:bg-surface-container rounded-2xl
            lg:rounded-none border border-white/5 lg:border-none flex items-center px-3 lg:px-8
            shadow-[0_8px_32px_rgba(0,0,0,0.6)] justify-between overflow-hidden">

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
                        {currentSong?.title ?? 'No song playing'}
                    </span>
                    <span className="text-slate-400 text-xs truncate block">
                        {currentSong?.artistName || '—'}
                    </span>
                </div>
            </div>

            {/* Middle: Controls + Progress */}
            <div className="flex flex-col items-center gap-1 md:gap-2 shrink-0 px-2 lg:px-4 max-w-[40%]">
                <div className="flex items-center gap-2 md:gap-4 lg:gap-8 overflow-hidden">
                    <button
                        onClick={skipPrev}
                        className="text-white hover:text-primary transition-colors hidden md:block shrink-0"
                        aria-label="Previous"
                    >
                        <span className="material-symbols-outlined">skip_previous</span>
                    </button>
                    <button
                        onClick={togglePlay}
                        disabled={!currentSong}
                        className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg shrink-0 disabled:opacity-40"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>
                    <button
                        onClick={skipNext}
                        className="text-white hover:text-primary transition-colors hidden md:block shrink-0"
                        aria-label="Next"
                    >
                        <span className="material-symbols-outlined">skip_next</span>
                    </button>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 md:static w-full flex items-center md:gap-3 md:mt-1">
                    <span className="text-xs text-slate-400 font-medium hidden md:block shrink-0 min-w-[36px] text-right">
                        {formatTime(currentTime)}
                    </span>
                    <div
                        role="slider"
                        aria-valuemin={0}
                        aria-valuemax={duration}
                        aria-valuenow={currentTime}
                        aria-label="Seek"
                        tabIndex={0}
                        className="group h-1 flex-1 bg-white/10 rounded-full relative md:min-w-[100px] lg:min-w-[200px] cursor-pointer"
                        onClick={handleProgressClick}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowRight') seek(Math.min(duration, currentTime + 5));
                            if (e.key === 'ArrowLeft') seek(Math.max(0, currentTime - 5));
                        }}
                    >
                        <div
                            className="absolute left-0 top-0 h-full bg-white group-hover:bg-primary rounded-full transition-colors"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                        </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium hidden md:block shrink-0 min-w-[36px]">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="items-center justify-end gap-3 md:gap-4 lg:gap-6 flex-1 min-w-0 hidden sm:flex shrink-0">
                <button aria-label="Add to favourites" className="text-slate-400 hover:text-primary transition-colors shrink-0">
                    <Heart className="h-5 w-5 md:h-6 md:w-6" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2 lg:gap-3 group shrink-0">
                    <button
                        onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                        className="text-slate-400 group-hover:text-primary text-xl lg:text-2xl"
                    >
                        {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <div
                        className="group w-12 md:w-16 lg:w-24 h-1 bg-white/10 rounded-full relative hidden md:block cursor-pointer"
                        onClick={handleVolumeClick}
                        aria-label="Volume"
                        role="slider"
                        aria-valuemin={0}
                        aria-valuemax={1}
                        aria-valuenow={volume}
                        tabIndex={0}
                    >
                        <div
                            className="absolute left-0 top-0 h-full bg-white group-hover:bg-primary rounded-full transition-colors"
                            style={{ width: `${volume * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/player')}
                    className="text-slate-400 hover:text-primary transition-colors hidden md:block shrink-0"
                    aria-label="Full player"
                >
                    <Maximize2 className="h-5 w-5" />
                </button>
            </div>
        </footer>
    );
}
