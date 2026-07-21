import { connectRedis, getRedisClient } from "../config/redis";

export const redisGetJson = async <T>(key: string): Promise<T | null> => {
    const client = await connectRedis();
    if (!client) {
        return null;
    }

    const value = await client.get(key);
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

export const redisSetJson = async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
    const client = await connectRedis();
    if (!client) {
        return;
    }

    const serialized = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, serialized, "EX", ttlSeconds);
        return;
    }

    await client.set(key, serialized);
};

export const redisDelete = async (...keys: string[]): Promise<void> => {
    const client = await connectRedis();
    if (!client || keys.length === 0) {
        return;
    }

    await client.del(...keys);
};

export const redisIncrWithExpiry = async (key: string, ttlMs: number): Promise<number | null> => {
    const client = await connectRedis();
    if (!client) {
        return null;
    }

    const count = await client.incr(key);
    if (count === 1) {
        await client.pexpire(key, ttlMs);
    }

    return count;
};

export const redisSetAdd = async (key: string, ...members: string[]): Promise<void> => {
    const client = await connectRedis();
    if (!client || members.length === 0) {
        return;
    }

    await client.sadd(key, ...members);
};

export const redisSetRemove = async (key: string, ...members: string[]): Promise<void> => {
    const client = await connectRedis();
    if (!client || members.length === 0) {
        return;
    }

    await client.srem(key, ...members);
};

export const redisSetMembers = async (key: string): Promise<string[]> => {
    const client = await connectRedis();
    if (!client) {
        return [];
    }

    return client.smembers(key);
};

export const redisSetCount = async (key: string): Promise<number> => {
    const client = await connectRedis();
    if (!client) {
        return 0;
    }

    return client.scard(key);
};

export const redisHashSet = async (key: string, entries: Record<string, string | number | boolean | null | undefined>): Promise<void> => {
    const client = await connectRedis();
    if (!client) {
        return;
    }

    const normalizedEntries = Object.entries(entries).reduce<Record<string, string>>((accumulator, [entryKey, entryValue]) => {
        if (entryValue === undefined || entryValue === null) {
            return accumulator;
        }

        accumulator[entryKey] = String(entryValue);
        return accumulator;
    }, {});

    if (Object.keys(normalizedEntries).length === 0) {
        return;
    }

    await client.hset(key, normalizedEntries);
};

export const redisHashGetAll = async (key: string): Promise<Record<string, string>> => {
    const client = await connectRedis();
    if (!client) {
        return {};
    }

    return client.hgetall(key);
};

export const redisExpire = async (key: string, ttlSeconds: number): Promise<void> => {
    const client = await connectRedis();
    if (!client) {
        return;
    }

    await client.expire(key, ttlSeconds);
};

export const redisPublish = async (channel: string, payload: unknown): Promise<void> => {
    const client = await connectRedis();
    if (!client) {
        return;
    }

    await client.publish(channel, JSON.stringify(payload));
};

export const redisSubscribeClient = (): ReturnType<typeof getRedisClient> => getRedisClient();
