import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { loggerUtils } from '../utils/logger';

const INACTIVITY_WARNING_TIME = 5 * 60 * 1000; // 5 minutes
const INACTIVITY_LOGOUT_TIME = 2 * 60 * 1000; // 2 more minutes (7 minutes total)

export const useSessionTimeout = () => {
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const resetTimers = useCallback(() => {
        // Clear existing timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        // Hide warning if showing
        setShowWarning(false);
        setSecondsRemaining(0);

        lastActivityRef.current = Date.now();

        // Set new warning timer
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsRemaining(Math.ceil(INACTIVITY_LOGOUT_TIME / 1000));
            loggerUtils.warn("Session inactivity warning shown");

            // Start countdown
            countdownTimerRef.current = setInterval(() => {
                setSecondsRemaining((prev) => {
                    if (prev <= 1) {
                        // Auto logout
                        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                        handleLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Set logout timer
            logoutTimerRef.current = setTimeout(() => {
                handleLogout();
            }, INACTIVITY_LOGOUT_TIME);
        }, INACTIVITY_WARNING_TIME);
    }, []);

    const handleLogout = useCallback(() => {
        loggerUtils.warn("Session timeout - Auto logout due to inactivity");
        authUtils.removeToken();
        navigate('/login');
    }, [navigate]);

    const handleExtendSession = useCallback(() => {
        setShowWarning(false);
        setSecondsRemaining(0);
        resetTimers();
        loggerUtils.info("Session extended by user");
    }, [resetTimers]);

    // Setup activity listeners
    useEffect(() => {
        if (!authUtils.isAuthenticated()) {
            return;
        }

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            // Only reset if not already showing warning (warning period is for user decision)
            if (!showWarning) {
                resetTimers();
            }
        };

        events.forEach((event) => {
            document.addEventListener(event, handleActivity);
        });

        // Initialize timers
        resetTimers();

        // Cleanup
        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        };
    }, [resetTimers, showWarning]);

    return {
        showWarning,
        secondsRemaining,
        handleExtendSession,
        handleLogout,
    };
};
