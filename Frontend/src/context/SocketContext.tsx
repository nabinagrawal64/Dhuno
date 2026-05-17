import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/client";
import { authUtils } from "../utils/auth";
import toast from "react-hot-toast";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineCount: number;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineCount: 0,
});

export const useSocket = () => useContext(SocketContext);

// Module-level singleton
let globalSocket: Socket | null = null;

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [socket, setSocket] = useState<Socket | null>(globalSocket);

    useEffect(() => {
        console.log("🧩 [SocketProvider] Mounting...");
        const socketUrl = API_BASE_URL.endsWith('/api') 
            ? API_BASE_URL.slice(0, -4) 
            : API_BASE_URL.replace('/api/', '/');
        
        if (!globalSocket) {
            console.log("🔌 Initializing socket at:", socketUrl);
            globalSocket = io(socketUrl, {
                withCredentials: true,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                // Force websocket to avoid polling upgrade loops entirely
                transports: ['websocket'], 
                auth: {
                    token: authUtils.getToken(),
                },
            });
            setSocket(globalSocket);
        }

        const s = globalSocket;

        function updateState() {
            setIsConnected(s.connected);
        }

        const onConnect = () => {
            updateState();
            console.log("🟢 Socket connected:", s.id, "Transport:", s.io.engine.transport.name);
        };

        const onDisconnect = (reason: string) => {
            updateState();
            console.log("🔴 Socket disconnected:", reason);
        };

        const onConnectError = (err: any) => {
            console.error("❌ Socket connection error:", err);
            updateState();
        };

        const onOnlineCount = (count: number) => {
            setOnlineCount(count);
        };

        const onNewSong = (song: any) => {
            toast.success(`New release: "${song.title}"`, {
                icon: '🎵',
                position: 'bottom-right',
            });
        };

        s.on("connect", onConnect);
        s.on("disconnect", onDisconnect);
        s.on("connect_error", onConnectError);
        s.on("online_count", onOnlineCount);
        s.on("new_song", onNewSong);

        updateState();

        return () => {
            console.log("🧩 [SocketProvider] Unmounting...");
            s.off("connect", onConnect);
            s.off("disconnect", onDisconnect);
            s.off("connect_error", onConnectError);
            s.off("online_count", onOnlineCount);
            s.off("new_song", onNewSong);
        };
    }, []);

    // Handle token sync on Login/Logout only
    useEffect(() => {
        const handleAuthChange = () => {
            if (!globalSocket) return;
            const token = authUtils.getToken();
            
            console.log("🔑 [SocketContext] Auth change detected. Token present:", !!token);
            globalSocket.auth = { token };
            if (globalSocket.connected) {
                console.log("🔌 [SocketContext] Forcing reconnection with new token...");
                globalSocket.disconnect().connect();
            } else {
                console.log("🔌 [SocketContext] Connecting socket...");
                globalSocket.connect();
            }
        };

        // Listen for storage events (token changed in another tab or by authUtils)
        window.addEventListener('storage', (e) => {
            if (e.key === 'auth_token') handleAuthChange();
        });

        return () => window.removeEventListener('storage', handleAuthChange);
    }, []);

    const value = useMemo(() => ({
        socket,
        isConnected,
        onlineCount
    }), [socket, isConnected, onlineCount]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
