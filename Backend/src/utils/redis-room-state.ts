import { connectRedis } from "../config/redis";
import { redisDelete, redisSetAdd, redisSetMembers, redisSetRemove } from "./redis-cache";

const ROOM_ACTIVE_SET_KEY = "rooms:active";
const roomQueueKey = (roomId: string) => `room:queue:${roomId}`;
const roomSocketStateKey = (roomId: string) => `room:socket-state:${roomId}`;
const roomPresenceKey = (roomId: string, socketId: string) => `room:presence:${roomId}:${socketId}`;
const roomSessionsKey = (roomId: string) => `room:sessions:${roomId}`;

export const registerRoomState = async (roomId: string): Promise<void> => {
    await redisSetAdd(ROOM_ACTIVE_SET_KEY, roomId);
};

export const clearRoomState = async (roomId: string): Promise<void> => {
    await redisDelete(roomQueueKey(roomId), roomSessionsKey(roomId), roomSocketStateKey(roomId));
    await redisSetRemove(ROOM_ACTIVE_SET_KEY, roomId);
};

export const syncRoomQueueSnapshot = async (roomId: string, queue: unknown[]): Promise<void> => {
    const client = await connectRedis();
    if (!client) {
        return;
    }

    const key = roomQueueKey(roomId);
    await client.del(key);

    if (queue.length > 0) {
        const scoreMembers = queue.flatMap((item, index) => [String(index), JSON.stringify(item)]);
        await client.zadd(key, ...scoreMembers);
    }

    await client.expire(key, 60 * 60);
    await registerRoomState(roomId);
};

export const loadRoomQueueSnapshot = async <T>(roomId: string): Promise<T[]> => {
    const client = await connectRedis();
    if (!client) {
        return [];
    }

    const items = await client.zrange(roomQueueKey(roomId), 0, -1);
    const parsed: T[] = [];

    for (const item of items) {
        try {
            parsed.push(JSON.parse(item) as T);
        } catch {
            // Ignore malformed queue entries and continue.
        }
    }

    return parsed;
};

export const touchRoomPresence = async (roomId: string, socketId: string, ttlSeconds = 90): Promise<void> => {
    const client = await connectRedis();
    if (!client) {
        return;
    }

    await client.set(
        roomPresenceKey(roomId, socketId),
        JSON.stringify({ roomId, socketId, lastSeen: Date.now() }),
        "EX",
        ttlSeconds,
    );
    await redisSetAdd(roomSessionsKey(roomId), socketId);
    await registerRoomState(roomId);
};

export const removeRoomPresence = async (roomId: string, socketId: string): Promise<void> => {
    const client = await connectRedis();
    if (!client) {
        return;
    }

    await client.del(roomPresenceKey(roomId, socketId));
    await redisSetRemove(roomSessionsKey(roomId), socketId);
};

export const cleanupRoomPresence = async (): Promise<{ roomId: string; removedSocketIds: string[]; cleaned: boolean }[]> => {
    const client = await connectRedis();
    if (!client) {
        return [];
    }

    const roomIds = await redisSetMembers(ROOM_ACTIVE_SET_KEY);
    const summary: { roomId: string; removedSocketIds: string[]; cleaned: boolean }[] = [];

    for (const roomId of roomIds) {
        const sessionKey = roomSessionsKey(roomId);
        const socketIds = await client.smembers(sessionKey);
        const removedSocketIds: string[] = [];

        for (const socketId of socketIds) {
            const presenceExists = await client.exists(roomPresenceKey(roomId, socketId));
            if (!presenceExists) {
                removedSocketIds.push(socketId);
            }
        }

        if (removedSocketIds.length > 0) {
            await redisSetRemove(sessionKey, ...removedSocketIds);
        }

        const remainingSockets = await client.scard(sessionKey);
        if (remainingSockets === 0) {
            await redisDelete(roomQueueKey(roomId), sessionKey, roomSocketStateKey(roomId));
            await redisSetRemove(ROOM_ACTIVE_SET_KEY, roomId);
        }

        summary.push({ roomId, removedSocketIds, cleaned: removedSocketIds.length > 0 || remainingSockets === 0 });
    }

    return summary;
};
