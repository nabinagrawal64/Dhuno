import express from "express";
import { uploadSong, getMySongs, updateSong, searchSongs, getTrendingSongs } from "../controllers/song.controller";
import { protect } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = express.Router();

router.post(
    "/upload",
    protect,
    upload.fields([
        {
            name: "audio",
            maxCount: 1,
        },

        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),

    uploadSong
);

router.get("/search", protect, searchSongs);
router.get("/mine", protect, getMySongs);
router.get("/trending", protect, getTrendingSongs);
router.patch("/:id", protect, updateSong);

export default router;