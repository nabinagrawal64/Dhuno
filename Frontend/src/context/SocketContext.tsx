import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        const socketUrl = API_BASE_URL.replace('/api', '');
        
        const socketInstance = io(socketUrl, {
            withCredentials: true,
            autoConnect: true,
            auth: {
                token: authUtils.getToken(),
            },
        });

        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            setIsConnected(true);
            console.log("🟢 Connected to Socket.IO server");
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
            console.log("🔴 Disconnected from Socket.IO server");
        });

        socketInstance.on("new_song", (song: any) => {
            console.log("🎵 New song available:", song);
            toast.success(`New release: "${song.title}"`, {
                icon: '🎵',
                position: 'bottom-right',
            });
        });

        socketInstance.on("online_count", (count: number) => {
            setOnlineCount(count);
        });

        // Room playback events are handled by components/pages directly via `socket`.

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineCount }}>
            {children}
        </SocketContext.Provider>
    );
};
