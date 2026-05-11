import mongoose, { Schema, Document, Types, } from "mongoose";

export interface ISong extends Document {
    title: string;
    artist: Types.ObjectId;
    featuringArtists: Types.ObjectId[];
    album: string;
    coverImage: string;
    audioUrl: string;
    duration: number;
    genre: string[];
    mood: string[];
    language: string;
    lyrics: string;
    meaningEnabled: boolean;
    source: "audius" | "custom";
    externalTrackId?: string;
    plays: number;
    likes: Types.ObjectId[];
    saves: number;
    shares: number;
    isExplicit: boolean;
    isTrending: boolean;
    waveformColor: string;
    releaseDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const songSchema = new Schema<ISong>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        artist: {
            type: Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
        },

        featuringArtists: [
            {
                type: Schema.Types.ObjectId,
                ref: "Artist",
            },
        ],

        album: {
            type: String,
            default: "",
        },

        coverImage: {
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

        genre: [
            {
                type: String,
            },
        ],

        mood: [
            {
                type: String,
            },
        ],

        language: {
            type: String,
            default: "English",
        },

        lyrics: {
            type: String,
            default: "",
        },

        meaningEnabled: {
            type: Boolean,
            default: true,
        },

        source: {
            type: String,
            enum: ["audius", "custom"],
            default: "audius",
        },

        externalTrackId: {
            type: String,
            default: "",
        },

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

        saves: {
            type: Number,
            default: 0,
        },

        shares: {
            type: Number,
            default: 0,
        },

        isExplicit: {
            type: Boolean,
            default: false,
        },

        isTrending: {
            type: Boolean,
            default: false,
        },

        waveformColor: {
            type: String,
            default: "#5AFFF1",
        },

        releaseDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Song = mongoose.model<ISong>(
    "Song",
    songSchema
);

export default Song;