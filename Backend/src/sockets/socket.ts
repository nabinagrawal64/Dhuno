import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/user.model";
import Room from "../models/room.model";
import Song from "../models/song.model";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface JwtPayload {
    id: string;
}

interface ParticipantInfo {
    userId: string;
    socketId: string;
    fullName: string;
    username: string;
    avatar: string;
    role: string;
}

interface RoomState {
    currentSong: {
        trackId: string;
        title: string;
        artist: string;
        artwork: string;
        audioUrl: string;
        lyrics?: string;
    } | null;
    isPlaying: boolean;
    currentTime: number;
    startTime: number | null; // timestamp when playback started (for clock sync)
    lastUpdate: number;
    queue: {
        trackId: string;
        title: string;
        artist: string;
        artwork: string;
        audioUrl?: string;
        lyrics?: string;
        addedBy: string;
    }[];
    participants: Map<string, ParticipantInfo>; // socketId -> info
    hostId: string;
    hostSocketId: string;
    djMode: boolean;
    currentDJ: string | null;
    allowQueueAdd: boolean;
    allowChat: boolean;
    reactions: { reaction: string; userId: string; timestamp: number }[];
    skipVotes: Set<string>; // userIds who voted to skip current song
}

// ──────────────────────────────────────────────
// In-memory room state store
// ──────────────────────────────────────────────

const rooms = new Map<string, RoomState>();

const getRoomState = (roomId: string): RoomState | undefined => rooms.get(roomId);

const ensureRoomState = async (roomId: string, hostId: string, socketId: string): Promise<RoomState> => {
    let state = rooms.get(roomId);
    if (!state) {
        // Try to load initial state from DB
        let dbRoom = null;
        try {
            dbRoom = await Room.findById(roomId);
        } catch (err) {
            console.error("Error loading room from DB:", err);
        }

        state = {
            currentSong: dbRoom?.currentSong?.trackId ? {
                trackId: dbRoom.currentSong.trackId,
                title: dbRoom.currentSong.title,
                artist: dbRoom.currentSong.artist,
                artwork: dbRoom.currentSong.artwork,
                audioUrl: dbRoom.currentSong.audioUrl,
                lyrics: (dbRoom.currentSong as any).lyrics || "",
            } : null,
            isPlaying: false,
            currentTime: 0,
            startTime: null,
            lastUpdate: Date.now(),
            queue: dbRoom?.queue?.map((q: any) => ({
                trackId: q.trackId,
                title: q.title,
                artist: q.artist,
                artwork: q.artwork,
                audioUrl: q.audioUrl || "",
                lyrics: q.lyrics || "",
                addedBy: String(q.addedBy),
            })) || [],
            participants: new Map(),
            hostId: dbRoom?.host ? String(dbRoom.host) : hostId,
            hostSocketId: socketId,
            djMode: dbRoom?.djMode || false,
            currentDJ: dbRoom?.currentDJ ? String(dbRoom.currentDJ) : (dbRoom?.host ? String(dbRoom.host) : hostId),
            allowQueueAdd: dbRoom?.allowQueueAdd ?? true,
            allowChat: dbRoom?.allowChat ?? true,
            reactions: [],
            skipVotes: new Set(),
        };
        rooms.set(roomId, state);
    }
    return state;
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const extractToken = (socket: Socket): string | null => {
    const auth = socket.handshake.auth?.token || socket.handshake.query?.token;
    return typeof auth === "string" && auth.length > 0 ? auth : null;
};

const verifyToken = (token: string): string | null => {
    try {
        const secret = process.env.JWT_SECRET as string;
        if (!secret) return null;
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded.id || null;
    } catch {
        return null;
    }
};

const canControlPlayback = (roomState: RoomState, userId: string): boolean => {
    if (roomState.djMode) {
        return roomState.currentDJ === userId;
    }
    return roomState.hostId === userId;
};

// ──────────────────────────────────────────────
// Socket initializer
// ──────────────────────────────────────────────

export const initializeSocket = (server: HttpServer, allowedOrigins: string[]) => {
    console.log("🛠️ Initializing Socket.IO with origins:", allowedOrigins);

    const io = new SocketIOServer(server, {
        cors: {
            origin: allowedOrigins, // Restore specific origins for credentials support
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ['websocket', 'polling'], // Allow fallback for stability
        pingTimeout: 60000, // Increase timeouts
        pingInterval: 25000,
    });

    let onlineCount = 0;

    io.on("connection", async (socket: Socket) => {
        try {
            onlineCount++;
            io.emit("online_count", onlineCount);
            
            const token = extractToken(socket);
            const transport = socket.conn.transport.name;
            console.log(`🟢 [${socket.id}] Connected (${transport}). Token: ${token ? 'YES' : 'NO'}. Total: ${onlineCount}`);

        // ── Auth ──
        const userId = token ? verifyToken(token) : null;
        let userInfo: ParticipantInfo | null = null;

        if (userId) {
            try {
                const user = await User.findById(userId).select("fullName username avatar role");
                if (user) {
                    userInfo = {
                        userId: String(user._id),
                        socketId: socket.id,
                        fullName: user.fullName || "",
                        username: user.username || "",
                        avatar: user.avatar || "",
                        role: user.role || "user",
                    };
                    console.log(`👤 [${socket.id}] Auth: ${user.username}`);
                }
            } catch (err) {
                console.error(`❌ [${socket.id}] DB Error:`, err);
            }
        } else {
            console.log(`👻 [${socket.id}] Guest`);
        }

        // Store auth info on socket for later use
        (socket as any).userId = userId;
        (socket as any).userInfo = userInfo;

        // ── Room join ──
        socket.on("join_room", (payload: { roomId: string; hostId?: string }) => {
            const roomId = typeof payload === "string" ? payload : payload?.roomId;
            if (!roomId) return;

            socket.join(roomId);
            const uid = (socket as any).userId;
            const info = (socket as any).userInfo;

            if (uid && info) {
                ensureRoomState(roomId, payload?.hostId || uid, socket.id).then((state) => {
                    // If this is the host connecting, update hostSocketId
                    if (state.hostId === uid) {
                        state.hostSocketId = socket.id;
                    }

                    // Set first DJ to host if not set
                    if (!state.currentDJ) {
                        state.currentDJ = state.hostId;
                    }

                    state.participants.set(socket.id, { ...info, socketId: socket.id });

                    // Emit current state to the joining participant
                    socket.emit("room_state_sync", {
                        roomId,
                        currentSong: state.currentSong,
                        isPlaying: state.isPlaying,
                        currentTime: state.currentTime,
                        startTime: state.startTime,
                        queue: state.queue,
                        djMode: state.djMode,
                        currentDJ: state.currentDJ,
                        hostId: state.hostId,
                        skipVoteCount: state.skipVotes.size,
                    });

                    // Broadcast updated participant list
                    const participantList = Array.from(state.participants.values());
                    io.to(roomId).emit("room_participants", { roomId, participants: participantList });
                    io.to(roomId).emit("room_participant_count", { roomId, count: participantList.length });
                });
            }

            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        // ── Room leave ──
        socket.on("leave_room", (roomId: string) => {
            if (!roomId) return;

            socket.leave(roomId);
            const uid = (socket as any).userId;
            const state = getRoomState(roomId);

            if (state) {
                state.participants.delete(socket.id);

                if (state.participants.size === 0) {
                    rooms.delete(roomId);
                    console.log(`Room ${roomId} removed (no participants)`);
                } else {
                    const participantList = Array.from(state.participants.values());
                    io.to(roomId).emit("room_participants", { roomId, participants: participantList });
                    io.to(roomId).emit("room_participant_count", { roomId, count: participantList.length });
                }
            }

            console.log(`Socket ${socket.id} left room ${roomId}`);
        });

        // ── Chat message ──
        socket.on("room_message", async (payload: { roomId: string; text: string }) => {
            if (!payload?.roomId || !payload?.text?.trim()) return;
            const uid = (socket as any).userId;
            const info = (socket as any).userInfo;
            if (!uid || !info) return;

            const state = getRoomState(payload.roomId);
            if (state && !state.allowChat && state.hostId !== uid) {
                socket.emit("room_error", { message: "Chat is disabled in this room" });
                return;
            }

            const message = {
                sender: {
                    _id: uid,
                    fullName: info.fullName,
                    username: info.username,
                    avatar: info.avatar,
                },
                text: payload.text.trim(),
                createdAt: new Date().toISOString(),
            };

            io.to(payload.roomId).emit("room_message", { roomId: payload.roomId, message });

            // Persist to MongoDB (keep newest-first, cap at 50)
            try {
                await Room.findByIdAndUpdate(payload.roomId, {
                    $push: {
                        recentMessages: {
                            $each: [{
                                sender: new Types.ObjectId(uid),
                                text: payload.text.trim(),
                                createdAt: new Date(),
                            }],
                            $position: 0,
                            $slice: 50,
                        },
                    },
                });
            } catch (err) {
                console.error("Failed to persist chat message:", err);
            }
        });

        // ── Reactions ──
        socket.on("room_reaction", (payload: { roomId: string; reaction: string }) => {
            if (!payload?.roomId || !payload?.reaction) return;
            const uid = (socket as any).userId;
            if (!uid) return;

            const state = getRoomState(payload.roomId);
            if (state) {
                state.reactions.push({ reaction: payload.reaction, userId: uid, timestamp: Date.now() });
                // Keep last 30 reactions
                if (state.reactions.length > 30) state.reactions.splice(0, state.reactions.length - 30);
            }

            io.to(payload.roomId).emit("room_reaction", {
                roomId: payload.roomId,
                reaction: payload.reaction,
                userId: uid,
                timestamp: Date.now(),
            });
        });

        // ── Playback control (host/DJ only) ──
        socket.on("room_play", async (payload: { roomId: string; at?: number; song?: any }) => {
            if (!payload?.roomId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!canControlPlayback(state, uid)) {
                socket.emit("room_error", { message: "Only the host or DJ can control playback" });
                return;
            }

            if (payload.song) {
                let songToPlay = {
                    trackId: payload.song.trackId || "",
                    title: payload.song.title || "",
                    artist: payload.song.artist || "",
                    artwork: payload.song.artwork || "",
                    audioUrl: payload.song.audioUrl || "",
                    lyrics: payload.song.lyrics || "",
                };

                // Resolve missing fields before emitting
                if ((!songToPlay.audioUrl || !songToPlay.artwork || !songToPlay.lyrics) && songToPlay.trackId) {
                    try {
                        const s = await Song.findById(songToPlay.trackId);
                        if (s) {
                            if (!songToPlay.audioUrl) songToPlay.audioUrl = s.audioUrl;
                            if (!songToPlay.artwork) songToPlay.artwork = s.coverImage;
                            if (!songToPlay.lyrics) songToPlay.lyrics = s.lyrics;
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                state.currentSong = songToPlay;
                state.skipVotes.clear();
            }

            state.isPlaying = true;
            state.currentTime = payload.at ?? state.currentTime;
            state.startTime = Date.now() - (state.currentTime * 1000);
            state.lastUpdate = Date.now();

            io.to(payload.roomId).emit("room_play", {
                roomId: payload.roomId,
                at: state.currentTime,
                currentSong: state.currentSong,
                startTime: state.startTime,
            });

            // Persist state to DB
            Room.findByIdAndUpdate(payload.roomId, {
                currentSong: state.currentSong,
                isLive: true
            }).catch(e => console.error("Failed to persist play state:", e));
        });

        socket.on("room_pause", (payload: { roomId: string; at?: number }) => {
            if (!payload?.roomId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!canControlPlayback(state, uid)) {
                socket.emit("room_error", { message: "Only the host or DJ can control playback" });
                return;
            }

            state.isPlaying = false;
            state.currentTime = payload.at ?? state.currentTime;
            state.startTime = null;
            state.lastUpdate = Date.now();

            io.to(payload.roomId).emit("room_pause", {
                roomId: payload.roomId,
                at: state.currentTime,
            });
        });

        socket.on("room_seek", (payload: { roomId: string; to: number }) => {
            if (!payload?.roomId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!canControlPlayback(state, uid)) {
                socket.emit("room_error", { message: "Only the host or DJ can control playback" });
                return;
            }

            state.currentTime = Number(payload.to) || 0;
            if (state.isPlaying) {
                state.startTime = Date.now() - (state.currentTime * 1000);
            }
            state.lastUpdate = Date.now();

            io.to(payload.roomId).emit("room_seek", {
                roomId: payload.roomId,
                to: state.currentTime,
            });
        });

        socket.on("room_next", async (payload: { roomId: string }) => {
            if (!payload?.roomId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!canControlPlayback(state, uid)) {
                socket.emit("room_error", { message: "Only the host or DJ can skip tracks" });
                return;
            }

            // Move current song to next in queue
            if (state.queue.length > 0) {
                const next = state.queue.shift()!;
                let audioUrl = next.audioUrl || "";
                let artwork = next.artwork || "";

                // Fallback lookup if fields are missing
                if ((!audioUrl || !artwork) && next.trackId) {
                    try {
                        const s = await Song.findById(next.trackId);
                        if (s) {
                            if (!audioUrl) audioUrl = s.audioUrl;
                            if (!artwork) artwork = s.coverImage;
                        }
                    } catch (e) {}
                }
                state.currentSong = {
                    trackId: next.trackId,
                    title: next.title,
                    artist: next.artist,
                    artwork,
                    audioUrl,
                    lyrics: next.lyrics || "",
                };
                state.currentTime = 0;
                state.isPlaying = true;
                state.startTime = Date.now();
                state.skipVotes.clear();

                io.to(payload.roomId).emit("room_next", {
                    roomId: payload.roomId,
                    currentSong: state.currentSong,
                    queue: state.queue,
                });

                io.to(payload.roomId).emit("room_play", {
                    roomId: payload.roomId,
                    at: 0,
                    currentSong: state.currentSong,
                    startTime: state.startTime,
                });

                // Persist skip state
                Room.findByIdAndUpdate(payload.roomId, {
                    currentSong: state.currentSong,
                    queue: state.queue
                }).catch(() => {});
            } else {
                state.isPlaying = false;
                state.currentSong = null;
                state.startTime = null;
                state.currentTime = 0;
                io.to(payload.roomId).emit("room_next", { roomId: payload.roomId, currentSong: null, queue: [] });
            }
        });

        // ── Queue management ──
        socket.on("room_add_to_queue", (payload: { roomId: string; track: { trackId: string; title: string; artist: string; artwork: string; audioUrl?: string } }) => {
            if (!payload?.roomId || !payload?.track?.trackId || !payload?.track?.title) return;
            const uid = (socket as any).userId;
            const info = (socket as any).userInfo;
            if (!uid || !info) return;

            const state = getRoomState(payload.roomId);
            if (!state) return;

            if (!state.allowQueueAdd && !canControlPlayback(state, uid)) {
                socket.emit("room_error", { message: "Only the host or DJ can add to the queue" });
                return;
            }

            const qItem = {
                trackId: payload.track.trackId,
                title: payload.track.title,
                artist: payload.track.artist || "",
                artwork: payload.track.artwork || "",
                audioUrl: payload.track.audioUrl || "",
                addedBy: uid,
            };

            state.queue.push(qItem);

            io.to(payload.roomId).emit("room_queue_updated", {
                roomId: payload.roomId,
                queue: state.queue,
            });

            // Persist to MongoDB
            Room.findByIdAndUpdate(payload.roomId, {
                $push: { queue: qItem }
            }).catch(e => console.error("Failed to persist queue add:", e));
        });

        socket.on("room_reorder_queue", (payload: { roomId: string; queue: any[] }) => {
            if (!payload?.roomId || !payload?.queue) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!canControlPlayback(state, uid)) {
                socket.emit("room_error", { message: "Only the host or DJ can reorder the queue" });
                return;
            }

            state.queue = payload.queue.map((item: any) => ({
                trackId: item.trackId || "",
                title: item.title || "",
                artist: item.artist || "",
                artwork: item.artwork || "",
                audioUrl: item.audioUrl || "",
                lyrics: item.lyrics || "",
                addedBy: item.addedBy || uid,
            }));

            io.to(payload.roomId).emit("room_queue_updated", {
                roomId: payload.roomId,
                queue: state.queue,
            });
        });

        socket.on("room_remove_from_queue", (payload: { roomId: string; trackIndex: number }) => {
            if (!payload?.roomId || payload.trackIndex === undefined) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!canControlPlayback(state, uid)) {
                socket.emit("room_error", { message: "Only the host or DJ can remove tracks from the queue" });
                return;
            }

            if (payload.trackIndex >= 0 && payload.trackIndex < state.queue.length) {
                state.queue.splice(payload.trackIndex, 1);
                io.to(payload.roomId).emit("room_queue_updated", {
                    roomId: payload.roomId,
                    queue: state.queue,
                });
            }
        });

        // ── Voting ──
        socket.on("room_vote_skip", async (payload: { roomId: string }) => {
            if (!payload?.roomId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!state.currentSong) return;

            const playNextFromQueue = async () => {
                if (state.queue.length === 0) return;
                const next = state.queue.shift()!;
                let audioUrl = next.audioUrl || "";
                if (!audioUrl && next.trackId) {
                    try {
                        const s = await Song.findById(next.trackId);
                        if (s?.audioUrl) audioUrl = s.audioUrl;
                    } catch (e) {}
                }
                state.currentSong = {
                    trackId: next.trackId,
                    title: next.title,
                    artist: next.artist,
                    artwork: next.artwork,
                    audioUrl,
                };
                state.currentTime = 0;
                state.isPlaying = true;
                state.startTime = Date.now();
                state.skipVotes.clear();

                io.to(payload.roomId).emit("room_next", {
                    roomId: payload.roomId,
                    currentSong: state.currentSong,
                    queue: state.queue,
                });
                io.to(payload.roomId).emit("room_play", {
                    roomId: payload.roomId,
                    at: 0,
                    currentSong: state.currentSong,
                    startTime: state.startTime,
                });
            };

            // Host/DJ can skip immediately
            if (canControlPlayback(state, uid)) {
                await playNextFromQueue();
                return;
            }

            state.skipVotes.add(uid);

            const totalListeners = state.participants.size;
            const voteCount = state.skipVotes.size;
            // Skip if more than 50% of non-host participants voted
            const threshold = Math.max(1, Math.ceil((totalListeners - 1) / 2));

            io.to(payload.roomId).emit("room_vote_update", {
                roomId: payload.roomId,
                voteCount,
                threshold,
                totalListeners,
            });

            if (voteCount >= threshold) {
                await playNextFromQueue();
            }
        });

        // ── DJ mode ──
        socket.on("room_toggle_dj", (payload: { roomId: string }) => {
            if (!payload?.roomId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (state.hostId !== uid) {
                socket.emit("room_error", { message: "Only the host can toggle DJ mode" });
                return;
            }

            state.djMode = !state.djMode;
            if (!state.djMode) {
                state.currentDJ = state.hostId;
            }

            io.to(payload.roomId).emit("room_dj_mode", {
                roomId: payload.roomId,
                djMode: state.djMode,
                currentDJ: state.currentDJ,
            });
        });

        socket.on("room_assign_dj", (payload: { roomId: string; userId: string }) => {
            if (!payload?.roomId || !payload?.userId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (state.hostId !== uid) {
                socket.emit("room_error", { message: "Only the host can assign the DJ" });
                return;
            }

            state.currentDJ = payload.userId;
            io.to(payload.roomId).emit("room_dj_mode", {
                roomId: payload.roomId,
                djMode: state.djMode,
                currentDJ: state.currentDJ,
            });
        });

        // ── Playback sync (broadcast host/DJ current song to room) ──
        socket.on("room_playback_sync", (payload: { roomId: string; currentSong: any; currentTime?: number; isPlaying?: boolean }) => {
            if (!payload?.roomId) return;
            const uid = (socket as any).userId;
            const state = getRoomState(payload.roomId);
            if (!state || !uid) return;
            if (!canControlPlayback(state, uid)) return;

            if (payload.currentSong) {
                state.currentSong = {
                    trackId: payload.currentSong.trackId || "",
                    title: payload.currentSong.title || "",
                    artist: payload.currentSong.artist || "",
                    artwork: payload.currentSong.artwork || "",
                    audioUrl: payload.currentSong.audioUrl || "",
                };
            }
            if (typeof payload.currentTime === "number") {
                state.currentTime = payload.currentTime;
            }
            if (typeof payload.isPlaying === "boolean") {
                state.isPlaying = payload.isPlaying;
            }
            state.lastUpdate = Date.now();

            io.to(payload.roomId).emit("room_playback_sync", {
                roomId: payload.roomId,
                currentSong: state.currentSong,
                currentTime: state.currentTime,
                isPlaying: state.isPlaying,
            });
        });

        // ── Disconnect ──
        socket.on("disconnect", (reason) => {
            onlineCount--;
            io.emit("online_count", onlineCount);

            // Remove from all rooms
            for (const [roomId, state] of rooms.entries()) {
                if (state.participants.has(socket.id)) {
                    state.participants.delete(socket.id);

                    if (state.hostSocketId === socket.id) {
                        // Host disconnected — assign new host or close
                        const remaining = Array.from(state.participants.values());
                        if (remaining.length > 0) {
                            const newHost = remaining[0];
                            state.hostId = newHost.userId;
                            state.hostSocketId = newHost.socketId;
                            if (!state.djMode) {
                                state.currentDJ = newHost.userId;
                            }
                            io.to(roomId).emit("room_host_changed", {
                                roomId,
                                hostId: state.hostId,
                            });
                        }
                    }

                    if (state.participants.size === 0) {
                        rooms.delete(roomId);
                        console.log(`Room ${roomId} removed (all disconnected)`);
                    } else {
                        const participantList = Array.from(state.participants.values());
                        io.to(roomId).emit("room_participants", { roomId, participants: participantList });
                        io.to(roomId).emit("room_participant_count", { roomId, count: participantList.length });
                    }
                }
            }

            const transport = socket.conn.transport.name;
            console.log(`🔴 [${socket.id}] Disconnected (${transport}): ${reason}. Total: ${onlineCount}`);
        });

        socket.on("error", (err) => {
            console.error(`⚠️ [${socket.id}] Socket error:`, err);
        });

    } catch (err) {
        console.error("🔥 Global Socket Connection Error:", err);
        socket.disconnect();
    }
    });

    return io;
};
