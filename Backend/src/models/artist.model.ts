import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IArtist extends Document {
    name: string;
    username: string;
    avatar: string;
    bannerImage: string;
    bio: string;
    genres: string[];
    followers: Types.ObjectId[];
    monthlyListeners: number;
    topSongs: Types.ObjectId[];
    verified: boolean;
    socialLinks: {
        instagram?: string;
        youtube?: string;
        twitter?: string;
        spotify?: string;
    };

    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

const artistSchema = new Schema<IArtist>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        avatar: {
            type: String,
            default: "",
        },

        bannerImage: {
            type: String,
            default: "",
        },

        bio: {
            type: String,
            default: "",
            maxlength: 500,
        },

        genres: [
            {
                type: String,
            },
        ],

        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        monthlyListeners: {
            type: Number,
            default: 0,
        },

        topSongs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Song",
            },
        ],

        verified: {
            type: Boolean,
            default: false,
        },

        socialLinks: {
            instagram: String,
            youtube: String,
            twitter: String,
            spotify: String,
        },

        location: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Artist = mongoose.model<IArtist>(
    "Artist",
    artistSchema
);

export default Artist;