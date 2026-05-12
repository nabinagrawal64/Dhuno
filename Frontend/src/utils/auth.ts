import { authService } from "../api/auth.service";
import toast from "react-hot-toast";
import { loggerUtils } from "./logger";

const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";

export type AuthRole = "user" | "artist" | "admin";

// Decode JWT token to get expiration
const decodeToken = (token: string) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        console.error("Error decoding token");
        return null;
    }
};

export const authUtils = {
    /**
     * Save token - stores in localStorage for transitional period
     * Backend manages httpOnly cookie directly
     */
    saveToken: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Get token - checks localStorage first (for transitional period)
     * In full migration, this would check httpOnly cookie via header inspection
     */
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Remove token - clears localStorage
     * httpOnly cookies are cleared by backend via logout endpoint or expiry
     */
    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    saveRole: (role: AuthRole) => {
        localStorage.setItem(ROLE_KEY, role);
    },

    getRole: (): AuthRole | null => {
        const role = localStorage.getItem(ROLE_KEY);
        return role === "user" || role === "artist" || role === "admin" ? role : null;
    },

    removeRole: () => {
        localStorage.removeItem(ROLE_KEY);
    },

    getLandingPath: (role?: AuthRole | null) => {
        return role === "artist" ? "/artist/dashboard" : "/home";
    },

    isAuthenticated: () => {
        const token = authUtils.getToken();
        return !!token;
    },

    isTokenExpired: () => {
        const token = authUtils.getToken();
        if (!token) return true;

        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        // Check if token expires in the next 60 seconds
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp < now + 60;
    },

    logout: async (navigate?: (path: string) => void) => {
        try {
            await authService.logout();
        } catch {
            console.log("Logout API call failed, clearing token locally");
        } finally {
            // Always clear token locally regardless of API result
            authUtils.removeToken();
            authUtils.removeRole();
            loggerUtils.logAuthEvent("logout");
            toast.success("Logged out successfully");
            
            // Navigate to login if navigate function is provided
            if (navigate) {
                navigate("/login");
            }
        }
    },
};
