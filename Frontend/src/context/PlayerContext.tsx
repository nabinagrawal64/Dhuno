import { createContext, useContext, useRef, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { playlistService, type PlaylistItem } from '../api/playlist.service';
import { offlineDB, type DownloadedSong } from '../utils/db';
import { authUtils } from '../utils/auth';
import { toast } from 'react-hot-toast';

export interface PlayerSong {
    _id: string;
    title: string;
    audioUrl: string;
    coverImage?: string;
    artistName?: string;
    duration?: number;
}

export interface PlayerPlaylist {
    id: string;
    name: string;
    songs: {
        _id: string;
        title: string;
        artistName?: string;
        coverImage?: string;
        duration?: number;
        audioUrl?: string;
    }[];
    createdAt: number;
    updatedAt: number;
    totalTracks?: number;
}

interface PlayerContextType {
    currentSong: PlayerSong | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    likedSongs: PlayerSong[];
    recentSongs: PlayerSong[];
    downloadedSongs: PlayerSong[];
    downloadingIds: string[];
    playlists: PlayerPlaylist[];
    isCurrentSongLiked: boolean;
    playSong: (song: PlayerSong, startTime?: number) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (vol: number) => void;
    skipNext: () => void;
    skipPrev: () => void;
    play: () => void;
    pause: () => void;
    toggleLikeCurrentSong: () => void;
    downloadSong: (song: PlayerSong) => Promise<void>;
    removeDownload: (songId: string) => Promise<void>;
    isSongDownloaded: (songId: string) => boolean;
    createPlaylistWithCurrentSong: (name: string) => Promise<void>;
    addCurrentSongToPlaylist: (playlistId: string) => Promise<void>;
    queue: PlayerSong[];
    setQueue: (songs: PlayerSong[]) => void;
    audioRef: React.RefObject<HTMLAudioElement>;
    isRemoteControlled: boolean;
    setIsRemoteControlled: (val: boolean) => void;
}

interface StoredPlayerState {
    currentSong: PlayerSong | null;
    currentTime: number;
    volume: number;
    queue: PlayerSong[];
}

interface StoredSongCollection {
    songs: PlayerSong[];
}

interface StoredPlaylistCollection {
    playlists: PlayerPlaylist[];
}

const PLAYER_STORAGE_KEY = 'dhuno-player-state';
const LIKED_SONGS_STORAGE_KEY = 'dhuno-liked-songs';
const RECENT_SONGS_STORAGE_KEY = 'dhuno-recently-played';
const PLAYLISTS_STORAGE_KEY = 'dhuno-playlists';

function isPlayerSong(value: unknown): value is PlayerSong {
    if (!value || typeof value !== 'object') return false;

    const song = value as Partial<PlayerSong>;
    return typeof song._id === 'string'
        && typeof song.title === 'string'
        && typeof song.audioUrl === 'string';
}

function readStoredPlayerState(): StoredPlayerState | null {
    try {
        const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored) as Partial<StoredPlayerState>;
        return {
            currentSong: isPlayerSong(parsed.currentSong) ? parsed.currentSong : null,
            currentTime: typeof parsed.currentTime === 'number' && parsed.currentTime >= 0 ? parsed.currentTime : 0,
            volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : 0.8,
            queue: Array.isArray(parsed.queue) ? parsed.queue.filter(isPlayerSong) : [],
        };
    } catch {
        return null;
    }
}

function readStoredSongs(storageKey: string): PlayerSong[] {
    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return [];

        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.filter(isPlayerSong).slice(0, 20);
        }

        if (!parsed || typeof parsed !== 'object') return [];

        const songs = (parsed as Partial<StoredSongCollection>).songs;
        if (!Array.isArray(songs)) return [];

        return songs.filter(isPlayerSong).slice(0, 20);
    } catch {
        return [];
    }
}

function writeStoredSongs(storageKey: string, songs: PlayerSong[]) {
    try {
        localStorage.setItem(storageKey, JSON.stringify({ songs } satisfies StoredSongCollection));
    } catch {
        // Ignore storage failures.
    }
}

function readStoredPlaylists(): PlayerPlaylist[] {
    try {
        const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored) as unknown;
        if (!parsed || typeof parsed !== 'object') return [];

        const playlists = (parsed as Partial<StoredPlaylistCollection>).playlists;
        if (!Array.isArray(playlists)) return [];

        return playlists
            .map(playlist => ({
                id: typeof playlist?.id === 'string' ? playlist.id : '',
                name: typeof playlist?.name === 'string' ? playlist.name : '',
                songs: Array.isArray(playlist?.songs)
                    ? playlist.songs.map((s: any) => ({
                        _id: typeof s?._id === 'string' ? s._id : (typeof s === 'string' ? s : ''),
                        title: typeof s?.title === 'string' ? s.title : '',
                        artistName: typeof s?.artistName === 'string' ? s.artistName : '',
                        coverImage: typeof s?.coverImage === 'string' ? s.coverImage : '',
                        duration: typeof s?.duration === 'number' ? s.duration : 0,
                        audioUrl: typeof s?.audioUrl === 'string' ? s.audioUrl : '',
                    })).filter((s: any) => s._id)
                    : [],
                createdAt: typeof playlist?.createdAt === 'number' ? playlist.createdAt : Date.now(),
                updatedAt: typeof playlist?.updatedAt === 'number' ? playlist.updatedAt : Date.now(),
                totalTracks: typeof playlist?.totalTracks === 'number' ? playlist.totalTracks : undefined,
            }))
            .filter(playlist => playlist.id && playlist.name)
            .slice(0, 50);
    } catch {
        return [];
    }
}

function writeStoredPlaylists(playlists: PlayerPlaylist[]) {
    try {
        localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify({ playlists } satisfies StoredPlaylistCollection));
    } catch {
        // Ignore storage failures.
    }
}

function mapPlaylistItem(playlist: PlaylistItem): PlayerPlaylist {
    return {
        id: playlist.id,
        name: playlist.title,
        songs: Array.isArray(playlist.songs)
            ? playlist.songs.map((s) => ({ _id: s._id, title: s.title, artistName: s.artistName, coverImage: s.coverImage, duration: s.duration, audioUrl: s.audioUrl }))
            : [],
        createdAt: playlist.createdAt ? new Date(playlist.createdAt).getTime() : Date.now(),
        updatedAt: playlist.updatedAt ? new Date(playlist.updatedAt).getTime() : Date.now(),
        totalTracks: playlist.totalTracks,
    };
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentBlobUrlRef = useRef<string | null>(null);
    const [storedState] = useState(readStoredPlayerState);
    const [currentSong, setCurrentSong] = useState<PlayerSong | null>(storedState?.currentSong ?? null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(storedState?.currentTime ?? 0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(storedState?.volume ?? 0.8);
    const [queue, setQueue] = useState<PlayerSong[]>(storedState?.queue ?? []);
    const [likedSongs, setLikedSongs] = useState<PlayerSong[]>(() => readStoredSongs(LIKED_SONGS_STORAGE_KEY));
    const [recentSongs, setRecentSongs] = useState<PlayerSong[]>(() => readStoredSongs(RECENT_SONGS_STORAGE_KEY));
    const [downloadedSongs, setDownloadedSongs] = useState<PlayerSong[]>([]);
    const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
    const [playlists, setPlaylists] = useState<PlayerPlaylist[]>(() => readStoredPlaylists());
    const [isRemoteControlled, setIsRemoteControlled] = useState(false);

    const isCurrentSongLiked = currentSong ? likedSongs.some(song => song._id === currentSong._id) : false;

    const refreshDownloadedSongs = useCallback(async () => {
        try {
            const songs = await offlineDB.getAllSongs();
            setDownloadedSongs(songs.map(s => ({
                _id: s._id,
                title: s.title,
                audioUrl: s.audioUrl,
                coverImage: s.coverImage,
                artistName: s.artistName,
                duration: s.duration
            })));
        } catch (error) {
            console.error('Failed to load downloaded songs:', error);
        }
    }, []);

    useEffect(() => {
        refreshDownloadedSongs();
    }, [refreshDownloadedSongs]);

    // Init audio element once
    useEffect(() => {
        const audio = new Audio();
        audio.volume = storedState?.volume ?? 0.8;
        audio.preload = 'metadata';

        audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setCurrentTime(0);
        });
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));

        const initPlayer = async () => {
            if (storedState?.currentSong) {
                let url = storedState.currentSong.audioUrl;
                const downloaded = await offlineDB.getSong(storedState.currentSong._id);
                if (downloaded) {
                    url = URL.createObjectURL(downloaded.audioBlob);
                    currentBlobUrlRef.current = url;
                }
                audio.src = url;
                audio.load();

                if (storedState.currentTime > 0) {
                    const restorePosition = () => {
                        audio.currentTime = Math.min(storedState.currentTime, audio.duration || storedState.currentTime);
                        setCurrentTime(audio.currentTime);
                    };

                    audio.addEventListener('loadedmetadata', restorePosition, { once: true });
                }
            }
        };

        initPlayer();

        audioRef.current = audio;
        return () => {
            audio.pause();
            audio.src = '';
            if (currentBlobUrlRef.current) {
                URL.revokeObjectURL(currentBlobUrlRef.current);
            }
        };
    }, [storedState]);

    useEffect(() => {
        try {
            if (currentSong) {
                const snapshot: StoredPlayerState = {
                    currentSong,
                    currentTime,
                    volume,
                    queue,
                };

                localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(snapshot));
            } else {
                localStorage.removeItem(PLAYER_STORAGE_KEY);
            }
        } catch {
            // Ignore storage failures.
        }
    }, [currentSong, currentTime, queue, volume]);

    useEffect(() => {
        writeStoredSongs(LIKED_SONGS_STORAGE_KEY, likedSongs);
    }, [likedSongs]);

    useEffect(() => {
        writeStoredSongs(RECENT_SONGS_STORAGE_KEY, recentSongs);
    }, [recentSongs]);

    useEffect(() => {
        writeStoredPlaylists(playlists);
    }, [playlists]);

    const refreshPlaylists = useCallback(async () => {
        const isAuthed = authUtils.isAuthenticated();
        const isExpired = authUtils.isTokenExpired();
        
        if (!isAuthed || isExpired) {
            console.log("⏭️ [PlayerContext] Skipping playlist refresh: Not authenticated or token expired", { isAuthed, isExpired });
            return;
        }
        
        console.log("🔄 [PlayerContext] Refreshing playlists...");
        try {
            const response = await playlistService.getMyPlaylists();
            setPlaylists(response.playlists.map(mapPlaylistItem));
        } catch {
            // Keep the cached playlists if the backend request fails.
        }
    }, []);

    useEffect(() => {
        void refreshPlaylists();
    }, [refreshPlaylists]);

    const addToRecentSongs = useCallback((song: PlayerSong) => {
        setRecentSongs(prev => [song, ...prev.filter(item => item._id !== song._id)].slice(0, 12));
    }, []);

    const playSong = useCallback(async (song: PlayerSong, startTime: number = 0) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentBlobUrlRef.current) {
            URL.revokeObjectURL(currentBlobUrlRef.current);
            currentBlobUrlRef.current = null;
        }

        let url = song.audioUrl;
        const downloaded = await offlineDB.getSong(song._id);
        if (downloaded) {
            url = URL.createObjectURL(downloaded.audioBlob);
            currentBlobUrlRef.current = url;
        }

        audio.src = url;
        audio.load();
        
        if (startTime > 0) {
            const onCanPlay = () => {
                audio.currentTime = startTime;
                audio.removeEventListener('canplay', onCanPlay);
            };
            audio.addEventListener('canplay', onCanPlay);
        }

        audio.play().catch(console.error);
        setCurrentSong(song);
        setCurrentTime(startTime);
        addToRecentSongs(song);
    }, [addToRecentSongs]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !currentSong) return;
        if (audio.paused) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [currentSong]);

    const play = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.play().catch(console.error);
    }, []);

    const pause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTypingField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT' || target?.isContentEditable;
            if (isTypingField || event.repeat || (event.code !== 'Space' && event.key !== ' ')) return;

            event.preventDefault();
            togglePlay();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay]);

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

    const toggleLikeCurrentSong = useCallback(() => {
        if (!currentSong) return;

        setLikedSongs(prev => {
            const exists = prev.some(song => song._id === currentSong._id);
            if (exists) {
                return prev.filter(song => song._id !== currentSong._id);
            }

            return [currentSong, ...prev].slice(0, 20);
        });
    }, [currentSong]);

    const downloadSong = useCallback(async (song: PlayerSong) => {
        if (downloadingIds.includes(song._id)) return;
        
        const isAlreadyDownloaded = downloadedSongs.some(s => s._id === song._id);
        if (isAlreadyDownloaded) {
            toast.success('Song already downloaded');
            return;
        }

        setDownloadingIds(prev => [...prev, song._id]);
        const loadingToast = toast.loading(`Downloading ${song.title}...`);

        try {
            const response = await fetch(song.audioUrl);
            if (!response.ok) throw new Error('Failed to fetch audio');
            
            const blob = await response.blob();
            const downloadedSong: DownloadedSong = {
                ...song,
                audioBlob: blob,
                downloadedAt: Date.now()
            };

            await offlineDB.saveSong(downloadedSong);
            await refreshDownloadedSongs();
            toast.success(`${song.title} downloaded offline!`, { id: loadingToast });
        } catch (error) {
            console.error('Download failed:', error);
            toast.error(`Failed to download ${song.title}`, { id: loadingToast });
        } finally {
            setDownloadingIds(prev => prev.filter(id => id !== song._id));
        }
    }, [downloadingIds, downloadedSongs, refreshDownloadedSongs]);

    const removeDownload = useCallback(async (songId: string) => {
        try {
            await offlineDB.deleteSong(songId);
            await refreshDownloadedSongs();
            toast.success('Download removed');
        } catch (error) {
            console.error('Failed to remove download:', error);
            toast.error('Failed to remove download');
        }
    }, [refreshDownloadedSongs]);

    const isSongDownloaded = useCallback((songId: string) => {
        return downloadedSongs.some(s => s._id === songId);
    }, [downloadedSongs]);

    const createPlaylistWithCurrentSong = useCallback(async (name: string) => {
        if (!currentSong) return;

        const trimmedName = name.trim();
        if (!trimmedName) return;

        await playlistService.createPlaylist(trimmedName, currentSong._id);
        await refreshPlaylists();
    }, [currentSong, refreshPlaylists]);

    const addCurrentSongToPlaylist = useCallback(async (playlistId: string) => {
        if (!currentSong) return;

        await playlistService.addSongToPlaylist(playlistId, currentSong._id);
        await refreshPlaylists();
    }, [currentSong, refreshPlaylists]);

    const value = useMemo(() => ({
        currentSong, isPlaying, currentTime, duration, volume,
        likedSongs, recentSongs, downloadedSongs, downloadingIds, playlists, isCurrentSongLiked,
        playSong, togglePlay, seek, setVolume,
        skipNext, skipPrev, toggleLikeCurrentSong, downloadSong, removeDownload, isSongDownloaded,
        createPlaylistWithCurrentSong, addCurrentSongToPlaylist, queue, setQueue,
        play, pause, audioRef: audioRef as React.RefObject<HTMLAudioElement>,
        isRemoteControlled, setIsRemoteControlled
    }), [
        currentSong, isPlaying, currentTime, duration, volume,
        likedSongs, recentSongs, downloadedSongs, downloadingIds, playlists, isCurrentSongLiked,
        playSong, togglePlay, seek, setVolume,
        skipNext, skipPrev, toggleLikeCurrentSong, downloadSong, removeDownload, isSongDownloaded,
        createPlaylistWithCurrentSong, addCurrentSongToPlaylist, queue, setQueue,
        play, pause, isRemoteControlled
    ]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
    return ctx;
}
