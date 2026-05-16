import mongoose, { Schema, Document, Types, } from "mongoose";

export interface IRoom extends Document {
    // BASIC
    roomName: string;
    description: string;
    coverImage: string;
    bannerImage: string;
    category:
        | "public"
        | "private"
        | "friends"
        | "electronic"
        | "lofi"
        | "party"
        | "chill";

    // OWNER
    host: Types.ObjectId;
    moderators: Types.ObjectId[];

    // USERS
    participants: Types.ObjectId[];
    participantCount: number;

    // MUSIC
    currentSong: {
        trackId: string;
        title: string;
        artist: string;
        artwork: string;
        audioUrl: string;
        lyrics: string;
    };

    queue: {
        trackId: string;
        title: string;
        artist: string;
        artwork: string;
        audioUrl: string;
        lyrics: string;
        addedBy: Types.ObjectId;
    }[];

    // ROOM STATUS
    isLive: boolean;
    currentlyPlaying: string;

    // LOCATION
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    city: string;
    area: string;
    radius: number;

    // ROOM SETTINGS
    visibility: "public" | "private";
    allowChat: boolean;
    allowQueueAdd: boolean;
    allowGuests: boolean;
    djMode: boolean;
    currentDJ: Types.ObjectId;

    // ROOM ACTIVITY
    likes: Types.ObjectId[];
    tags: string[];

    // ANALYTICS
    totalJoins: number;
    trendingScore: number;

    // CHAT PREVIEW
    recentMessages: {
        sender: Types.ObjectId;
        text: string;
        createdAt: Date;
    }[];

    // VOTING
    skipVotes: {
        voter: Types.ObjectId;
        timestamp: Date;
    }[];

    createdAt: Date;
    updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
    {
        // BASIC
        roomName: {
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

        bannerImage: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            enum: [
                "public",
                "private",
                "friends",
                "electronic",
                "lofi",
                "party",
                "chill",
            ],
            default: "public",
        },

        // OWNER
        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        moderators: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // USERS
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        participantCount: {
            type: Number,
            default: 0,
        },

        // MUSIC
        currentSong: {
            trackId: {
                type: String,
                default: "",
            },

            title: {
                type: String,
                default: "",
            },

            artist: {
                type: String,
                default: "",
            },

            artwork: {
                type: String,
                default: "",
            },

            audioUrl: {
                type: String,
                default: "",
            },

            lyrics: {
                type: String,
                default: "",
            },
        },

        queue: [
            {
                trackId: String,

                title: String,

                artist: String,

                artwork: String,

                audioUrl: {
                    type: String,
                    default: "",
                },

                lyrics: {
                    type: String,
                    default: "",
                },

                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            },
        ],

        // ROOM STATUS
        isLive: {
            type: Boolean,
            default: true,
        },

        currentlyPlaying: {
            type: String,
            default: "",
        },

        // LOCATION
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                required: true,
            },
        },

        city: {
            type: String,
            default: "",
        },

        area: {
            type: String,
            default: "",
        },

        radius: {
            type: Number,
            default: 5,
        },

        // SETTINGS
        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },

        allowChat: {
            type: Boolean,
            default: true,
        },

        allowQueueAdd: {
            type: Boolean,
            default: true,
        },

        allowGuests: {
            type: Boolean,
            default: true,
        },

        djMode: {
            type: Boolean,
            default: false,
        },

        currentDJ: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        // ACTIVITY
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        tags: [
            {
                type: String,
            },
        ],

        // ANALYTICS
        totalJoins: {
            type: Number,
            default: 0,
        },

        trendingScore: {
            type: Number,
            default: 0,
        },

        // CHAT
        recentMessages: [
            {
                sender: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },

                text: {
                    type: String,
                    maxlength: 200,
                },

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // VOTING
        skipVotes: [
            {
                voter: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },

                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// GEO INDEX
roomSchema.index({
    location: "2dsphere",
});

const Room = mongoose.model<IRoom>(
    "Room",
    roomSchema
);

export default Room;