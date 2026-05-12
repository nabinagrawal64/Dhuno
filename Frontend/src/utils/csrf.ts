/**
 * CSRF Protection Utility
 * 
 * Implements token-based CSRF protection by:
 * 1. Storing a CSRF token in a non-httpOnly cookie
 * 2. Sending it in the X-CSRF-Token header for state-changing requests
 * 
 * IMPORTANT: This should be coordinated with backend CSRF middleware
 */

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

export const csrfUtils = {
    /**
     * Get CSRF token from cookie
     * The backend sets this on initial page load
     */
    getToken: (): string | null => {
        try {
            const cookies = document.cookie.split("; ");
            for (const cookie of cookies) {
                const [key, value] = cookie.split("=");
                if (key === CSRF_COOKIE_NAME) {
                    return decodeURIComponent(value);
                }
            }
        } catch {
            // Silently fail if reading cookies fails
        }
        return null;
    },

    /**
     * Get CSRF header for API requests
     * Include this in headers for POST, PUT, DELETE requests
     */
    getHeader: (): Record<string, string> => {
        const token = csrfUtils.getToken();
        if (!token) {
            console.warn("CSRF token not found. Make sure backend sets csrf-token cookie.");
            return {};
        }
        return {
            [CSRF_HEADER_NAME]: token,
        };
    },

    /**
     * Helper to check if request needs CSRF protection
     * GET requests typically don't need CSRF protection
     */
    needsProtection: (method: string): boolean => {
        return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
    },
};
