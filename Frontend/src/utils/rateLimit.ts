/**
 * Rate Limiting Utility for Auth Endpoints
 * 
 * Prevents brute force attacks by limiting:
 * - Login attempts: 5 tries per 15 minutes
 * - Signup attempts: 3 tries per 30 minutes
 * - Password reset: 3 tries per 60 minutes
 */

interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number; // Time window in milliseconds
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    signup: { maxAttempts: 3, windowMs: 30 * 60 * 1000 }, // 3 attempts per 30 minutes
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
};

interface AttemptRecord {
    count: number;
    resetAt: number;
}

const getStorageKey = (endpoint: string): string => `ratelimit_${endpoint}`;

export const rateLimitUtils = {
    /**
     * Check if action is rate-limited
     * Returns { allowed: boolean, retryAfter?: number }
     */
    checkLimit: (endpoint: string): { allowed: boolean; retryAfter?: number } => {
        const config = RATE_LIMIT_CONFIGS[endpoint];
        if (!config) {
            return { allowed: true }; // Unknown endpoint, allow
        }

        const storageKey = getStorageKey(endpoint);
        const now = Date.now();
        
        let record: AttemptRecord | null = null;
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                record = JSON.parse(stored);
            }
        } catch {
            // Ignore parsing errors
        }

        // Create new record if none exists or window has expired
        if (!record || now >= record.resetAt) {
            const newRecord: AttemptRecord = {
                count: 1,
                resetAt: now + config.windowMs,
            };
            localStorage.setItem(storageKey, JSON.stringify(newRecord));
            return { allowed: true };
        }

        // Increment existing record
        record.count++;
        
        if (record.count > config.maxAttempts) {
            const retryAfter = Math.ceil((record.resetAt - now) / 1000); // Seconds
            return { allowed: false, retryAfter };
        }

        localStorage.setItem(storageKey, JSON.stringify(record));
        return { allowed: true };
    },

    /**
     * Reset rate limit for endpoint (after successful action)
     */
    reset: (endpoint: string): void => {
        const storageKey = getStorageKey(endpoint);
        localStorage.removeItem(storageKey);
    },

    /**
     * Get remaining attempts
     */
    getRemaining: (endpoint: string): number => {
        const config = RATE_LIMIT_CONFIGS[endpoint];
        if (!config) return 0;

        const storageKey = getStorageKey(endpoint);
        const now = Date.now();
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return config.maxAttempts;
            
            const record: AttemptRecord = JSON.parse(stored);
            
            if (now >= record.resetAt) {
                return config.maxAttempts;
            }
            
            return Math.max(0, config.maxAttempts - record.count);
        } catch {
            return config.maxAttempts;
        }
    },

    /**
     * Get retry wait time in seconds
     */
    getRetryAfter: (endpoint: string): number => {
        const config = RATE_LIMIT_CONFIGS[endpoint];
        if (!config) return 0;

        const storageKey = getStorageKey(endpoint);
        const now = Date.now();
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return 0;
            
            const record: AttemptRecord = JSON.parse(stored);
            
            if (now >= record.resetAt) {
                return 0;
            }
            
            return Math.ceil((record.resetAt - now) / 1000);
        } catch {
            return 0;
        }
    },
};
