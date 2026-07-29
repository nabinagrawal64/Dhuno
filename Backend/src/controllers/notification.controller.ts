import type { Response } from "express";
import Notification from "../models/notification.model";
import { AuthRequest } from "../types/request.types";

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const notifications = await Notification.find({ receiver: req.user })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, receiver: req.user },
            { $set: { isRead: true } },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ success: false, message: "Notification not found" });
            return;
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ success: false, message: "Failed to update notification" });
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        await Notification.updateMany(
            { receiver: req.user, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ success: false, message: "Failed to mark all as read" });
    }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const { id } = req.params;
        const deleted = await Notification.findOneAndDelete({ _id: id, receiver: req.user });

        if (!deleted) {
            res.status(404).json({ success: false, message: "Notification not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ success: false, message: "Failed to delete notification" });
    }
};

export const clearAllNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        await Notification.deleteMany({ receiver: req.user });

        res.status(200).json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({ success: false, message: "Failed to clear notifications" });
    }
};
