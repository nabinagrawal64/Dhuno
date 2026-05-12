import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IUser extends Document {
    // BASIC INFO
    fullName: string;
    username: string;
    email: string;
    password: string;

    // PROFILE
    avatar: string;
    bannerImage: string;
    bio: string;

    // ACCOUNT
    role: "user" | "artist" | "admin";
    isVerified: boolean;
    isArtistPro: boolean;

    // SOCIAL
    followers: Types.ObjectId[];
    following: Types.ObjectId[];

    // MUSIC
    likedSongs: string[];
    recentlyPlayed: string[];
    offlineSongs: string[];
    favoriteArtists: string[];

    // PLAYLISTS
    playlists: Types.ObjectId[];

    // ROOMS
    joinedRooms: Types.ObjectId[];
    createdRooms: Types.ObjectId[];

    // CLIPS
    uploadedClips: Types.ObjectId[];
    likedClips: Types.ObjectId[];

    // SETTINGS
    appearance: {
        theme: "dark" | "light" | "system";
        dynamicBackground: boolean;
        backgroundVideoThemes: boolean;
    };

    // SECURITY
    twoFactorEnabled: boolean;

    // DEVICES
    activeDevices: {
        deviceName: string;
        lastActive: Date;
        location?: string;
    }[];

    // PREMIUM
    subscription: {
        type: "free" | "pro";
        startedAt?: Date;
        expiresAt?: Date;
    };

    // PASSWORD RESET
    resetPasswordOTP?: string;
    resetPasswordOTPExpires?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        // BASIC INFO
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        // PROFILE
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
            maxlength: 250,
        },

        // ACCOUNT
        role: {
            type: String,
            enum: ["user", "artist", "admin"],
            default: "user",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isArtistPro: {
            type: Boolean,
            default: false,
        },

        // SOCIAL
        followers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // MUSIC
        likedSongs: [
            {
                type: String,
            },
        ],

        recentlyPlayed: [
            {
                type: String,
            },
        ],

        offlineSongs: [
            {
                type: String,
            },
        ],

        favoriteArtists: [
            {
                type: String,
            },
        ],

        // PLAYLISTS
        playlists: [
            {
                type: Schema.Types.ObjectId,
                ref: "Playlist",
            },
        ],

        // ROOMS
        joinedRooms: [
            {
                type: Schema.Types.ObjectId,
                ref: "Room",
            },
        ],

        createdRooms: [
            {
                type: Schema.Types.ObjectId,
                ref: "Room",
            },
        ],

        // CLIPS
        uploadedClips: [
            {
                type: Schema.Types.ObjectId,
                ref: "Clip",
            },
        ],

        likedClips: [
            {
                type: Schema.Types.ObjectId,
                ref: "Clip",
            },
        ],

        // SETTINGS
        appearance: {
            theme: {
                type: String,
                enum: ["dark", "light", "system"],
                default: "dark",
            },

            dynamicBackground: {
                type: Boolean,
                default: true,
            },

            backgroundVideoThemes: {
                type: Boolean,
                default: true,
            },
        },

        // SECURITY
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },

        // DEVICES
        activeDevices: [
            {
                deviceName: {
                    type: String,
                },

                lastActive: {
                    type: Date,
                    default: Date.now,
                },

                location: {
                    type: String,
                },
            },
        ],

        // SUBSCRIPTION
        subscription: {
            type: {
                type: String,
                enum: ["free", "pro"],
                default: "free",
            },

            startedAt: Date,

            expiresAt: Date,
        },

        // PASSWORD RESET
        resetPasswordOTP: {
            type: String,
            select: false,
        },

        resetPasswordOTPExpires: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>(
    "User",
    userSchema
);

export default User;