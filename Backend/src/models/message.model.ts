import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IMessage extends Document {
    room: Types.ObjectId;
    sender: Types.ObjectId;
    message: string;
    type:
        | "text"
        | "song-share"
        | "system"
        | "emoji";

    songId?: Types.ObjectId;
    isPinned: boolean;
    readBy: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema =
    new Schema<IMessage>(
        {
            room: {
                type: Schema.Types.ObjectId,
                ref: "Room",
                required: true,
            },

            sender: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            message: {
                type: String,
                required: true,
                maxlength: 500,
            },

            type: {
                type: String,
                enum: [
                    "text",
                    "song-share",
                    "system",
                    "emoji",
                ],
                default: "text",
            },

            songId: {
                type: Schema.Types.ObjectId,
                ref: "Song",
            },

            isPinned: {
                type: Boolean,
                default: false,
            },

            readBy: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },
        {
            timestamps: true,
        }
    );

const Message = mongoose.model<IMessage>(
    "Message",
    messageSchema
);

export default Message;