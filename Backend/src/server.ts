import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { initializeSocket } from "./sockets/socket";

import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import authRoutes from "./routes/auth.routes";
import playlistRoutes from "./routes/playlist.routes";
import roomRoutes from "./routes/room.routes";
import songRoutes from "./routes/song.routes";
import notificationRoutes from "./routes/notification.routes";

connectDB();
void connectRedis();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const parsedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean)
    : [];

const allowedOrigins = parsedOrigins.length > 0
    ? parsedOrigins
    : ["http://localhost:5173", "http://localhost:3000"];

console.log("CORS allowed origins:", allowedOrigins);

const io = initializeSocket(server, allowedOrigins);

app.use((req, res, next) => {
    (req as any).io = io;
    next();
});

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("/{*splat}", cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "🎧 Dhuno API is running...",
    });
});

server.on("error", (error: any) => {
    if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Please free port ${PORT} or restart the backend.`);
        process.exit(1);
    } else {
        console.error("Server error:", error);
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});