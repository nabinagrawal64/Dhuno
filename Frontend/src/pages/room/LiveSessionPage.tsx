import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { roomService, type RoomDetail } from "../../api/room.service";
import { useSocket } from "../../context/SocketContext";
import { usePlayer } from "../../context/PlayerContext";

const reactionOptions = ["🔥", "💿", "✨", "💚", "🎧"];

type PlaybackEvent = {
    roomId: string;
    at?: number;
    to?: number;
    currentSong?: RoomDetail["currentSong"];
    currentTime?: number;
    isPlaying?: boolean;
    queue?: RoomDetail["queue"];
};

export default function LiveSessionPage() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";
    const { socket, isConnected } = useSocket();
    const player = usePlayer();

    const [room, setRoom] = useState<RoomDetail | null>(null);
    const [message, setMessage] = useState("");
    const [queueTitle, setQueueTitle] = useState("");
    const [queueArtist, setQueueArtist] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isAddingQueue, setIsAddingQueue] = useState(false);

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

    useEffect(() => {
        if (!socket || !roomId) {
            return;
        }

        socket.emit("join_room", roomId);

        const handleMessage = (payload: { roomId: string; message: { sender: { username?: string } | null; text: string; createdAt: string } }) => {
            if (payload.roomId !== roomId) return;
            setRoom((current) => {
                if (!current) return current;
                return {
                    ...current,
                    recentMessages: [{ sender: payload.message.sender, text: payload.message.text, createdAt: payload.message.createdAt }, ...current.recentMessages].slice(0, 20),
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

            if (payload.currentSong) {
                setRoom((current) => (current ? { ...current, currentSong: payload.currentSong, isLive: true } : current));
                if (!player.currentSong || player.currentSong._id !== payload.currentSong.trackId) {
                    player.playSong({
                        _id: payload.currentSong.trackId || String(Date.now()),
                        title: payload.currentSong.title || "",
                        audioUrl: payload.currentSong.audioUrl || "",
                        coverImage: payload.currentSong.artwork || "",
                        artistName: payload.currentSong.artist || "",
                    }, typeof payload.currentTime === "number" ? payload.currentTime : (typeof payload.at === "number" ? payload.at : 0));
                }
            }

            if (typeof payload.currentTime === "number") {
                player.seek(payload.currentTime);
            } else if (typeof payload.at === "number") {
                player.seek(payload.at);
            } else if (typeof payload.to === "number") {
                player.seek(payload.to);
            }

            if (payload.isPlaying === true && !player.isPlaying) {
                player.play();
            }

            if (payload.isPlaying === false && player.isPlaying) {
                player.pause();
            }
        };

        const handlePlay = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;

            if (payload.currentSong) {
                setRoom((current) => (current ? { ...current, currentSong: payload.currentSong, isLive: true } : current));
                player.playSong({
                    _id: payload.currentSong.trackId || String(Date.now()),
                    title: payload.currentSong.title || "",
                    audioUrl: payload.currentSong.audioUrl || "",
                    coverImage: payload.currentSong.artwork || "",
                    artistName: payload.currentSong.artist || "",
                }, typeof payload.at === "number" ? payload.at : 0);
            } else if (player.currentSong) {
                player.play();
                if (typeof payload.at === "number") {
                    player.seek(payload.at);
                }
            }
        };

        const handlePause = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            player.pause();
            if (typeof payload.at === "number") {
                player.seek(payload.at);
            }
        };

        const handleSeek = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            const target = typeof payload.to === "number" ? payload.to : (typeof payload.at === "number" ? payload.at : 0);
            player.seek(target);
        };

        const handleNext = (payload: PlaybackEvent) => {
            if (payload.roomId !== roomId) return;
            if (payload.currentSong) {
                setRoom((current) => (current ? { ...current, currentSong: payload.currentSong, queue: payload.queue ?? current.queue } : current));
                player.playSong({
                    _id: payload.currentSong.trackId || String(Date.now()),
                    title: payload.currentSong.title || "",
                    audioUrl: payload.currentSong.audioUrl || "",
                    coverImage: payload.currentSong.artwork || "",
                    artistName: payload.currentSong.artist || "",
                }, 0);
            } else {
                player.pause();
            }
        };

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
            socket.off("room_message", handleMessage);
            socket.off("room_queue_updated", handleQueue);
            socket.off("room_participants_updated", handleParticipants);
            socket.off("room_playback_sync", handlePlayback);
            socket.off("room_play", handlePlay);
            socket.off("room_pause", handlePause);
            socket.off("room_seek", handleSeek);
            socket.off("room_next", handleNext);
        };
    }, [roomId, socket, player]);

    const currentSongTitle = useMemo(() => room?.currentSong?.title || player.currentSong?.title || "Nothing playing yet", [room?.currentSong?.title, player.currentSong?.title]);

    const handleJoin = async () => {
        if (!roomId) {
            toast.error("Open a room first");
            return;
        }

        setIsJoining(true);
        try {
            const response = await roomService.joinRoom(roomId);
            setRoom(response.room);
            toast.success("Joined room");
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
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to leave room");
        }
    };

    const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!roomId || !message.trim()) return;

        setIsSendingMessage(true);
        try {
            const response = await roomService.sendRoomMessage(roomId, message.trim());
            setMessage("");
            setRoom((current) => current ? {
                ...current,
                recentMessages: [{ sender: response.message.sender, text: response.message.text, createdAt: response.message.createdAt }, ...current.recentMessages].slice(0, 20),
            } : current);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send message");
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleAddToQueue = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!roomId || !queueTitle.trim()) return;

        setIsAddingQueue(true);
        try {
            const response = await roomService.addTrackToQueue(roomId, {
                trackId: `${Date.now()}`,
                title: queueTitle.trim(),
                artist: queueArtist.trim(),
                artwork: room?.currentSong?.artwork || "",
                audioUrl: room?.currentSong?.audioUrl || "",
            });
            setQueueTitle("");
            setQueueArtist("");
            setRoom((current) => current ? { ...current, queue: response.queue } : current);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add track");
        } finally {
            setIsAddingQueue(false);
        }
    };

    const handleReaction = (reaction: string) => {
        if (!roomId || !socket) return;
        socket.emit("room_reaction", { roomId, reaction });
        toast.success(`Sent ${reaction}`);
    };

    const emitPlayback = (event: "room_play" | "room_pause" | "room_seek" | "room_next", payload: Record<string, unknown>) => {
        if (!roomId || !socket) return;
        socket.emit(event, { roomId, ...payload });
    };

    const syncPlay = () => {
        if (player.currentSong) {
            emitPlayback("room_play", {
                at: player.currentTime,
                song: {
                    trackId: player.currentSong._id,
                    title: player.currentSong.title,
                    artist: player.currentSong.artistName || "",
                    artwork: player.currentSong.coverImage || "",
                    audioUrl: player.currentSong.audioUrl,
                },
            });
        }
        player.play();
    };

    const syncPause = () => {
        emitPlayback("room_pause", { at: player.currentTime });
        player.pause();
    };

    const syncSeek = (value: number) => {
        emitPlayback("room_seek", { to: value });
        player.seek(value);
    };

    const syncNext = () => {
        emitPlayback("room_next", {});
        player.skipNext();
    };

    if (!roomId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(90,255,225,0.08),transparent_22%),linear-gradient(180deg,#0f131b_0%,#07090d_100%)] px-4 text-white">
                <div className="max-w-xl rounded-4xl border border-white/8 bg-white/5 p-8 text-center backdrop-blur-xl">
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary/80">Live session</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight">Open a room to start listening together.</h1>
                    <p className="mt-4 text-sm leading-6 text-slate-400">Use the discovery page or create room flow first, then return with a room id in the URL.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(90,255,225,0.08),transparent_22%),linear-gradient(180deg,#0f131b_0%,#07090d_100%)] text-white">
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 md:py-8 xl:flex-row">
                <section className="flex-1 rounded-4xl border border-white/8 bg-white/5 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary/80">Room live</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">{room?.roomName || "Loading room..."}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{room?.description || "The shared listening room is now backed by Redis for state, sessions, and fast playback sync."}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-primary/40 hover:text-white" type="button" onClick={handleJoin} disabled={isJoining || !isConnected}>
                                {isJoining ? "Joining..." : "Join"}
                            </button>
                            <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-400/40 hover:text-white" type="button" onClick={handleLeave}>
                                Leave room
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Listeners</p>
                            <p className="mt-2 text-3xl font-black">{room?.participantCount ?? 0}</p>
                        </div>
                        <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Queue</p>
                            <p className="mt-2 text-3xl font-black">{room?.queue.length ?? 0}</p>
                        </div>
                        <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Connection</p>
                            <p className="mt-2 text-3xl font-black">{isConnected ? "Live" : "Offline"}</p>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/8 bg-black/20">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/80">Now playing</p>
                                <h2 className="mt-1 text-xl font-black tracking-tight">{currentSongTitle}</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-black transition hover:scale-[1.01]" type="button" onClick={syncPlay}>
                                    Play
                                </button>
                                <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20" type="button" onClick={syncPause}>
                                    Pause
                                </button>
                                <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20" type="button" onClick={syncNext}>
                                    Next
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="relative min-h-80 overflow-hidden">
                                <img alt={room?.currentSong?.title || "Current track"} className="h-full w-full object-cover" src={room?.currentSong?.artwork || room?.coverImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop"} />
                                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/80">Current track</p>
                                    <h3 className="mt-2 text-3xl font-black tracking-tight">{room?.currentSong?.title || player.currentSong?.title || "Pick a track to sync"}</h3>
                                    <p className="mt-1 text-sm text-slate-300">{room?.currentSong?.artist || player.currentSong?.artistName || "The host decides what everyone hears."}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 p-4 md:p-5">
                                <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Seek</p>
                                    <input
                                        className="mt-3 w-full accent-primary"
                                        min={0}
                                        max={Math.max(player.duration, 1)}
                                        step={1}
                                        type="range"
                                        value={Math.min(player.currentTime, Math.max(player.duration, 1))}
                                        onChange={(event) => syncSeek(Number(event.target.value))}
                                    />
                                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                                        <span>{Math.floor(player.currentTime)}s</span>
                                        <span>{Math.floor(player.duration || 0)}s</span>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Reactions</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {reactionOptions.map((reaction) => (
                                            <button key={reaction} className="rounded-full border border-white/8 bg-black/20 px-4 py-2 text-lg transition hover:border-primary/40" type="button" onClick={() => handleReaction(reaction)}>
                                                {reaction}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <form className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4" onSubmit={handleAddToQueue}>
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Queue a song</p>
                                    <div className="mt-3 space-y-3">
                                        <input className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary/60" placeholder="Track title" value={queueTitle} onChange={(event) => setQueueTitle(event.target.value)} />
                                        <input className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary/60" placeholder="Artist" value={queueArtist} onChange={(event) => setQueueArtist(event.target.value)} />
                                        <button className="w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isAddingQueue}>
                                            {isAddingQueue ? "Adding..." : "Add to queue"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="w-full space-y-4 xl:max-w-md">
                    <section className="rounded-4xl border border-white/8 bg-white/5 p-5 backdrop-blur-xl md:p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight">Chat</h2>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{room?.recentMessages.length ?? 0} messages</span>
                        </div>

                        <div className="mt-4 flex max-h-85 flex-col gap-3 overflow-y-auto pr-1">
                            {(room?.recentMessages || []).map((item, index) => (
                                <div key={`${item.createdAt}-${index}`} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/70">{item.sender?.username || "listener"}</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-200">{item.text}</p>
                                </div>
                            ))}
                            {(!room?.recentMessages || room.recentMessages.length === 0) && (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 p-4 text-sm text-slate-400">No chat yet. Be the first to say something.</div>
                            )}
                        </div>

                        <form className="mt-4 flex gap-2" onSubmit={handleSendMessage}>
                            <input className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary/60" placeholder="Type a message" value={message} onChange={(event) => setMessage(event.target.value)} />
                            <button className="rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSendingMessage}>
                                Send
                            </button>
                        </form>
                    </section>

                    <section className="rounded-4xl border border-white/8 bg-white/5 p-5 backdrop-blur-xl md:p-6">
                        <h2 className="text-xl font-black tracking-tight">Queue</h2>
                        <div className="mt-4 space-y-3">
                            {(room?.queue || []).map((item, index) => (
                                <div key={`${item.trackId}-${index}`} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-3">
                                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10">
                                        <img alt={item.title} className="h-full w-full object-cover" src={item.artwork || room?.coverImage || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&auto=format&fit=crop"} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                                        <p className="truncate text-xs text-slate-500">{item.artist || "Unknown artist"}</p>
                                    </div>
                                </div>
                            ))}
                            {(!room?.queue || room.queue.length === 0) && (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-black/15 p-4 text-sm text-slate-400">No queued tracks yet.</div>
                            )}
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    );
}
