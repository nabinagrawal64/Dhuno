import { createContext, useContext, useRef, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface PlayerSong {
    _id: string;
    title: string;
    audioUrl: string;
    coverImage?: string;
    artistName?: string;
    duration?: number;
}

interface PlayerContextType {
    currentSong: PlayerSong | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playSong: (song: PlayerSong) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (vol: number) => void;
    skipNext: () => void;
    skipPrev: () => void;
    queue: PlayerSong[];
    setQueue: (songs: PlayerSong[]) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentSong, setCurrentSong] = useState<PlayerSong | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);
    const [queue, setQueue] = useState<PlayerSong[]>([]);

    // Init audio element once
    useEffect(() => {
        const audio = new Audio();
        audio.volume = 0.8;
        audio.preload = 'metadata';

        audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setCurrentTime(0);
        });
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));

        audioRef.current = audio;
        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    const playSong = useCallback((song: PlayerSong) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.src = song.audioUrl;
        audio.load();
        audio.play().catch(console.error);
        setCurrentSong(song);
        setCurrentTime(0);
    }, []);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;
        if (audio.paused) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [currentSong]);

    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = time;
        setCurrentTime(time);
    }, []);

    const setVolume = useCallback((vol: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = vol;
        setVolumeState(vol);
    }, []);

    const skipNext = useCallback(() => {
        if (!currentSong || queue.length === 0) return;
        const idx = queue.findIndex(s => s._id === currentSong._id);
        const next = queue[idx + 1];
        if (next) playSong(next);
    }, [currentSong, queue, playSong]);

    const skipPrev = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        // If more than 3s in, restart; otherwise go prev
        if (audio.currentTime > 3) {
            seek(0);
            return;
        }
        if (!currentSong || queue.length === 0) return;
        const idx = queue.findIndex(s => s._id === currentSong._id);
        const prev = queue[idx - 1];
        if (prev) playSong(prev);
    }, [currentSong, queue, playSong, seek]);

    return (
        <PlayerContext.Provider value={{
            currentSong, isPlaying, currentTime, duration, volume,
            playSong, togglePlay, seek, setVolume,
            skipNext, skipPrev, queue, setQueue,
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
    return ctx;
}
