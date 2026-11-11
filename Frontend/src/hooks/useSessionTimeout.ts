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
    
    const handleLogout = useCallback(() => {
        loggerUtils.warn("Session timeout - Auto logout due to inactivity");
        authUtils.removeToken();
        navigate('/login');
    }, [navigate]);

    const clearTimers = useCallback(() => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }, []);

    const scheduleWarning = useCallback(() => {
        clearTimers();

        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsRemaining(Math.ceil(INACTIVITY_LOGOUT_TIME / 1000));
            loggerUtils.warn("Session inactivity warning shown");

            countdownTimerRef.current = setInterval(() => {
                setSecondsRemaining((prev) => Math.max(prev - 1, 0));
            }, 1000);

            logoutTimerRef.current = setTimeout(() => {
                handleLogout();
            }, INACTIVITY_LOGOUT_TIME);
        }, INACTIVITY_WARNING_TIME);
    }, [clearTimers, handleLogout]);

    const resetTimers = useCallback(() => {
        setShowWarning(false);
        setSecondsRemaining(0);
        scheduleWarning();
    }, [scheduleWarning]);

    const handleExtendSession = useCallback(() => {
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
                scheduleWarning();
            }
        };

        events.forEach((event) => {
            document.addEventListener(event, handleActivity);
        });

        // Initialize timers
        scheduleWarning();

        // Cleanup
        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            clearTimers();
        };
    }, [scheduleWarning, clearTimers, showWarning]);

    return {
        showWarning,
        secondsRemaining,
        handleExtendSession,
        handleLogout,
    };
};
