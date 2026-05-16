import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authUtils } from "../../utils/auth";
import { songService, type SongItem } from "../../api/song.service";
import { roomService, type RoomDetail, type ParticipantInfo } from "../../api/room.service";
import { useSocket } from "../../context/SocketContext";
import { usePlayer } from "../../context/PlayerContext";

const reactions = ["🔥", "✨", "💚", "🎧", "🙌", "💫", "🎶"];

interface FloatingReaction { id: number; emoji: string; x: number }
type Tab = "messages" | "participants";

export default function LiveSessionPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const roomId = params.get("roomId") || "";
    const { socket, isConnected } = useSocket();
    const player = usePlayer();

    const [room, setRoom] = useState<RoomDetail | null>(null);
    const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
    const [myId, setMyId] = useState("");
    const [message, setMessage] = useState("");
    const [joining, setJoining] = useState(false);
    const [tab, setTab] = useState<Tab>("messages");
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<SongItem[]>([]);
    const [searching, setSearching] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const [currentLine, setCurrentLine] = useState(-1);
    const lastManualScroll = useRef(0);

    // Process lyrics into lines
    const lyricsLines = useMemo(() => room?.currentSong?.lyrics?.split("\n") || [], [room?.currentSong?.lyrics]);

    // Track current line index based on playback progress
    useEffect(() => {
        if (lyricsLines.length === 0) {
            if (currentLine !== -1) setCurrentLine(-1);
            return;
        }
        const progress = player.duration > 0 ? player.currentTime / player.duration : 0;
        const idx = Math.floor(progress * lyricsLines.length);
        if (idx !== currentLine) {
            setCurrentLine(idx);
        }
    }, [player.currentTime, player.duration, lyricsLines, currentLine]);

    // Save/Restore player state when entering/leaving room
    const savedStateRef = useRef<{ song: any, time: number, isPlaying: boolean } | null>(null);
    useEffect(() => {
        // Capture state only once when the room page is first loaded
        if (!savedStateRef.current && player.currentSong) {
            savedStateRef.current = {
                song: player.currentSong,
                time: player.currentTime,
                isPlaying: player.isPlaying
            };
        }

        return () => {
            // Restore previous song when leaving the room
            if (savedStateRef.current?.song) {
                player.playSong(savedStateRef.current.song, savedStateRef.current.time);
                if (!savedStateRef.current.isPlaying) {
                    setTimeout(() => player.pause(), 50);
                }
            }
        };
    }, []); // Run once on mount/unmount

    const [remotePlaying, setRemotePlaying] = useState(false);
    const remotePlayingRef = useRef(false);
    useEffect(() => { remotePlayingRef.current = remotePlaying; }, [remotePlaying]);
    const [remoteTime, setRemoteTime] = useState(0);
    const [remoteStart, setRemoteStart] = useState<number | null>(null);
    const [floating, setFloating] = useState<FloatingReaction[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const lyricsRef = useRef<HTMLDivElement>(null);
    const rId = useRef(0);
    const st = useRef<ReturnType<typeof setTimeout>>();

    // Auto-scroll lyrics (only when line changes and user isn't manually scrolling)
    useEffect(() => {
        if (!lyricsRef.current || currentLine === -1 || !showLyrics) return;

        // Don't auto-scroll if user scrolled manually in the last 3 seconds
        const now = Date.now();
        if (now - lastManualScroll.current < 3000) return;

        const container = lyricsRef.current;
        const wrapper = container.firstElementChild as HTMLElement;
        const activeElement = wrapper?.children[currentLine] as HTMLElement;

        if (activeElement) {
            const targetScroll = activeElement.offsetTop - (container.offsetHeight / 2) + (activeElement.offsetHeight / 2);

            // Only scroll if the difference is significant to avoid tiny jitters
            if (Math.abs(container.scrollTop - targetScroll) > 5) {
                container.scrollTo({
                    top: targetScroll,
                    behavior: "smooth"
                });
            }
        }
    }, [currentLine, showLyrics, lyricsLines.length]);

    const isHost = useMemo(() => {
        if (!room || !myId) return false;
        const h = room.host && typeof room.host === "object" ? (room.host as any)._id || room.host : room.host;
        return String(h) === myId;
    }, [room, myId]);

    const hasJoined = useMemo(() => {
        if (!myId) return false;
        const inRoom = room?.participants?.some(p => String(p._id || p) === myId);
        const inLive = participants?.some(p => String(p.userId) === myId);
        return !!(inRoom || inLive);
    }, [room, participants, myId]);

    // Load room
    useEffect(() => {
        let m = true;
        if (!roomId) { setRoom(null); return; }
        roomService.getRoomById(roomId).then(r => {
            if (m) {
                const data = r.room;
                if (data) {
                    data.recentMessages = [...(data.recentMessages || [])].reverse();
                    setRoom(data);
                    setParticipants(data.participants || [] as any);
                }
            }
        }).catch(() => toast.error("Failed to load room"));
        return () => { m = false; };
    }, [roomId]);

    // User ID from token
    useEffect(() => {
        try {
            const t = authUtils.getToken();
            if (t) { const p = JSON.parse(atob(t.split(".")[1])); if (p.id) setMyId(p.id); }
        } catch { }
    }, []);

    // Remote control mode (Lock global player for listeners)
    useEffect(() => {
        if (!roomId || !isConnected) {
            player.setIsRemoteControlled(false);
            return;
        }

        // Lock player if joined and NOT host
        if (hasJoined && !isHost) {
            player.setIsRemoteControlled(true);
        } else {
            player.setIsRemoteControlled(false);
        }

        return () => player.setIsRemoteControlled(false);
    }, [roomId, hasJoined, isHost, isConnected]);

    // Socket - join room on mount (server handles cleanup on disconnect)
    useEffect(() => {
        if (!socket || !roomId) return;
        socket.emit("join_room", { roomId });

        const h = (p: any) => {
            if (p.roomId !== roomId) return;
            setRemotePlaying(p.isPlaying);
            setRemoteTime(p.currentTime);
            setRemoteStart(p.startTime);
            setRoom(prev => prev ? {
                ...prev,
                queue: p.queue || prev.queue,
                currentSong: p.currentSong || prev.currentSong
            } : prev);
        };
        const hplay = (p: any) => {
            if (p.roomId !== roomId) return;
            setRemotePlaying(true);
            setRemoteTime(p.at || 0);
            setRemoteStart(p.startTime || Date.now() - ((p.at || 0) * 1000));
            if (p.currentSong) setRoom(prev => prev ? { ...prev, currentSong: p.currentSong } : prev);
        };
        const hpause = (p: any) => {
            if (p.roomId !== roomId) return;
            setRemotePlaying(false);
            setRemoteTime(p.at || 0);
            setRemoteStart(null);
        };
        const hseek = (p: any) => {
            if (p.roomId !== roomId) return;
            setRemoteTime(p.to || 0);
            if (remotePlayingRef.current) setRemoteStart(Date.now() - ((p.to || 0) * 1000));
        };
        const hp = (p: any) => { if (p.roomId === roomId) setParticipants(p.participants || []); };
        const hm = (p: any) => {
            if (p.roomId !== roomId) return;
            setRoom(prev => prev ? { ...prev, recentMessages: [...prev.recentMessages, { sender: p.message.sender ? { _id: p.message.sender._id, fullName: p.message.sender.fullName, username: p.message.sender.username, avatar: p.message.sender.avatar, role: "" } : null, text: p.message.text, createdAt: p.message.createdAt }].slice(-20) } : prev);
        };
        const hr = (p: any) => {
            if (p.roomId !== roomId) return;
            const id = ++rId.current;
            setFloating(prev => [...prev.slice(-20), { id, emoji: p.reaction, x: Math.random() * 80 + 10 }]);
            setTimeout(() => setFloating(prev => prev.filter(r => r.id !== id)), 2500);
        };
        const hq = (p: any) => { if (p.roomId === roomId) setRoom(prev => prev ? { ...prev, queue: p.queue } : prev); };
        const hnx = (p: any) => {
            if (p.roomId !== roomId) return;
            if (p.currentSong) { setRemotePlaying(true); setRemoteTime(0); setRemoteStart(Date.now()); setRoom(prev => prev ? { ...prev, currentSong: p.currentSong, queue: p.queue || prev.queue } : prev); }
            else { setRemotePlaying(false); setRemoteTime(0); setRemoteStart(null); setRoom(prev => prev ? { ...prev, currentSong: null as any } : prev); }
        };
        const hhc = (p: any) => { if (p.roomId === roomId) toast.info("Host has changed"); };
        const herr = (p: any) => toast.error(p.message || "Room error");

        socket.on("room_state_sync", h);
        socket.on("room_playback_sync", h);
        socket.on("room_play", hplay);
        socket.on("room_pause", hpause);
        socket.on("room_seek", hseek);
        socket.on("room_participants", hp); socket.on("room_message", hm); socket.on("room_reaction", hr);
        socket.on("room_queue_updated", hq);
        socket.on("room_next", hnx); socket.on("room_host_changed", hhc); socket.on("room_error", herr);

        return () => {
            const off = (e: string, fn: any) => socket.off(e, fn);
            off("room_state_sync", h);
            off("room_playback_sync", h);
            off("room_play", hplay);
            off("room_pause", hpause);
            off("room_seek", hseek);
            off("room_participants", hp); off("room_message", hm); off("room_reaction", hr);
            off("room_queue_updated", hq);
            off("room_next", hnx); off("room_host_changed", hhc); off("room_error", herr);
        };
    }, [roomId, socket]);

    const displayTime = (remotePlaying && remoteStart)
        ? (Date.now() - remoteStart) / 1000
        : remoteTime;

    // Sync player with room
    useEffect(() => {
        const url = room?.currentSong?.audioUrl;
        const id = room?.currentSong?.trackId;
        if (url && id && player && isConnected) {
            const isSameSong = (player.currentSong?._id === id || player.currentSong?.audioUrl === url);

            if (isSameSong) {
                // Sync play/pause state - ONLY FOR LISTENERS
                // Host drives the state, listeners follow it
                if (!isHost) {
                    if (remotePlaying && !player.isPlaying) player.play();
                    if (!remotePlaying && player.isPlaying) player.pause();

                    // Drift correction: if off by more than 1.5 seconds, sync to room time
                    // We check this frequently since displayTime is live and player.currentTime is a dependency
                    const diff = Math.abs(player.currentTime - displayTime);
                    if (diff > 1.5 && remotePlaying) {
                        player.seek(displayTime);
                    }
                }
            } else {
                // Different song, load it with current displayTime
                player.playSong({
                    _id: id,
                    title: room.currentSong.title,
                    audioUrl: url,
                    coverImage: room.currentSong.artwork,
                    artistName: room.currentSong.artist
                }, displayTime > 0.5 ? displayTime : 0);
            }
        }
    }, [room?.currentSong?.audioUrl, room?.currentSong?.trackId, remotePlaying, player, isConnected, displayTime, isHost, player.currentTime]);

    // Host: Periodically broadcast playback state to keep everyone synced
    const hostSyncRef = useRef({ time: 0, playing: false, song: null as any });
    useEffect(() => {
        hostSyncRef.current = { time: player.currentTime, playing: player.isPlaying, song: room?.currentSong };
    }, [player.currentTime, player.isPlaying, room?.currentSong]);

    useEffect(() => {
        if (!isHost || !socket || !roomId || !isConnected) return;

        const interval = setInterval(() => {
            if (hostSyncRef.current.playing) {
                socket.emit("room_playback_sync", {
                    roomId,
                    currentSong: hostSyncRef.current.song,
                    currentTime: hostSyncRef.current.time,
                    isPlaying: hostSyncRef.current.playing
                });
            }
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, [isHost, socket, roomId, isConnected]);

    // Host: Broadcast local playback state changes to the room
    const lastEmittedPlaying = useRef(false);
    useEffect(() => {
        if (!isHost || !socket || !roomId || !isConnected) return;

        // Only emit if the state actually changed from what we last thought
        if (player.isPlaying !== lastEmittedPlaying.current) {
            if (player.isPlaying) {
                socket.emit("room_play", { roomId, at: player.currentTime });
            } else {
                socket.emit("room_pause", { roomId, at: player.currentTime });
            }
            lastEmittedPlaying.current = player.isPlaying;
        }
    }, [player.isPlaying, isHost, socket, roomId, isConnected]);

    // Host: Broadcast seeks
    const lastInternalTime = useRef(0);
    useEffect(() => {
        if (!isHost || !socket || !roomId || !isConnected) return;

        const diff = player.currentTime - lastInternalTime.current;
        // If the time jumped by more than 2 seconds (unnatural for normal playback)
        // it's likely a manual seek by the host
        if (Math.abs(diff) > 2) {
            socket.emit("room_seek", { roomId, to: player.currentTime });
        }
        lastInternalTime.current = player.currentTime;
    }, [player.currentTime, isHost, socket, roomId, isConnected]);

    // Auto-play next song when current one ends (Host only)
    useEffect(() => {
        if (!isHost || !socket || !roomId || !player.audioRef.current) return;

        const audio = player.audioRef.current;
        const handleEnded = () => {
            if (room?.queue && room.queue.length > 0) {
                socket.emit("room_next", { roomId });
            }
        };

        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [isHost, socket, roomId, room?.queue, player.audioRef]);

    // Actions
    const handleSearch = (q: string) => {
        setSearch(q);
        if (st.current) clearTimeout(st.current);
        if (!q.trim()) { setResults([]); return; }
        st.current = setTimeout(async () => {
            setSearching(true);
            try { const r = await songService.searchSongs(q.trim()); setResults(r.songs || []); } catch { setResults([]); }
            finally { setSearching(false); }
        }, 400);
    };

    const playSong = (s: SongItem) => {
        if (!roomId || !socket || !isHost) return;
        const songData = {
            trackId: s._id,
            title: s.title,
            artist: s.artistName || "",
            artwork: s.coverImage || "",
            audioUrl: s.audioUrl || ""
        };
        socket.emit("room_play", { roomId, at: 0, song: songData });

        // Also update local player immediately for better responsiveness
        player.playSong({
            _id: s._id,
            title: s.title,
            audioUrl: s.audioUrl || "",
            coverImage: s.coverImage,
            artistName: s.artistName
        });

        setPickerOpen(false); setSearch(""); setResults([] as any);
    };

    const addToQueue = (s: SongItem) => {
        if (!roomId || !socket || !isHost) return;
        socket.emit("room_add_to_queue", {
            roomId,
            track: {
                trackId: s._id,
                title: s.title,
                artist: s.artistName || "",
                artwork: s.coverImage || "",
                audioUrl: s.audioUrl || ""
            }
        });
        toast.success(`"${s.title}" added`);
    };

    if (!roomId) return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-linear(circle_at_top,rgba(90,255,225,0.08),transparent_22%),linear-linear(180deg,#0f131b_0%,#07090d_100%)] px-4 text-white">
            <div className="max-w-lg rounded-2xl border border-white/6 bg-white/3 p-8 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/60">Live session</p>
                <h1 className="mt-3 text-2xl font-bold tracking-tight">Open a room to start listening together.</h1>
                <p className="mt-3 text-sm text-slate-500">Create or join a room from the discovery page, then come back here.</p>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-[radial-linear(circle_at_top,rgba(90,255,225,0.06),transparent_30%),linear-linear(180deg,#0b0e14,#07090d)] text-white">
            {/* Floating reactions */}
            <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
                {floating.map(r => (
                    <span key={r.id} className="absolute text-2xl" style={{ left: `${r.x}%`, bottom: "20%", animation: "rf 2.5s ease-out forwards" }}>{r.emoji}</span>
                ))}
            </div>
            <style>{`@keyframes rf{0%{opacity:1;transform:translateY(0) scale(0.5)}20%{opacity:1;transform:translateY(-40px) scale(1.1)}100%{opacity:0;transform:translateY(-180px) scale(0.7)}}`}</style>

            <div className={`mx-auto flex w-full flex-col gap-4 px-4 py-5 lg:pb-0 md:pb-44 pb-40 lg:px-6 lg:grid ${sidebarOpen ? "xl:grid-cols-[1fr_24rem] " : "lg:grid-cols-1"} min-h-[calc(100vh-7rem)] transition-all duration-300`}>
                {/* ── Left: Player ── */}
                <div className="gap-4 pr-1 xl:pb-32 space-y-4">
                    {/* Header bar */} 
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/60">Room · {room?.isLive ? "Live" : "Offline"}</p>
                            <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight">{room?.roomName || "Loading..."}</h1>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {!hasJoined ? (
                                <button className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-[13px] font-medium text-slate-300 transition hover:border-white/[0.15] hover:text-white" type="button" onClick={async () => { if (!roomId) return; setJoining(true); try { const r = await roomService.joinRoom(roomId); setRoom(r.room); if (r.room.participants) setParticipants(r.room.participants as any); } catch (e: any) { toast.error(e?.message || "Failed to join"); } finally { setJoining(false); } }} disabled={joining || !isConnected}>
                                    {joining ? "Joining..." : "Join"}
                                </button>
                            ) : (
                                <span className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary">Joined ✓</span>
                            )}
                            <button className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-[13px] font-medium text-slate-300 transition hover:border-red-400/30 hover:text-red-300" type="button" onClick={async () => { if (!roomId) return; socket?.emit("leave_room", roomId); try { await roomService.leaveRoom(roomId); navigate("/rooms/discovery"); } catch { } }}>Leave</button>
                        </div>
                    </div>
                    
                    {/* cover + up next */}
                    <div className="flex xl:flex-row md:flex-row flex-col gap-3">
                        {/* Artwork + playback */}
                        <div className="relative lg:w-[70%] lg:h-[70%] md:h-[60%] md:w-[60%] shrink-0 overflow-hidden rounded-xl border border-white/6 bg-white/3">
                            <div className="aspect-square overflow-hidden bg-black/40">
                                <img alt="" className="h-full w-full object-cover opacity-90" src={room?.currentSong?.artwork || room?.coverImage || room?.bannerImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop"} />
                            </div>
                            <div className="absolute inset-0 bg-linear-to-t from-[#0b0e14] via-[#0b0e14]/10 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div className="min-w-0 max-w-lg">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary/50">Now playing</p>
                                        <h2 className="mt-0.5 truncate text-xl font-bold md:text-2xl">{room?.currentSong?.title || "Nothing playing"}</h2>
                                        <p className="truncate text-sm text-slate-400">{room?.currentSong?.artist || (room?.currentSong?.title ? "" : "Pick a song to start")}</p>
                                        {(remotePlaying || player?.isPlaying) && <p className="mt-1 text-xs text-primary/40 tabular-nums">{Math.floor((player?.currentTime || 0) / 60)}:{(Math.floor(player?.currentTime || 0) % 60).toString().padStart(2, "0")}</p>}
                                    </div>

                                    <div className="flex shrink-0 gap-1.5">
                                        {room?.currentSong?.lyrics && (
                                            <button
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${showLyrics ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 bg-white/6 text-white hover:bg-white/[0.12]"}`}
                                                type="button"
                                                onClick={() => setShowLyrics(!showLyrics)}
                                                title={showLyrics ? "Hide Lyrics" : "Show Lyrics"}
                                            >
                                                <span className="material-symbols-outlined text-xl">
                                                    lyrics
                                                </span>
                                            </button>
                                        )}
                                        {isHost && (
                                            <>
                                                <button
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/6 text-white transition hover:bg-white/[0.12]"
                                                    type="button"
                                                    onClick={() => player.togglePlay()}
                                                    title={player.isPlaying ? "Pause" : "Play"}
                                                >
                                                    <span className="material-symbols-filled text-xl">
                                                        {player.isPlaying ? "pause" : "play_arrow"}
                                                    </span>
                                                </button>
                                                <button
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/6 text-white transition hover:bg-white/[0.12]"
                                                    type="button"
                                                    onClick={() => socket?.emit("room_next", { roomId })}
                                                    title="Skip Song"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        skip_next
                                                    </span>
                                                </button>
                                            </>
                                        )}
                                        <button className="rounded-lg border border-white/8 bg-white/6 px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-white/[0.12]" type="button" onClick={() => setPickerOpen(p => !p)}>
                                            {pickerOpen ? "Close" : "Browse"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Up next — visible to all members */} 
                        <div className="rounded-xl xl:w-[30%] h-[70%] md:w-[40%] border border-white/6 bg-white/3 p-4">
                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Up next {room ? `(${room.queue.length})` : ""}</p>
                            {room && room.queue.length > 0 ? (
                                <div className="space-y-1.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                                    {room.queue.map((item, i) => (
                                        <div key={`q-${i}`}
                                            onClick={() => {
                                                if (!isHost || !socket || !roomId) return;
                                                socket.emit("room_play", {
                                                    roomId,
                                                    at: 0,
                                                    song: { trackId: item.trackId, title: item.title, artist: item.artist, artwork: item.artwork, audioUrl: item.audioUrl || "" }
                                                });
                                                socket.emit("room_remove_from_queue", { roomId, trackIndex: i });
                                            }}
                                            className={`flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/6 transition group ${isHost ? "cursor-pointer" : ""}`}
                                        >
                                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white/6 shadow-sm"><img alt="" className="h-full w-full object-cover" src={item.artwork || ""} /></div>
                                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white/90">{item.title}</p><p className="truncate text-xs text-slate-600">{item.artist || "Unknown Artist"}</p></div>
                                            {isHost && <div className="hidden group-hover:block text-[10px] text-primary/60 font-bold uppercase tracking-wider">Play Now</div>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center">
                                    <p className="text-xs text-slate-600 font-medium">No songs in queue</p>
                                    {isHost && <p className="mt-1 text-[10px] text-slate-700 uppercase tracking-widest">Use browse to add tracks</p>}
                                </div>
                            )}
                        </div>
                    </div> 
                    
                    {/* Lower Section with Overlay Picker */}
                    <div className="relative flex flex-1 flex-col gap-4">
                        {/* Song picker (Browse Library) - Now an absolute overlay below progress bar */}
                        {pickerOpen && (
                            <div className="absolute inset-x-0 z-20 overflow-hidden rounded-xl border border-white/15 bg-[#0b0e14]/95 p-4 shadow-2xl backdrop-blur-xl top-0 md:top-auto md:bottom-1/4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2"> 
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Browse Library</p>
                                    </div>
                                    <button onClick={() => setPickerOpen(false)} className="rounded-full bg-white/5 p-1 px-2.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">✕</button>
                                </div>
                                <input className="w-full rounded-lg border border-white/8 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary/50" placeholder="Search songs..." value={search} onChange={e => handleSearch(e.target.value)} autoFocus />
                                <div className="mt-3 max-h-[320px] space-y-1.5 overflow-y-auto custom-scrollbar">
                                    {Array.isArray(results) && results.map(s => {
                                        const isInQueue = room?.queue.some(q => q.trackId === s._id);
                                        return (
                                            <div key={s._id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition border border-transparent ${isHost ? "cursor-pointer hover:bg-white/6 hover:border-white/[0.05]" : "cursor-default"}`} onClick={() => isHost && !isInQueue && playSong(s)}>
                                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/6"><img alt="" className="h-full w-full object-cover" src={s.coverImage || ""} /></div>
                                                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{s.title}</p><p className="truncate text-xs text-slate-500 font-medium">{s.artistName || ""}</p></div>
                                                {isHost ? (
                                                    <button
                                                        className={`shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all ${isInQueue ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 text-slate-400 hover:border-primary/30 hover:text-primary"}`}
                                                        type="button"
                                                        onClick={e => { e.stopPropagation(); if (!isInQueue) addToQueue(s); }}
                                                    >
                                                        {isInQueue ? "In queue" : "Queue"}
                                                    </button>
                                                ) : (
                                                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-600">View Only</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {search && Array.isArray(results) && results.length === 0 && !searching && <p className="py-8 text-center text-xs text-slate-600">No results found</p>}
                                    {!search && <p className="py-8 text-center text-xs text-slate-600 font-medium">Search for your favorite tracks</p>}
                                </div>
                            </div>
                        )}

                        {/* Lyrics Display */}
                        {room?.currentSong?.lyrics && showLyrics && (
                            <div className="rounded-xl border border-white/6 bg-white/3 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary text-sm">lyrics</span>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Lyrics</p>
                                </div>
                                <div
                                    ref={lyricsRef}
                                    className="md:h-[450px] h-[350px] overflow-y-auto pr-2 custom-scrollbar relative block bg-black/10 rounded-xl"
                                    onScroll={(e) => {
                                        if (e.nativeEvent instanceof WheelEvent || e.nativeEvent instanceof TouchEvent) {
                                            lastManualScroll.current = Date.now();
                                        }
                                    }}
                                    onWheel={() => { lastManualScroll.current = Date.now(); }}
                                    onTouchMove={() => { lastManualScroll.current = Date.now(); }}
                                >
                                    <div className="py-[150px] md:py-[200px] flex flex-col items-center gap-6 w-full">
                                        {lyricsLines.map((line, i) => {
                                            const isActive = i === currentLine;
                                            return (
                                                <p
                                                    key={i}
                                                    className={`px-4 text-lg md:text-xl font-bold transition-all duration-700 ${isActive ? "text-primary scale-105 opacity-100 blur-0" : "text-slate-600 opacity-40 blur-[0.5px]"}`}
                                                    style={{ textShadow: isActive ? "0 0 20px rgba(90,255,225,0.3)" : "none" }}
                                                >
                                                    {line.trim() || "···"}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mini stats */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                            <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary/40" /> <span>{participants.length || room?.participantCount || 0} listener{(participants.length || room?.participantCount || 0) !== 1 ? "s" : ""}</span></div>
                            <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary/40" /> <span>{room?.queue.length ?? 0} queued</span></div>
                            <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary/40" /> <span>{isHost ? "Host" : "Listener"}</span></div>
                            <div className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary/40" /> <span className={isConnected ? "text-primary/50" : "text-red-400/50"}>{isConnected ? "Connected" : "Disconnected"}</span></div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Sidebar (Fixed height with internal scroll) ── */}
                {sidebarOpen && (
                    <div className="flex flex-col xl:mb-0 lg:mb-32 overflow-hidden rounded-xl border border-white/6 bg-white/2 h-[calc(100vh-7rem)] sticky top-0 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Tabs */}
                        <div className="flex border-b border-white/6">
                            <button className={`flex-1 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] transition ${tab === "messages" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-300"}`} type="button" onClick={() => setTab("messages")}>
                                Chat {room?.recentMessages ? `(${room.recentMessages.length})` : ""}
                            </button>
                            <button className={`flex-1 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] transition ${tab === "participants" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-300"}`} type="button" onClick={() => setTab("participants")}>
                                People ({participants.length})
                            </button>
                        </div>

                        {/* Messages */}
                        {tab === "messages" && (
                            <div className="flex flex-1 flex-col overflow-hidden">
                                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                                    {(room?.recentMessages || []).map((item, i) => {
                                        const isMine = item.sender?._id === myId;
                                        const initial = (item.sender?.fullName || item.sender?.username || "?")[0].toUpperCase();
                                        return (
                                            <div key={`m-${i}`} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[85%] ${isMine ? "order-1" : "order-1"}`}>
                                                    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                                                        {!isMine && (
                                                            <div className="mb-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                                                                {item.sender?.avatar ? <img alt="" className="h-full w-full object-cover" src={item.sender.avatar} /> : initial}
                                                            </div>
                                                        )}
                                                        <div className={`rounded-2xl px-3.5 py-2 ${isMine ? "bg-primary/20 rounded-br-md" : "bg-white/6 rounded-bl-md"}`}>
                                                            {!isMine && (
                                                                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/60 truncate max-w-32">{item.sender?.username || item.sender?.fullName || "Listener"}</p>
                                                            )}
                                                            <p className={`text-sm leading-5 ${isMine ? "text-white" : "text-slate-200"}`}>{item.text}</p>
                                                        </div>
                                                        {isMine && (
                                                            <div className="mb-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                                                                {item.sender?.avatar ? <img alt="" className="h-full w-full object-cover" src={item.sender.avatar} /> : initial}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!room?.recentMessages || room.recentMessages.length === 0) && <p className="py-8 text-center text-xs text-slate-600">No messages yet</p>}
                                </div>

                                <div className="border-t border-white/6 p-3 space-y-2">
                                    <div className="flex flex-wrap gap-1">
                                        {reactions.map(e => (
                                            <button key={e} className="rounded-md border border-white/6 bg-white/3 px-2 py-0.5 text-sm transition hover:border-primary/30 hover:scale-110" type="button" onClick={() => { if (!roomId || !socket) return; socket.emit("room_reaction", { roomId, reaction: e }); }}>{e}</button>
                                        ))}
                                    </div>
                                    <form className="flex gap-1.5" onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); if (!roomId || !message.trim() || !socket) return; socket.emit("room_message", { roomId, text: message.trim() }); setMessage(""); }}>
                                        <input className="min-w-0 flex-1 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary/50" placeholder="Type a message" value={message} onChange={e => setMessage(e.target.value)} />
                                        <button className="rounded-lg bg-primary/90 px-3 py-2 text-[13px] font-semibold text-[#0b0e14] transition hover:bg-primary disabled:opacity-40" type="submit" disabled={!message.trim()}>Send</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Participants */}
                        {tab === "participants" && (
                            <div className="flex-1 space-y-1 overflow-y-auto p-3">
                                {participants.map(p => {
                                    const initial = (p.fullName || p.username || "?")[0].toUpperCase();
                                    return (
                                        <div key={p.socketId} className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-white/3">
                                            <div className="relative shrink-0">
                                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-[13px] font-bold text-primary">
                                                    {p.avatar ? <img alt="" className="h-full w-full object-cover" src={p.avatar} /> : initial}
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-[#0b0e14] bg-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5"><p className="truncate text-sm font-medium text-white">{p.username || p.fullName || "User"}</p>{p.userId === room?.host?._id && <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-primary">Host</span>}</div>
                                                <p className="truncate text-xs text-slate-600">{p.fullName}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {participants.length === 0 && <p className="py-8 text-center text-xs text-slate-600">No participants yet</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}