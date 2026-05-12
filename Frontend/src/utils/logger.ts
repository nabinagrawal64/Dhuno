export type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    userAgent?: string;
    url?: string;
}

export const loggerUtils = {
    log: (level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) => {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
            url: typeof window !== "undefined" ? window.location.href : undefined,
        };

        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        // Development: Log to console
        if (import.meta.env.DEV) {
            if (level === "error") {
                console.error(`[${level.toUpperCase()}] ${message}`, { context, error });
            } else if (level === "warn") {
                console.warn(`[${level.toUpperCase()}] ${message}`, { context, error });
            } else {
                console.log(`[${level.toUpperCase()}] ${message}`, { context, error });
            }
        }

        // TODO: Production - Send to logging service
        // Example: Send to Sentry, DataDog, LogRocket, etc.
        // if (process.env.NODE_ENV === "production") {
        //     sendToLoggingService(entry);
        // }

        // Store in localStorage for debugging (max 50 entries)
        loggerUtils._storeLocally(entry);
    },

    info: (message: string, context?: Record<string, unknown>) => {
        loggerUtils.log("info", message, context);
    },

    warn: (message: string, context?: Record<string, unknown>) => {
        loggerUtils.log("warn", message, context);
    },

    error: (message: string, error?: Error, context?: Record<string, unknown>) => {
        loggerUtils.log("error", message, context, error);
    },

    debug: (message: string, context?: Record<string, unknown>) => {
        if (import.meta.env.DEV) {
            loggerUtils.log("debug", message, context);
        }
    },

    logAuthEvent: (event: "login" | "signup" | "logout" | "token_refresh" | "googleLogin" | "googleSignup", details?: Record<string, unknown>) => {
        loggerUtils.info(`Auth: ${event}`, {
            event,
            ...details,
        });
    },

    logApiCall: (method: string, endpoint: string, status?: number, duration?: number) => {
        const logLevel = status && status >= 400 ? "warn" : "info";
        loggerUtils.log(logLevel, `API ${method} ${endpoint}`, {
            method,
            endpoint,
            status,
            duration,
        });
    },

    logPerformance: (metric: string, duration: number) => {
        loggerUtils.info(`Performance: ${metric}`, {
            metric,
            duration,
        });
    },

    getLogs: (): LogEntry[] => {
        try {
            const stored = localStorage.getItem("_app_logs");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    clearLogs: () => {
        localStorage.removeItem("_app_logs");
    },

    exportLogs: (): string => {
        const logs = loggerUtils.getLogs();
        return JSON.stringify(logs, null, 2);
    },

    _storeLocally: (entry: LogEntry) => {
        try {
            const logs = loggerUtils.getLogs();
            logs.push(entry);
            
            // Keep only last 50 entries
            const trimmedLogs = logs.slice(-50);
            localStorage.setItem("_app_logs", JSON.stringify(trimmedLogs));
        } catch {
            // Silently fail if localStorage is full or unavailable
        }
    },

    setupGlobalErrorHandler: () => {
        // Handle uncaught errors
        window.addEventListener("error", (event) => {
            loggerUtils.error(
                `Uncaught error: ${event.error?.message || "Unknown error"}`,
                event.error instanceof Error ? event.error : undefined,
                {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                }
            );
        });

        // Handle unhandled promise rejections
        window.addEventListener("unhandledrejection", (event) => {
            loggerUtils.error(
                `Unhandled promise rejection: ${event.reason}`,
                event.reason instanceof Error ? event.reason : undefined
            );
        });

        loggerUtils.info("Global error handler initialized");
    },
};
