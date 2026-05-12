import { useEffect, useRef } from 'react';
import { authUtils } from '../utils/auth';

export const useAuth = () => {
    const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const setupTokenRefresh = () => {
            // Clear any existing timer
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }

            // Check if user is authenticated and token not expired
            if (!authUtils.isAuthenticated()) {
                return;
            }

            if (authUtils.isTokenExpired()) {
                authUtils.removeToken();
                window.location.href = '/login';
                return;
            }

            // Set up periodic check (every 5 minutes)
            refreshTimerRef.current = setInterval(() => {
                if (authUtils.isTokenExpired()) {
                    authUtils.removeToken();
                    window.location.href = '/login';
                }
            }, 5 * 60 * 1000); // 5 minutes
        };

        setupTokenRefresh();

        // Cleanup on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, []);

    return {
        isAuthenticated: authUtils.isAuthenticated(),
        isExpired: authUtils.isTokenExpired(),
    };
};
