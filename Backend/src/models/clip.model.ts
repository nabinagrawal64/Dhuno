import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IClip extends Document {
    title: string;
    caption: string;
    thumbnail: string;
    audioUrl: string;
    duration: number;
    creator: Types.ObjectId;
    waveformColor: string;
    tags: string[];
    plays: number;
    likes: Types.ObjectId[];
    comments: {
        user: Types.ObjectId;
        text: string;
        createdAt: Date;
    }[];

    visibility: "public" | "private";
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const clipSchema = new Schema<IClip>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        caption: {
            type: String,
            default: "",
            maxlength: 200,
        },

        thumbnail: {
            type: String,
            required: true,
        },

        audioUrl: {
            type: String,
            required: true,
        },

        duration: {
            type: Number,
            required: true,
        },

        creator: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        waveformColor: {
            type: String,
            default: "#5AFFF1",
        },

        tags: [
            {
                type: String,
            },
        ],

        plays: {
            type: Number,
            default: 0,
        },

        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        comments: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },

                text: {
                    type: String,
                    required: true,
                    maxlength: 200,
                },

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Clip = mongoose.model<IClip>(
    "Clip",
    clipSchema
);

export default Clip;