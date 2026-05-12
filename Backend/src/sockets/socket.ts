import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

export const initializeSocket = (server: HttpServer, allowedOrigins: string[]) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    let onlineCount = 0;

    io.on("connection", (socket: Socket) => {
        onlineCount++;
        io.emit("online_count", onlineCount);
        console.log("🟢 Client connected:", socket.id, `(Total: ${onlineCount})`);

        socket.on("join_room", (roomId: string) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on("leave_room", (roomId: string) => {
            socket.leave(roomId);
            console.log(`User ${socket.id} left room ${roomId}`);
        });

        socket.on("disconnect", () => {
            onlineCount--;
            io.emit("online_count", onlineCount);
            console.log("🔴 Client disconnected:", socket.id, `(Total: ${onlineCount})`);
        });
    });

    return io;
};
