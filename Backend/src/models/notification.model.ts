import mongoose, { Schema, Document, Types, } from "mongoose";

export interface INotification
    extends Document {
    // RECEIVER
    receiver: Types.ObjectId;

    // SENDER
    sender?: Types.ObjectId;
    senderName?: string;
    senderAvatar?: string;

    // TYPE
    type:
        | "invite"
        | "alert"
        | "creator-update"
        | "follow"
        | "playlist-like"
        | "clip-drop"
        | "room-live"
        | "system";

    // CATEGORY FILTER
    category:
        | "activity"
        | "invites"
        | "alerts";

    // CONTENT
    title: string;
    message: string;

    // OPTIONAL LINKS
    roomId?: Types.ObjectId;
    playlistId?: Types.ObjectId;
    clipId?: Types.ObjectId;
    artistId?: Types.ObjectId;

    // ACTION BUTTON
    actionLabel?: string;
    actionUrl?: string;

    // STATUS
    isRead: boolean;
    isActionTaken: boolean;

    // PRIORITY
    priority:
        | "low"
        | "medium"
        | "high";

    // EXTRA
    metadata?: {
        songTitle?: string;
        roomName?: string;
        playlistName?: string;
    };

    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema =
    new Schema<INotification>(
        {
            // RECEIVER
            receiver: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            // SENDER
            sender: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },

            senderName: {
                type: String,
                default: "",
            },

            senderAvatar: {
                type: String,
                default: "",
            },

            // TYPE
            type: {
                type: String,
                enum: [
                    "invite",
                    "alert",
                    "creator-update",
                    "follow",
                    "playlist-like",
                    "clip-drop",
                    "room-live",
                    "system",
                ],
                required: true,
            },

            // CATEGORY
            category: {
                type: String,
                enum: [
                    "activity",
                    "invites",
                    "alerts",
                ],
                default: "activity",
            },

            // CONTENT
            title: {
                type: String,
                required: true,
                maxlength: 100,
            },

            message: {
                type: String,
                required: true,
                maxlength: 300,
            },

            // OPTIONAL LINKS
            roomId: {
                type: Schema.Types.ObjectId,
                ref: "Room",
            },

            playlistId: {
                type: Schema.Types.ObjectId,
                ref: "Playlist",
            },

            clipId: {
                type: Schema.Types.ObjectId,
                ref: "Clip",
            },

            artistId: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },

            // ACTIONS
            actionLabel: {
                type: String,
                default: "",
            },

            actionUrl: {
                type: String,
                default: "",
            },

            // STATUS
            isRead: {
                type: Boolean,
                default: false,
            },

            isActionTaken: {
                type: Boolean,
                default: false,
            },

            // PRIORITY
            priority: {
                type: String,
                enum: [
                    "low",
                    "medium",
                    "high",
                ],
                default: "medium",
            },

            // EXTRA DATA
            metadata: {
                songTitle: {
                    type: String,
                    default: "",
                },

                roomName: {
                    type: String,
                    default: "",
                },

                playlistName: {
                    type: String,
                    default: "",
                },
            },
        },
        {
            timestamps: true,
        }
    );

const Notification =
    mongoose.model<INotification>(
        "Notification",
        notificationSchema
    );

export default Notification;