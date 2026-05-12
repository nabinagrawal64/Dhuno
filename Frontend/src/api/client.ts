import { authUtils } from "../utils/auth";
import { csrfUtils } from "../utils/csrf";
import { loggerUtils } from "../utils/logger";

export const API_BASE_URL = "http://localhost:4000/api";

export const apiClient = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const startTime = performance.now();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    };

    // Get token and add to Authorization header if it exists
    const token = authUtils.getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
    const method = options.method?.toUpperCase() || "GET";
    if (csrfUtils.needsProtection(method)) {
        const csrfHeaders = csrfUtils.getHeader();
        Object.assign(headers, csrfHeaders);
    }

    const config: RequestInit = {
        ...options,
        headers,
        credentials: "include", // Include cookies for httpOnly cookie support
    };

    const response = await fetch(url, config);
    const duration = performance.now() - startTime;

    // Parse JSON
    const data = await response.json().catch(() => ({}));

    // Log API call
    loggerUtils.logApiCall(method, endpoint, response.status, duration);

    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
        authUtils.removeToken();
        loggerUtils.error("Unauthorized - Token expired or invalid", undefined, {
            endpoint,
            status: response.status,
        });
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
    }

    // Handle 403 Forbidden (CSRF token invalid)
    if (response.status === 403) {
        loggerUtils.warn("CSRF token validation failed", {
            endpoint,
            status: response.status,
        });
        throw new Error("Security check failed. Please refresh and try again.");
    }

    if (!response.ok) {
        loggerUtils.warn(`API error: ${response.status}`, {
            endpoint,
            status: response.status,
            message: data.message,
        });
        throw new Error(data.message || "An error occurred");
    }

    return data;
};
