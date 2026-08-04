import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, Users, Play, Pause, SkipForward, Plus, Search, Music, Radio, Sparkles, Send, Shield, User, Trash2 } from "lucide-react";
import { roomService, type RoomDetail, type RoomParticipant } from "../../api/room.service";
import { songService, type SongItem } from "../../api/song.service";
import { authService, type UserProfile } from "../../api/auth.service";
import { useSocket } from "../../context/SocketContext";
import { usePlayer, type PlayerSong } from "../../context/PlayerContext";

const reactionOptions = ["🔥", "💿", "✨", "💚", "🎧"];

type PlaybackEvent = {
    roomId: string;
    at?: number;
    to?: number;
    currentSong?: RoomDetail["currentSong"];
    currentTime?: number;
    isPlaying?: boolean;
    queue?: RoomDetail["queue"];
    startTime?: number;
};

function formatTime(sec: number) {
    if (!isFinite(sec) || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

export default function LiveSessionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";
    const { socket, isConnected } = useSocket();
    const player = usePlayer();
    const playerRef = useRef(player);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    // Keep playerRef updated with latest player state
    useEffect(() => {
        playerRef.current = player;
    }, [player]);

    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [room, setRoom] = useState<RoomDetail | null>(null);
    const [message, setMessage] = useState("");
    const [availableSongs, setAvailableSongs] = useState<SongItem[]>([]);
    const [songSearch, setSongSearch] = useState("");
    const [showCustomAdd, setShowCustomAdd] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [customArtist, setCustomArtist] = useState("");
    
    // Right sidebar tab state: 'chat' | 'participants'
    const [rightTab, setRightTab] = useState<"chat" | "participants">("chat");

    const [isJoining, setIsJoining] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isAddingQueue, setIsAddingQueue] = useState(false);
    const lastPlayedTrackIdRef = useRef<string | null>(null);

    // Capture the state of the player before joining/loading the room
    const [preRoomState, setPreRoomState] = useState<{
        song: PlayerSong | null;
        currentTime: number;
        isPlaying: boolean;
    } | null>(null);

    useEffect(() => {
        if (!preRoomState) {
            setPreRoomState({
                song: player.currentSong,
                currentTime: player.currentTime,
                isPlaying: player.isPlaying,
            });
        }
        // Run only once on mount to capture initial state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch Current Logged In User
    useEffect(() => {
        let isMounted = true;
        const fetchUser = async () => {
            try {
                const res = await authService.getMe();
                if (isMounted && res.user) {
                    setCurrentUser(res.user);
                }
            } catch {
                // Ignore error
            }
        };
        void fetchUser();
        return () => { isMounted = false; };
    }, []);

    // Check if current user is the room host
    const isHost = useMemo(() => {
        if (!currentUser || !room) return false;
        const currentUserId = String(currentUser._id);
        const hostId = typeof room.host === "object" && room.host ? String(room.host._id || "") : String(room.host || "");
        const fallbackHostId = String((room as any).hostId || "");
        return (hostId !== "" && currentUserId === hostId) || (fallbackHostId !== "" && currentUserId === fallbackHostId);
    }, [currentUser, room]);

    // Check if current user has already joined the room
    const hasJoined = useMemo(() => {
        if (!currentUser) return false;
        if (isHost) return true;
        if (!room?.participants) return false;
        return room.participants.some((p) => {
            const pId = typeof p === "object" ? String((p as any)._id || (p as any).userId || "") : String(p);
            return pId === String(currentUser._id);
        });
    }, [currentUser, isHost, room?.participants]);

    // Fetch Room Details
    useEffect(() => {
        let isMounted = true;

        const loadRoom = async () => {
            if (!roomId) {
                setRoom(null);
                return;
            }

            try {
                const response = await roomService.getRoomById(roomId);
                if (isMounted) {
                    setRoom(response.room);
                }
            } catch (error) {
                const messageText = error instanceof Error ? error.message : "Failed to load room";
                toast.error(messageText);
            }
        };

        void loadRoom();

        return () => {
            isMounted = false;
        };
    }, [roomId]);

    // Fetch Available Songs for Queue Selection
    useEffect(() => {
        let isMounted = true;
        const fetchSongs = async () => {
            try {
                const response = await songService.getTrendingSongs();
                if (isMounted && response.success && response.songs?.length) {
                    setAvailableSongs(response.songs);
                } else if (isMounted && player.recentSongs.length > 0) {
                    setAvailableSongs(
                        player.recentSongs.map((s) => ({
                            _id: s._id,
                            title: s.title,
                            artistName: s.artistName,
                            coverImage: s.coverImage,
                            audioUrl: s.audioUrl,
                            duration: s.duration,
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to load catalog songs for room queue:", err);
            }
        };
        void fetchSongs();
        return () => {
            isMounted = false;
        };
    }, [player.recentSongs]);

    // WebSocket Listeners
    useEffect(() => {
        if (!socket || !roomId) {
            return;
        }

        socket.emit("join_room", roomId);

        const handleMessage = (payload: { roomId: string; message: { sender: RoomParticipant | null; text: string; createdAt: string } }) => {
            if (payload.roomId !== roomId) return;
            setRoom((current) => {
                if (!current) return current;
                const exists = current.recentMessages.some(
                    (m) =>
                        m.text === payload.message.text &&
                        m.createdAt === payload.message.createdAt &&
                        String(m.sender?._id || "") === String(payload.message.sender?._id || "")
                );
                if (exists) return current;
                return {
                    ...current,
                    recentMessages: [{ sender: payload.message.sender, text: payload.message.text, createdAt: payload.message.createdAt }, ...current.recentMessages].slice(0, 50),
                };
            });
        };

        const handleQueue = (payload: { roomId: string; queue: RoomDetail["queue"] }) => {
            if (payload.roomId !== roomId) return;
            setRoom((current) => (current ? { ...current, queue: payload.queue } : current));
        };

        const handleParticipants = (payload: { roomId: string; participantCount: number }) => {
            if (payload.roomId !== roomId) return;
            setRoom((current) => (current ? { ...current, participantCount: payload.participantCount } : current));
        };

        const handlePlayback = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            const currentPlayer = playerRef.current;

            if (payload.currentSong) {
                setRoom((current) => (current ? { ...current, currentSong: payload.currentSong, isLive: true } : current));
                if (!currentPlayer.currentSong || currentPlayer.currentSong._id !== payload.currentSong.trackId) {
                    currentPlayer.playSong({
                        _id: payload.currentSong.trackId || String(Date.now()),
                        title: payload.currentSong.title || "",
                        audioUrl: payload.currentSong.audioUrl || "",
                        coverImage: payload.currentSong.artwork || "",
                        artistName: payload.currentSong.artist || "",
                    }, typeof payload.currentTime === "number" ? payload.currentTime : (typeof payload.at === "number" ? payload.at : 0), true, !payload.isPlaying);
                }
            }

            if (typeof payload.currentTime === "number") {
                currentPlayer.seek(payload.currentTime, true);
            } else if (typeof payload.at === "number") {
                currentPlayer.seek(payload.at, true);
            } else if (typeof payload.to === "number") {
                currentPlayer.seek(payload.to, true);
            }

            if (payload.isPlaying === true) {
                currentPlayer.play(true);
            } else if (payload.isPlaying === false) {
                currentPlayer.pause(true);
            }
        };

        const handleStateSync = (payload: any) => {
            if (payload.roomId !== roomId) return;
            const currentPlayer = playerRef.current;
            
            setRoom((current) => {
                if (!current) {
                    return {
                        _id: payload.roomId || roomId || "",
                        title: "Live Room",
                        description: "",
                        genre: "General",
                        host: { _id: payload.hostId || "", fullName: "Host", username: "host" },
                        hostId: payload.hostId,
                        currentSong: payload.currentSong,
                        isLive: payload.isPlaying,
                        queue: payload.queue ?? [],
                        recentMessages: [],
                        participants: [],
                        djMode: payload.djMode,
                        currentDJ: payload.currentDJ,
                        allowQueueAdd: true,
                        allowChat: true,
                        createdAt: new Date().toISOString(),
                    } as unknown as RoomDetail;
                }
                return { 
                    ...current, 
                    currentSong: payload.currentSong ?? current.currentSong, 
                    isLive: payload.isPlaying,
                    queue: payload.queue ?? current.queue,
                    djMode: payload.djMode,
                    currentDJ: payload.currentDJ,
                    hostId: payload.hostId || (current as any).hostId
                };
            });

            if (payload.currentSong) {
                let targetTime = payload.currentTime || 0;
                if (payload.isPlaying && payload.startTime) {
                    targetTime = (Date.now() - payload.startTime) / 1000;
                }

                if (targetTime < 1.5) {
                    targetTime = 0;
                }
                
                const trackId = payload.currentSong.trackId || String(Date.now());
                if (lastPlayedTrackIdRef.current !== trackId) {
                    lastPlayedTrackIdRef.current = trackId;
                    currentPlayer.playSong({
                        _id: trackId,
                        title: payload.currentSong.title || "",
                        audioUrl: payload.currentSong.audioUrl || "",
                        coverImage: payload.currentSong.artwork || "",
                        artistName: payload.currentSong.artist || "",
                    }, targetTime, true, !payload.isPlaying);
                } else {
                    currentPlayer.seek(targetTime, true);
                    if (payload.isPlaying) {
                        currentPlayer.play(true);
                    } else {
                        currentPlayer.pause(true);
                    }
                }
            } else {
                lastPlayedTrackIdRef.current = null;
                currentPlayer.pause(true);
            }
        };

        const handlePlay = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            const currentPlayer = playerRef.current;

            let targetTime = typeof payload.at === "number" ? payload.at : 0;
            if (payload.startTime) {
                targetTime = (Date.now() - payload.startTime) / 1000;
            }
            
            if (targetTime < 1.5) {
                targetTime = 0;
            }

            if (payload.currentSong) {
                setRoom((current) => (current ? { ...current, currentSong: payload.currentSong, isLive: true } : current));
                
                const trackId = payload.currentSong.trackId || String(Date.now());
                if (lastPlayedTrackIdRef.current !== trackId) {
                    lastPlayedTrackIdRef.current = trackId;
                    currentPlayer.playSong({
                        _id: trackId,
                        title: payload.currentSong.title || "",
                        audioUrl: payload.currentSong.audioUrl || "",
                        coverImage: payload.currentSong.artwork || "",
                        artistName: payload.currentSong.artist || "",
                    }, targetTime, true);
                } else {
                    currentPlayer.play(true);
                    currentPlayer.seek(targetTime, true);
                }
            } else if (currentPlayer.currentSong) {
                currentPlayer.play(true);
                currentPlayer.seek(targetTime, true);
            }
        };

        const handlePause = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            const currentPlayer = playerRef.current;
            currentPlayer.pause(true);
            if (typeof payload.at === "number") {
                currentPlayer.seek(payload.at, true);
            }
        };

        const handleSeek = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            const currentPlayer = playerRef.current;
            const target = typeof payload.to === "number" ? payload.to : (typeof payload.at === "number" ? payload.at : 0);
            currentPlayer.seek(target, true);
        };

        const handleNext = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            const currentPlayer = playerRef.current;
            if (payload.currentSong) {
                setRoom((current) => (current ? { ...current, currentSong: payload.currentSong, queue: payload.queue ?? current.queue } : current));
                
                let targetTime = typeof payload.at === "number" ? payload.at : 0;
                if (payload.startTime) {
                    targetTime = (Date.now() - payload.startTime) / 1000;
                }
                if (targetTime < 1.5) {
                    targetTime = 0;
                }

                const trackId = payload.currentSong.trackId || String(Date.now());
                if (lastPlayedTrackIdRef.current !== trackId) {
                    lastPlayedTrackIdRef.current = trackId;
                    currentPlayer.playSong({
                        _id: trackId,
                        title: payload.currentSong.title || "",
                        audioUrl: payload.currentSong.audioUrl || "",
                        coverImage: payload.currentSong.artwork || "",
                        artistName: payload.currentSong.artist || "",
                    }, targetTime, true);
                }
            } else {
                setRoom((current) => (current ? { ...current, currentSong: undefined, queue: [] } : current));
                lastPlayedTrackIdRef.current = null;
                currentPlayer.pause(true);
            }
        };

        socket.on("room_state_sync", handleStateSync);
        socket.on("room_message", handleMessage);
        socket.on("room_queue_updated", handleQueue);
        socket.on("room_participants_updated", handleParticipants);
        socket.on("room_playback_sync", handlePlayback);
        socket.on("room_play", handlePlay);
        socket.on("room_pause", handlePause);
        socket.on("room_seek", handleSeek);
        socket.on("room_next", handleNext);

        return () => {
            socket.emit("leave_room", roomId);
            socket.off("room_state_sync", handleStateSync);
            socket.off("room_message", handleMessage);
            socket.off("room_queue_updated", handleQueue);
            socket.off("room_participants_updated", handleParticipants);
            socket.off("room_playback_sync", handlePlayback);
            socket.off("room_play", handlePlay);
            socket.off("room_pause", handlePause);
            socket.off("room_seek", handleSeek);
            socket.off("room_next", handleNext);
        };
    }, [roomId, socket]);

    // Auto-advance to next song in queue when current track finishes playing
    useEffect(() => {
        const audio = player.audioRef?.current;
        if (!audio || !roomId) return;

        const handleEnded = () => {
            const finishedTrackId = room?.currentSong?.trackId || player.currentSong?._id || "";
            if (finishedTrackId) {
                if (!socket || !roomId) return;
                socket.emit("room_next", { roomId, isAuto: true, finishedTrackId });
            }
        };

        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [player.audioRef, player.currentSong?._id, room?.currentSong?.trackId, roomId, socket]);

    const emitPlayback = useCallback((event: "room_play" | "room_pause" | "room_seek" | "room_next", payload: Record<string, unknown>) => {
        if (!roomId || !socket) return;
        socket.emit(event, { roomId, ...payload });
    }, [roomId, socket]);

    const syncPlay = useCallback(() => {
        const songToPlay = room?.currentSong || (player.currentSong ? {
            trackId: player.currentSong._id,
            title: player.currentSong.title,
            artist: player.currentSong.artistName || "",
            artwork: player.currentSong.coverImage || "",
            audioUrl: player.currentSong.audioUrl,
        } : null);

        if (songToPlay) {
            emitPlayback("room_play", {
                at: player.currentTime,
                song: songToPlay,
            });

            if (!player.currentSong || player.currentSong._id !== songToPlay.trackId) {
                player.playSong({
                    _id: songToPlay.trackId || String(Date.now()),
                    title: songToPlay.title || "",
                    audioUrl: songToPlay.audioUrl || "",
                    coverImage: songToPlay.artwork || "",
                    artistName: songToPlay.artist || "",
                }, player.currentTime || 0, true);
            } else {
                player.play(true);
            }
        } else {
            player.play(true);
        }
    }, [emitPlayback, player, room?.currentSong]);

    const syncPause = useCallback(() => {
        emitPlayback("room_pause", { at: player.currentTime });
        player.pause(true);
    }, [emitPlayback, player]);

    const syncSeek = useCallback((value: number) => {
        emitPlayback("room_seek", { to: value });
        player.seek(value, true);
    }, [emitPlayback, player]);

    const syncNext = useCallback(() => {
        const nextTrack = room?.queue && room.queue.length > 0 ? room.queue[0] : null;
        if (nextTrack) {
            player.playSong({
                _id: nextTrack.trackId || String(Date.now()),
                title: nextTrack.title || "",
                audioUrl: nextTrack.audioUrl || "",
                coverImage: nextTrack.artwork || "",
                artistName: nextTrack.artist || "",
            }, 0, true);
        } else {
            player.pause(true);
        }
        emitPlayback("room_next", {});
    }, [emitPlayback, room?.queue, player]);

    // Lock player controls for non-host listeners while inside a live room
    useEffect(() => {
        if (roomId && !isHost) {
            player.setIsRemoteControlled(true);
            player.setCustomControls(null);
        } else if (roomId && isHost) {
            player.setIsRemoteControlled(false);
            player.setCustomControls({
                onPlay: syncPlay,
                onPause: syncPause,
                onSeek: syncSeek,
                onSkipNext: syncNext,
            });
        } else {
            player.setIsRemoteControlled(false);
            player.setCustomControls(null);
        }
        return () => {
            player.setIsRemoteControlled(false);
            player.setCustomControls(null);
        };
    }, [roomId, isHost, player, syncPlay, syncPause, syncSeek, syncNext]);

    const currentSongTitle = useMemo(() => room?.currentSong?.title || player.currentSong?.title || "Nothing playing yet", [room?.currentSong?.title, player.currentSong?.title]);
    const currentArtistName = useMemo(() => room?.currentSong?.artist || player.currentSong?.artistName || "Host chooses the vibe", [room?.currentSong?.artist, player.currentSong?.artistName]);

    const handleJoin = async () => {
        if (!roomId) {
            toast.error("Open a room first");
            return;
        }

        setIsJoining(true);
        try {
            const response = await roomService.joinRoom(roomId);
            setRoom(response.room);
            toast.success("Joined live room");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to join room");
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!roomId) return;
        try {
            await roomService.leaveRoom(roomId);
            toast.success("Left room");
            
            // Restore previous song in paused condition using the startPaused option
            player.setIsRemoteControlled(false);
            player.setCustomControls(null);
            if (preRoomState?.song) {
                player.playSong(preRoomState.song, preRoomState.currentTime, true, true);
            } else {
                player.pause(true);
            }
            
            navigate("/rooms/discovery");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to leave room");
        }
    };

    const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!roomId || !message.trim()) return;

        const textToSend = message.trim();
        setMessage("");
        setIsSendingMessage(true);
        try {
            await roomService.sendRoomMessage(roomId, textToSend);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send message");
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleSelectSongToQueue = async (song: SongItem) => {
        if (!roomId) return;
        setIsAddingQueue(true);
        try {
            await roomService.addTrackToQueue(roomId, {
                trackId: song._id,
                title: song.title,
                artist: song.artistName || song.artist?.name || song.artist?.username || "Artist",
                artwork: song.coverImage || "",
                audioUrl: song.audioUrl || "",
            });
            toast.success(`Added "${song.title}" to queue`);
            // Queue will be updated via socket "room_queue_updated" event
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add song to queue");
        } finally {
            setIsAddingQueue(false);
        }
    };

    const handleCustomAddToQueue = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!roomId || !customTitle.trim()) return;

        setIsAddingQueue(true);
        try {
            await roomService.addTrackToQueue(roomId, {
                trackId: `${Date.now()}`,
                title: customTitle.trim(),
                artist: customArtist.trim() || "Artist",
                artwork: room?.currentSong?.artwork || room?.coverImage || "",
                audioUrl: room?.currentSong?.audioUrl || "",
            });
            setCustomTitle("");
            setCustomArtist("");
            setShowCustomAdd(false);
            toast.success(`Added "${customTitle.trim()}" to queue`);
            // Queue will be updated via socket "room_queue_updated" event
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add track");
        } finally {
            setIsAddingQueue(false);
        }
    };

    const handleRemoveFromQueue = async (index: number) => {
        if (!roomId || !isHost) return;
        try {
            await roomService.removeTrackFromQueue(roomId, index);
            // Queue will be updated via socket "room_queue_updated" event
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove track");
        }
    };

    const handleReaction = (reaction: string) => {
        if (!roomId || !socket) return;
        socket.emit("room_reaction", { roomId, reaction });
        toast.success(`Sent ${reaction}`);
    };



    const filteredCatalog = useMemo(() => {
        if (!songSearch.trim()) return availableSongs;
        const q = songSearch.toLowerCase().trim();
        return availableSongs.filter(
            (s) =>
                (s.title || "").toLowerCase().includes(q) ||
                (s.artistName || s.artist?.name || s.artist?.username || "").toLowerCase().includes(q)
        );
    }, [availableSongs, songSearch]);

    // Chronological order for messages (older at top, newer at bottom like WhatsApp)
    const displayMessages = useMemo(() => {
        if (!room?.recentMessages) return [];
        return [...room.recentMessages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [room?.recentMessages]);

    // Auto scroll chat feed to bottom when new messages arrive without scrolling the whole page
    useEffect(() => {
        if (rightTab === "chat" && chatContainerRef.current) {
            const container = chatContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [displayMessages.length, rightTab]);

    if (!roomId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface text-white px-4">
                <div className="max-w-xl rounded-3xl border border-white/10 bg-surface-container p-8 text-center backdrop-blur-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Live session</p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Open a room to start listening together.</h1>
                    <p className="mt-4 text-sm text-slate-400">Use the discovery page or create room flow first, then return with a room ID in the URL.</p>
                    <button
                        onClick={() => navigate("/rooms/discovery")}
                        className="mt-6 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:scale-105 transition-transform"
                    >
                        Explore Rooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 w-full pb-48 lg:pb-32">
            {/* Auto-play Blocked Overlay */}
            {player.requiresInteraction && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl text-primary animate-pulse">volume_up</span>
                        </div>
                        <h2 className="text-2xl font-bold font-headline mb-3 text-white">Audio Sync Required</h2>
                        <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                            Your browser has paused the audio to prevent unexpected playback. Click below to synchronize and start listening with the room.
                        </p>
                        <button
                            onClick={() => {
                                player.play(true);
                                player.setRequiresInteraction(false);
                            }}
                            className="w-full py-4 rounded-xl bg-primary text-on-primary font-extrabold text-sm uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_20px_rgba(var(--color-primary),0.4)] cursor-pointer"
                        >
                            Sync Audio
                        </button>
                    </div>
                </div>
            )}

            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        backdrop-filter: blur(16px);
                        background: rgba(28, 32, 39, 0.6);
                    }`,
                }}
            />

            {/* Ambient Background Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-tertiary-container/5 blur-[120px] pointer-events-none" />

            <main className="pt-6 md:pt-10 px-4 md:px-6 lg:px-8 w-full max-w-7xl mx-auto">
                {/* Navigation Back Bar */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                            {isConnected ? "Live Session" : "Connecting..."}
                        </span>
                        {!hasJoined && (
                            <button
                                onClick={handleJoin}
                                disabled={isJoining || !isConnected}
                                className="px-5 py-1.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
                            >
                                {isJoining ? "Joining..." : "Join Session"}
                            </button>
                        )}
                        <button
                            onClick={handleLeave}
                            className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-white/10"
                        >
                            Leave
                        </button>
                    </div>
                </div>

                {/* ================= TOP SECTION: HERO PLAYER (LEFT) & CHAT/PARTICIPANTS (RIGHT) EQUAL HEIGHT ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* LEFT: ROOM BANNER & HERO PLAYER */}
                    <div className="lg:col-span-7 xl:col-span-8 glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
                        {/* Room Header Info */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-1">
                                <Radio className="w-4 h-4" />
                                <span>Shared Listening Hub</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-white">
                                {room?.roomName || "Loading Room..."}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
                                {room?.description || "Enjoy synchronized music listening in real-time with listeners from around the world."}
                            </p>
                        </div>

                        {/* Main Track Display Card */}
                        <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
                            {/* Track Cover Image */}
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shrink-0 shadow-2xl relative group bg-surface-container">
                                <img
                                    src={room?.currentSong?.artwork || player.currentSong?.coverImage || room?.coverImage || "/images/earth_lens_studio.png"}
                                    alt={currentSongTitle}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
                            </div>

                            {/* Track Info & Controls */}
                            <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-2.5 py-1 rounded bg-primary/10 inline-block mb-1.5">
                                        {player.isPlaying ? "NOW PLAYING" : "LIVE PLAYBACK"}
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight text-white truncate">
                                        {currentSongTitle}
                                    </h2>
                                    <p className="text-slate-400 text-sm truncate mt-0.5">
                                        {currentArtistName}
                                    </p>
                                </div>

                                {/* Seek Bar */}
                                <div className="mt-3">
                                    {isHost ? (
                                        <input
                                            type="range"
                                            min={0}
                                            max={Math.max(player.duration, 1)}
                                            step={1}
                                            value={Math.min(player.currentTime, Math.max(player.duration, 1))}
                                            onChange={(e) => syncSeek(Number(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    ) : (
                                        <div className="w-full h-1.5 bg-white/10 rounded-lg overflow-hidden relative">
                                            <div
                                                className="h-full bg-primary transition-all duration-300 rounded-lg"
                                                style={{ width: `${Math.min(100, Math.max(0, (player.currentTime / Math.max(player.duration, 1)) * 100))}%` }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1">
                                        <span>{formatTime(player.currentTime)}</span>
                                        <span>{formatTime(player.duration || 0)}</span>
                                    </div>
                                </div>

                                {/* Playback Action Controls: Host vs Listener */}
                                {isHost ? (
                                    <div className="flex items-center gap-3 mt-3">
                                        {player.isPlaying ? (
                                            <button
                                                onClick={syncPause}
                                                className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/20"
                                            >
                                                <Pause className="w-3.5 h-3.5 fill-current" />
                                                Pause
                                            </button>
                                        ) : (
                                            <button
                                                onClick={syncPlay}
                                                className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/20"
                                            >
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                Play Live
                                            </button>
                                        )}
                                        <button
                                            onClick={syncNext}
                                            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <SkipForward className="w-3.5 h-3.5" />
                                            Next Track
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-3 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full w-fit">
                                        <Shield className="w-3.5 h-3.5 text-primary" />
                                        <span>Playback controlled by host ({room?.host?.fullName || room?.host?.username || "Host"})</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live Reaction Emojis */}
                        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Reactions:</span>
                            {reactionOptions.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-lg transition-transform hover:scale-110 cursor-pointer"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: CHAT / PARTICIPANTS TAB WITH EQUAL HEIGHT */}
                    <div className="lg:col-span-5 xl:col-span-4 glass-panel p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
                        {/* Tab Switcher Header */}
                        <div className="p-1 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-1 mb-4">
                            <button
                                onClick={() => setRightTab("chat")}
                                className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    rightTab === "chat"
                                        ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Live Chat
                            </button>

                            <button
                                onClick={() => setRightTab("participants")}
                                className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    rightTab === "participants"
                                        ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                Listeners ({room?.participantCount ?? 0})
                            </button>
                        </div>

                        {/* TAB A: LIVE CHAT */}
                        {rightTab === "chat" ? (
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                                    <h3 className="text-base font-bold font-headline text-white flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        Room Discussion
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Real-time
                                    </span>
                                </div>

                                {/* WhatsApp-Style Chat Feed */}
                                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3 max-h-[250px] flex flex-col">
                                    {displayMessages.map((item, index) => {
                                        const isMe = currentUser && item.sender?._id && String(item.sender._id) === String(currentUser._id);
                                        const senderName = isMe ? "You" : (item.sender?.fullName || item.sender?.username || "Listener");

                                        return (
                                            <div
                                                key={`${item.createdAt}-${index}`}
                                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                            >
                                                <div
                                                    className={`p-2.5 sm:p-3 max-w-[85%] rounded-2xl space-y-1 shadow-md ${
                                                        isMe
                                                            ? "bg-primary/20 text-white rounded-tr-none border border-primary/30"
                                                            : "bg-white/5 text-white rounded-tl-none border border-white/10"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-1">
                                                        <span className={`text-[11px] font-extrabold flex items-center gap-1 ${isMe ? "text-primary" : "text-teal-400"}`}>
                                                            <User className="w-3 h-3" />
                                                            {senderName}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400">
                                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs leading-relaxed break-words whitespace-pre-wrap pt-0.5">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {displayMessages.length === 0 && (
                                        <div className="py-10 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl">
                                            No chat messages yet. Say hello to the room!
                                        </div>
                                    )}
                                </div>

                                {/* Chat Form */}
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Send a live message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="flex-1 px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSendingMessage || !message.trim()}
                                        className="px-4 py-2.5 rounded-2xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        Send
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* TAB B: PARTICIPANTS */
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                                    <h3 className="text-base font-bold font-headline text-white flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        Room Participants
                                    </h3>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10">
                                        {room?.participantCount ?? 0} Online
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[300px]">
                                    {/* Host Card */}
                                    {room?.host && (
                                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/30">
                                                    {room.host.fullName?.[0] || room.host.username?.[0] || "H"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-white flex items-center gap-1">
                                                        {room.host.fullName || room.host.username}
                                                        <Shield className="w-3 h-3 text-primary" />
                                                    </p>
                                                    <p className="text-[9px] text-primary font-semibold uppercase tracking-wider">
                                                        Room Host
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    )}

                                    {/* Real Participants / Listeners List */}
                                    {(room?.participants || []).map((participant) => {
                                        const isHostUser = room?.host && String(participant._id) === String(room.host._id);
                                        if (isHostUser) return null; // Host is already shown above in Host Card

                                        const pName = participant.fullName || participant.username || "Listener";
                                        const pInitial = pName[0]?.toUpperCase() || "L";

                                        return (
                                            <div
                                                key={participant._id}
                                                className="p-3 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {participant.avatar ? (
                                                        <img
                                                            src={participant.avatar}
                                                            alt={pName}
                                                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-slate-300 font-bold text-xs">
                                                            {pInitial}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-xs text-slate-200">
                                                            {pName}
                                                        </p>
                                                        <p className="text-[9px] text-slate-500">Listening live</p>
                                                    </div>
                                                </div>

                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Active
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {(!room?.participants || room.participants.length <= 1) && (
                                        <div className="p-4 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl">
                                            No other active listeners in room yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                </div>

                {/* ================= FULL-WIDTH BOTTOM SECTION: CHOOSE SONG & UP NEXT QUEUE ================= */}
                <div className="w-full space-y-6 mt-6">
                    
                    {/* 1. CHOOSE SONG FOR QUEUE (HOST ONLY) */}
                    {isHost && (
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-bold font-headline tracking-tight text-white flex items-center gap-2">
                                    <Music className="w-5 h-5 text-primary" />
                                    Choose Song for Queue
                                </h3>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Select a track below to add it directly to the next queue!
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomAdd(false)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                        !showCustomAdd
                                            ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                                            : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                                    }`}
                                >
                                    Catalog
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomAdd(true)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                        showCustomAdd
                                            ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                                            : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                                    }`}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Custom Track
                                </button>
                            </div>
                        </div>

                        {/* Catalog Browse & Search View */}
                        {!showCustomAdd && (
                            <div className="space-y-4">
                                {/* Search Input Bar (Full Width) */}
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search catalog by title or artist name..."
                                        value={songSearch}
                                        onChange={(e) => setSongSearch(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-primary transition-colors placeholder:text-slate-500"
                                    />
                                    {songSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setSongSearch("")}
                                            className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Responsive 4-Column Full-Width Songs Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-80 overflow-y-auto pr-1">
                                    {filteredCatalog.map((song) => (
                                        <div
                                            key={song._id}
                                            className="p-3 rounded-2xl bg-black/30 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between gap-3 group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <img
                                                    src={song.coverImage || "/images/earth_lens_studio.png"}
                                                    alt={song.title}
                                                    className="w-10 h-10 rounded-xl object-cover shrink-0 bg-surface-container shadow"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-xs text-white truncate group-hover:text-primary transition-colors">
                                                        {song.title}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                                        {song.artistName || song.artist?.name || song.artist?.username || "Artist"}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSelectSongToQueue(song)}
                                                disabled={isAddingQueue}
                                                className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:scale-105 transition-all shrink-0 cursor-pointer shadow-md flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Queue
                                            </button>
                                        </div>
                                    ))}

                                    {filteredCatalog.length === 0 && (
                                        <div className="col-span-full py-10 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl">
                                            No matching songs found for "{songSearch}". Try searching for another track or switch to "Custom Track".
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Custom Song Form */}
                        {showCustomAdd && (
                            <form onSubmit={handleCustomAddToQueue} className="bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Add Custom Track Info
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Song Title *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Blinding Lights"
                                            value={customTitle}
                                            onChange={(e) => setCustomTitle(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-white text-sm outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Artist Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. The Weeknd"
                                            value={customArtist}
                                            onChange={(e) => setCustomArtist(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-white text-sm outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-1">
                                    <button
                                        type="submit"
                                        disabled={isAddingQueue || !customTitle.trim()}
                                        className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 shadow-lg shadow-primary/20"
                                    >
                                        {isAddingQueue ? "Adding..." : "Add to Next Queue"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomAdd(false)}
                                        className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                    )}

                    {/* 2. UP NEXT QUEUE LIST (FULL WIDTH) */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold font-headline tracking-tight text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Up Next Queue ({room?.queue.length ?? 0})
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                            {(room?.queue || []).map((item, index) => (
                                <div
                                    key={`${item.trackId}-${index}`}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="text-xs font-black text-primary w-5 shrink-0 text-center">
                                            {(index + 1).toString().padStart(2, "0")}
                                        </span>
                                        <img
                                            src={item.artwork || room?.coverImage || "/images/earth_lens_studio.png"}
                                            alt={item.title}
                                            className="w-10 h-10 rounded-xl object-cover shrink-0 bg-surface-container"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                            }}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-xs text-white truncate">{item.title}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{item.artist || "Artist"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-white/5">
                                            Queued
                                        </span>
                                        {isHost && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFromQueue(index)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                title="Remove from queue"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {(!room?.queue || room.queue.length === 0) && (
                                <div className="col-span-full p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl">
                                    No songs in queue yet. Pick a song above to add it to next queue!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
