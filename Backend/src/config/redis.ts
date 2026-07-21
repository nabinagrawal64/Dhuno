import Redis from "ioredis";

let redisClient: Redis | null = null;

export const isRedisConfigured = Boolean(process.env.REDIS_URL);

export const getRedisClient = (): Redis | null => {
    if (!isRedisConfigured) {
        return null;
    }

    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL as string, {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
        });

        redisClient.on("error", (error) => {
            console.warn("Redis error:", error.message);
        });
    }

    return redisClient;
};

export const connectRedis = async (): Promise<Redis | null> => {
    const client = getRedisClient();
    if (!client) {
        return null;
    }

    if (client.status === "wait" || client.status === "end" || client.status === "close") {
        try {
            await client.connect();
        } catch (error) {
            console.warn("Redis connect skipped:", error instanceof Error ? error.message : error);
        }
    }

    return client;
};

export const closeRedis = async (): Promise<void> => {
    if (!redisClient) {
        return;
    }

    try {
        await redisClient.quit();
    } catch {
        redisClient.disconnect();
    } finally {
        redisClient = null;
    }
};
