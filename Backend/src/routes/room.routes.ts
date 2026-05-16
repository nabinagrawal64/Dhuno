import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
    addTrackToQueue,
    assignDJ,
    createRoom,
    deleteRoom,
    getRoomById,
    getRooms,
    joinRoom,
    leaveRoom,
    removeFromQueue,
    reorderQueue,
    sendRoomMessage,
    syncPlayback,
    toggleDJMode,
    updateRoomVisibility,
} from "../controllers/room.controller";

const router = Router();

router.get("/", getRooms);
router.post("/", protect, createRoom);
router.get("/:id", protect, getRoomById);
router.post("/:id/join", protect, joinRoom);
router.post("/:id/leave", protect, leaveRoom);
router.post("/:id/message", protect, sendRoomMessage);
router.post("/:id/queue", protect, addTrackToQueue);
router.put("/:id/sync", protect, syncPlayback);
router.post("/:id/dj/toggle", protect, toggleDJMode);
router.post("/:id/dj/assign", protect, assignDJ);
router.put("/:id/visibility", protect, updateRoomVisibility);
router.put("/:id/queue/reorder", protect, reorderQueue);
router.delete("/:id/queue/:index", protect, removeFromQueue);
router.delete("/:id", protect, deleteRoom);

export default router;
