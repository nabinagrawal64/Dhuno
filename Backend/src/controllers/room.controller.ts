import type { Response } from "express";
import { Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import Room, { type IRoom } from "../models/room.model";
import User from "../models/user.model";
import { AuthRequest } from "../types/request.types";
import { redisDelete, redisGetJson, redisHashSet, redisSetJson } from "../utils/redis-cache";
import { clearRoomState, registerRoomState, syncRoomQueueSnapshot } from "../utils/redis-room-state";

type RoomPreview = {
    _id: string;
    roomName: string;
    description: string;
    coverImage: string;
    bannerImage: string;
    category: IRoom["category"];
    visibility: IRoom["visibility"];
    host?: {
        _id: string;
        fullName: string;
        username: string;
        avatar: string;
    } | null;
    participantCount: number;
    totalJoins: number;
    currentSong: IRoom["currentSong"];
    queueCount: number;
    allowChat: boolean;
    allowQueueAdd: boolean;
    allowGuests: boolean;
    tags: string[];
    recentMessageCount: number;
    isLive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const normalizeRoom = (
    room: HydratedDocument<IRoom> | (IRoom & { host?: { fullName?: string; username?: string; avatar?: string; } | Types.ObjectId | null; })
) : RoomPreview => ({
    _id: String(room._id),
    roomName: room.roomName,
    description: room.description,
    coverImage: room.coverImage || "",
    bannerImage: room.bannerImage || "",
    category: room.category,
    visibility: room.visibility,
    host: room.host && typeof room.host === "object" && "username" in room.host ? {
        _id: String(room.host._id || ""),
        fullName: room.host.fullName || "",
        username: room.host.username || "",
        avatar: room.host.avatar || "",
    } : null,
    participantCount: room.participantCount || 0,
    totalJoins: room.totalJoins || 0,
    currentSong: room.currentSong,
    queueCount: Array.isArray(room.queue) ? room.queue.length : 0,
    allowChat: Boolean(room.allowChat),
    allowQueueAdd: Boolean(room.allowQueueAdd),
    allowGuests: Boolean(room.allowGuests),
    tags: Array.isArray(room.tags) ? room.tags : [],
    recentMessageCount: Array.isArray(room.recentMessages) ? room.recentMessages.length : 0,
    isLive: Boolean(room.isLive),
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
});

const normalizeRoomDetail = (room: any) => ({
    ...normalizeRoom(room),
    djMode: Boolean(room.djMode),
    currentDJ: String(room.currentDJ || room.host?._id || room.host || ""),
    participants: Array.isArray(room.participants)
        ? room.participants
              .filter(Boolean)
              .map((participant: any) => ({
                  _id: String(participant._id || participant),
                  fullName: participant.fullName || "",
                  username: participant.username || "",
                  avatar: participant.avatar || "",
                  role: participant.role || "user",
              }))
        : [],
    currentSong: {
        ...room.currentSong,
        lyrics: room.currentSong?.lyrics || "",
    },
    queue: Array.isArray(room.queue)
        ? room.queue.map((item: any) => ({
              trackId: item.trackId || "",
              title: item.title || "",
              artist: item.artist || "",
              artwork: item.artwork || "",
              lyrics: item.lyrics || "",
              addedBy: String(item.addedBy || ""),
          }))
        : [],
    recentMessages: Array.isArray(room.recentMessages)
        ? room.recentMessages.map((message: any) => ({
              sender: message.sender && typeof message.sender === "object"
                  ? {
                        _id: String(message.sender._id || ""),
                        fullName: message.sender.fullName || "",
                        username: message.sender.username || "",
                        avatar: message.sender.avatar || "",
                    }
                  : null,
              text: message.text || "",
              createdAt: message.createdAt,
          }))
        : [],
});

const roomDetailCacheKey = (roomId: string) => `room:detail:${roomId}`;
const roomStateCacheKey = (roomId: string) => `room:state:${roomId}`;
const invalidateRoomCache = async (roomId: string) => {
    await redisDelete(roomDetailCacheKey(roomId), roomStateCacheKey(roomId));
};

const cacheRoomDetail = async (room: any, ttlSeconds = 30) => {
    await redisSetJson(roomDetailCacheKey(String(room._id)), normalizeRoomDetail(room), ttlSeconds);
};

const refreshRoomStateCache = async (roomId: string, room: any) => {
    await redisHashSet(roomStateCacheKey(roomId), {
        participantCount: room.participantCount ?? 0,
        queueCount: Array.isArray(room.queue) ? room.queue.length : 0,
        isLive: Boolean(room.isLive),
        currentlyPlaying: room.currentlyPlaying || room.currentSong?.title || "",
        updatedAt: Date.now(),
    });
    await registerRoomState(roomId);
};

export const getRooms = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { lat, lng } = req.query;
        let query: any = { visibility: "public" };

        if (lat && lng) {
            const latitude = parseFloat(String(lat));
            const longitude = parseFloat(String(lng));

            if (!isNaN(latitude) && !isNaN(longitude)) {
                query.location = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: 1000, // 1000 meters = 1km
                    },
                };
            }
        }

        const rooms = await Room.find(query)
            .sort({ isLive: -1, trendingScore: -1, updatedAt: -1 })
            .populate({ path: "host", select: "fullName username avatar role" })
            .lean();

        res.status(200).json({
            success: true,
            rooms: rooms.map((room) => normalizeRoom(room as any)),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to fetch rooms" });
    }
};

export const getRoomById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const roomId = String(req.params.id || "");
        const cachedRoom = await redisGetJson<any>(roomDetailCacheKey(roomId));
        if (cachedRoom) {
            if (cachedRoom.visibility === "private") {
                const roomDoc = await Room.findById(roomId).select("host visibility").lean();
                const isMember = req.user ? String(roomDoc?.host || "") === String(req.user) : false;
                if (!isMember) {
                    res.status(403).json({ success: false, message: "This room is private" });
                    return;
                }
            }

            res.status(200).json({ success: true, room: cachedRoom });
            return;
        }

        const room = await Room.findById(roomId)
            .populate({ path: "host", select: "fullName username avatar role" })
            .populate({ path: "participants", select: "fullName username avatar role" })
            .populate({ path: "recentMessages.sender", select: "fullName username avatar role" })
            .lean();

        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (room.visibility === "private") {
            const isMember = req.user ? String(room.host?._id || "") === String(req.user) : false;
            if (!isMember) {
                res.status(403).json({ success: false, message: "This room is private" });
                return;
            }
        }

        res.status(200).json({
            success: true,
            room: normalizeRoomDetail(room),
        });

        await cacheRoomDetail(room);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to fetch room" });
    }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const {
            roomName,
            description = "",
            category = "public",
            visibility = "public",
            coverImage = "",
            bannerImage = "",
            tags = [],
            allowChat = true,
            allowQueueAdd = true,
            allowGuests = true,
            city = "",
            area = "",
            radius = 5,
            lat,
            lng,
        } = req.body || {};

        if (!roomName || !String(roomName).trim()) {
            res.status(400).json({ success: false, message: "Room name is required" });
            return;
        }

        const room = await Room.create({
            roomName: String(roomName).trim(),
            description: String(description).trim(),
            category,
            visibility,
            coverImage,
            bannerImage,
            tags: Array.isArray(tags) ? tags : [],
            allowChat,
            allowQueueAdd,
            allowGuests,
            city,
            area,
            radius,
            host: req.user,
            participants: [req.user],
            participantCount: 1,
            totalJoins: 1,
            isLive: true,
            location: {
                type: "Point",
                coordinates: [parseFloat(String(lng || 0)), parseFloat(String(lat || 0))],
            },
        });

        await User.findByIdAndUpdate(req.user, {
            $addToSet: {
                createdRooms: room._id,
                joinedRooms: room._id,
            },
        });

        const populatedRoom = await Room.findById(room._id)
            .populate({ path: "host", select: "fullName username avatar role" })
            .lean();

        await cacheRoomDetail(populatedRoom as any);
        await refreshRoomStateCache(String(room._id), room);

        res.status(201).json({
            success: true,
            message: "Room created successfully",
            room: normalizeRoom(populatedRoom as any),
        });

        (req as any).io?.emit("room_created", normalizeRoom(populatedRoom as any));
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to create room" });
    }
};

export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        const userId = String(req.user);
        const userObjectId = new Types.ObjectId(userId);
        const alreadyJoined = room.participants.some((participant) => String(participant) === userId);

        if (!alreadyJoined) {
            room.participants.push(userObjectId);
            room.participantCount += 1;
            room.totalJoins += 1;
            room.trendingScore += 1;
            await room.save();
        }

        await User.findByIdAndUpdate(req.user, {
            $addToSet: { joinedRooms: room._id },
        });

        const populatedRoom = await Room.findById(room._id)
            .populate({ path: "host", select: "fullName username avatar role" })
            .populate({ path: "participants", select: "fullName username avatar role" })
            .lean();

        await invalidateRoomCache(String(room._id));
        await cacheRoomDetail(populatedRoom as any);
        await refreshRoomStateCache(String(room._id), room);

        (req as any).io?.emit("room_joined", { roomId: String(room._id), userId });
        (req as any).io?.to(String(room._id)).emit("room_participants_updated", {
            roomId: String(room._id),
            participantCount: populatedRoom?.participantCount ?? room.participantCount,
        });

        res.status(200).json({
            success: true,
            message: alreadyJoined ? "Already joined" : "Joined room",
            room: normalizeRoomDetail(populatedRoom as any),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to join room" });
    }
};

export const leaveRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        const userId = String(req.user);
        room.participants = room.participants.filter((participant) => String(participant) !== userId);
        room.participantCount = Math.max(0, room.participants.length);
        await room.save();

        await User.findByIdAndUpdate(req.user, {
            $pull: { joinedRooms: room._id },
        });

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        (req as any).io?.emit("room_left", { roomId: String(room._id), userId });
        (req as any).io?.to(String(room._id)).emit("room_participants_updated", {
            roomId: String(room._id),
            participantCount: room.participantCount,
        });

        res.status(200).json({
            success: true,
            message: "Left room",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to leave room" });
    }
};

export const sendRoomMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        const text = String(req.body?.text || "").trim();
        if (!text) {
            res.status(400).json({ success: false, message: "Message text is required" });
            return;
        }

        room.recentMessages.unshift({
            sender: new Types.ObjectId(String(req.user)),
            text,
            createdAt: new Date(),
        });
        room.recentMessages = room.recentMessages.slice(0, 10);
        await room.save();

        const payload = {
            roomId: String(room._id),
            message: {
                sender: String(req.user),
                text,
                createdAt: new Date(),
            },
        };

        (req as any).io?.to(String(room._id)).emit("room_message", payload);

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        res.status(200).json({ success: true, message: payload.message });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

export const addTrackToQueue = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (!room.allowQueueAdd && String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Queue additions are disabled" });
            return;
        }

        const { trackId, title, artist, artwork, audioUrl, lyrics } = req.body || {};
        if (!trackId || !title) {
            res.status(400).json({ success: false, message: "Track details are required" });
            return;
        }

        room.queue.push({
            trackId: String(trackId),
            title: String(title),
            artist: String(artist || ""),
            artwork: String(artwork || ""),
            audioUrl: String(audioUrl || ""),
            lyrics: String(lyrics || ""),
            addedBy: new Types.ObjectId(String(req.user)),
        });
        await room.save();

        (req as any).io?.to(String(room._id)).emit("room_queue_updated", {
            roomId: String(room._id),
            queue: room.queue,
        });

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        res.status(200).json({ success: true, queue: room.queue });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to update queue" });
    }
};

export const toggleDJMode = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Only the host can toggle DJ mode" });
            return;
        }

        room.djMode = !room.djMode;
        room.currentDJ = room.djMode ? room.currentDJ || room.participants[0] || room.host : room.host;
        await room.save();

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        res.status(200).json({
            success: true,
            djMode: room.djMode,
            currentDJ: room.currentDJ,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to toggle DJ mode" });
    }
};

export const assignDJ = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Only the host can assign DJ" });
            return;
        }

        const { userId } = req.body || {};
        if (!userId) {
            res.status(400).json({ success: false, message: "User ID is required" });
            return;
        }

        room.currentDJ = new Types.ObjectId(String(userId));
        await room.save();

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        res.status(200).json({ success: true, currentDJ: room.currentDJ });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to assign DJ" });
    }
};

export const updateRoomVisibility = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Only the host can change room visibility" });
            return;
        }

        const { visibility } = req.body || {};
        if (!visibility || !["public", "private"].includes(visibility)) {
            res.status(400).json({ success: false, message: "Visibility must be 'public' or 'private'" });
            return;
        }

        room.visibility = visibility;
        await room.save();

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        res.status(200).json({ success: true, visibility: room.visibility });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to update visibility" });
    }
};

export const reorderQueue = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Only the host can reorder the queue" });
            return;
        }

        const { queue } = req.body || {};
        if (!Array.isArray(queue)) {
            res.status(400).json({ success: false, message: "Queue array is required" });
            return;
        }

        room.queue = queue.map((item: any) => ({
            trackId: String(item.trackId || ""),
            title: String(item.title || ""),
            artist: String(item.artist || ""),
            artwork: String(item.artwork || ""),
            audioUrl: String(item.audioUrl || ""),
            lyrics: String(item.lyrics || ""),
            addedBy: item.addedBy ? new Types.ObjectId(String(item.addedBy)) : room.host,
        }));
        await room.save();

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        res.status(200).json({ success: true, queue: room.queue });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to reorder queue" });
    }
};

export const removeFromQueue = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Only the host can remove tracks from the queue" });
            return;
        }

        const index = parseInt(req.params.index || req.body?.index, 10);
        if (isNaN(index) || index < 0 || index >= room.queue.length) {
            res.status(400).json({ success: false, message: "Valid queue index is required" });
            return;
        }

        room.queue.splice(index, 1);
        await room.save();

        await invalidateRoomCache(String(room._id));
        await clearRoomState(String(room._id));
        await refreshRoomStateCache(String(room._id), room);

        res.status(200).json({ success: true, queue: room.queue });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to remove from queue" });
    }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Only the host can delete this room" });
            return;
        }

        await User.updateMany(
            { joinedRooms: room._id },
            { $pull: { joinedRooms: room._id } }
        );
        await User.findByIdAndUpdate(req.user, {
            $pull: { createdRooms: room._id, joinedRooms: room._id },
        });

        await room.deleteOne();

        (req as any).io?.to(String(room._id)).emit("room_deleted", { roomId: String(room._id) });

        await invalidateRoomCache(String(room._id));

        res.status(200).json({
            success: true,
            message: "Room deleted",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to delete room" });
    }
};

export const syncPlayback = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: "Room not found" });
            return;
        }

        if (String(room.host) !== String(req.user)) {
            res.status(403).json({ success: false, message: "Only the host can sync playback" });
            return;
        }

        const currentSong = req.body?.currentSong || {};
        room.currentSong = {
            trackId: String(currentSong.trackId || ""),
            title: String(currentSong.title || ""),
            artist: String(currentSong.artist || ""),
            artwork: String(currentSong.artwork || ""),
            audioUrl: String(currentSong.audioUrl || ""),
            lyrics: String(currentSong.lyrics || ""),
        };
        room.currentlyPlaying = String(req.body?.currentlyPlaying || currentSong.title || "");
        room.isLive = req.body?.isLive !== undefined ? Boolean(req.body.isLive) : room.isLive;
        await room.save();

        await invalidateRoomCache(String(room._id));
        await refreshRoomStateCache(String(room._id), room);
        await syncRoomQueueSnapshot(String(room._id), room.queue || []);

        (req as any).io?.to(String(room._id)).emit("room_playback_sync", {
            roomId: String(room._id),
            currentSong: room.currentSong,
            currentlyPlaying: room.currentlyPlaying,
            isLive: room.isLive,
        });

        res.status(200).json({ success: true, room: normalizeRoom(room as any) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to sync playback" });
    }
};
