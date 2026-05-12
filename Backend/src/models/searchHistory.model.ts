import mongoose, { Schema, Document, Types, } from "mongoose";

export interface ISearchHistory extends Document {
    user: Types.ObjectId;
    query: string;

    category:
        | "all"
        | "songs"
        | "artists"
        | "rooms"
        | "clips"
        | "mood";

    resultType:
        | "song"
        | "artist"
        | "playlist"
        | "room"
        | "clip";

    clickedItemId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const searchHistorySchema =
    new Schema<ISearchHistory>(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            query: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100,
            },

            category: {
                type: String,
                enum: [
                    "all",
                    "songs",
                    "artists",
                    "rooms",
                    "clips",
                    "mood",
                ],
                default: "all",
            },

            resultType: {
                type: String,
                enum: [
                    "song",
                    "artist",
                    "playlist",
                    "room",
                    "clip",
                ],
            },

            clickedItemId: {
                type: String,
                default: "",
            },
        },
        {
            timestamps: true,
        }
    );

const SearchHistory =
    mongoose.model<ISearchHistory>(
        "SearchHistory",
        searchHistorySchema
    );

export default SearchHistory;