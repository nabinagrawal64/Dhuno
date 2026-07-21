import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";
import { initializeSocket } from "./sockets/socket";

import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import authRoutes from "./routes/auth.routes";
import playlistRoutes from "./routes/playlist.routes";
import roomRoutes from "./routes/room.routes";
import songRoutes from "./routes/song.routes";

dotenv.config();
connectDB();
void connectRedis();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [];

const io = initializeSocket(server, allowedOrigins);

app.use((req, res, next) => {
    (req as any).io = io;
    next();
});

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/songs", songRoutes);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "🎧 Dhuno API is running...",
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});