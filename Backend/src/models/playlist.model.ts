import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IPlaylist extends Document {
    title: string;
    description: string;
    coverImage: string;
    owner: Types.ObjectId;
    songs: string[];
    totalTracks: number;
    totalDuration: number;
    visibility: "public" | "private";
    category:
        | "playlist"
        | "liked"
        | "downloads"
        | "recently-played";

    likes: Types.ObjectId[];
    saves: number;
    tags: string[];
    genre: string;
    language: string;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            default: "",
            maxlength: 300,
        },

        coverImage: {
            type: String,
            default: "",
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        songs: [
            {
                type: String,
            },
        ],

        totalTracks: {
            type: Number,
            default: 0,
        },

        totalDuration: {
            type: Number,
            default: 0,
        },

        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },

        category: {
            type: String,
            enum: [
                "playlist",
                "liked",
                "downloads",
                "recently-played",
            ],
            default: "playlist",
        },

        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        saves: {
            type: Number,
            default: 0,
        },

        tags: [
            {
                type: String,
            },
        ],
        genre: {
            type: String,
            default: "",
        },
        language: {
            type: String,
            default: "",
        },

        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Playlist = mongoose.model<IPlaylist>(
    "Playlist",
    playlistSchema
);

export default Playlist;