import type { Options } from "express-rate-limit";
import { connectRedis } from "../config/redis";

export type RedisRateLimitStore = {
    init: (options: Options) => void;
    increment: (key: string) => Promise<{ totalHits: number; resetTime: Date }>;
    decrement: (key: string) => Promise<void>;
    resetKey: (key: string) => Promise<void>;
    resetAll: () => Promise<void>;
};

export const createRedisRateLimitStore = (prefix: string, windowMs: number): RedisRateLimitStore | undefined => {
    if (!process.env.REDIS_URL) {
        return undefined;
    }

    let currentWindowMs = windowMs;

    return {
        init: (options: Options) => {
            currentWindowMs = options.windowMs;
        },
        increment: async (key: string) => {
            const client = await connectRedis();
            if (!client) {
                return { totalHits: 1, resetTime: new Date(Date.now() + currentWindowMs) };
            }

            const redisKey = `${prefix}:${key}`;
            const totalHits = await client.incr(redisKey);
            if (totalHits === 1) {
                await client.pexpire(redisKey, currentWindowMs);
            }

            return {
                totalHits,
                resetTime: new Date(Date.now() + currentWindowMs),
            };
        },
        decrement: async (key: string) => {
            const client = await connectRedis();
            if (!client) {
                return;
            }

            await client.decr(`${prefix}:${key}`);
        },
        resetKey: async (key: string) => {
            const client = await connectRedis();
            if (!client) {
                return;
            }

            await client.del(`${prefix}:${key}`);
        },
        resetAll: async () => {
            const client = await connectRedis();
            if (!client) {
                return;
            }

            const keys = await client.keys(`${prefix}:*`);
            if (keys.length > 0) {
                await client.del(...keys);
            }
        },
    };
};
