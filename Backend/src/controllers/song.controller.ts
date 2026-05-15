import type { Response } from "express";
import { parseBuffer } from "music-metadata";
import { Readable } from "stream";

import Song from "../models/song.model";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../types/request.types";
import { Types } from "mongoose";
import User from "../models/user.model";
import Artist from "../models/artist.model";
import Playlist from "../models/playlist.model";

// HELPER: UPLOAD TO CLOUDINARY
const uploadToCloudinary = (
    buffer: Buffer,
    folder: string,
    resourceType: "image" | "video"
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

// UPLOAD SONG
export const uploadSong = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const audioFile = files?.audio?.[0];
        const coverImage = files?.coverImage?.[0];

        if (!audioFile) {
            res.status(400).json({
                success: false,
                message: "Audio file is required",
            });
            return;
        }

        const {
            title,
            artist,
            artistName,
            genre,
            language,
            lyrics,
            tags,
            isExplicit,
            playlistId,
        } = req.body;

        const currentUserId = req.user?.toString();
        if (!currentUserId) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const currentUser = await User.findById(currentUserId);
        if (!currentUser || !["artist", "admin"].includes(currentUser.role)) {
            res.status(403).json({ success: false, message: "Only artist accounts can upload songs" });
            return;
        }

        const artistProfile = await Artist.findOneAndUpdate(
            { username: currentUser.username },
            {
                name: currentUser.fullName,
                username: currentUser.username,
                avatar: currentUser.avatar,
                bio: currentUser.bio,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const metadata = await parseBuffer(audioFile.buffer, audioFile.mimetype);
        const duration = metadata.format.duration || 0;

        const uploadedAudio = await uploadToCloudinary(audioFile.buffer, "dhuno/songs", "video");

        let uploadedCover = null;
        if (coverImage) {
            uploadedCover = await uploadToCloudinary(coverImage.buffer, "dhuno/covers", "image");
        }

        const song = await Song.create({
            title,
            artist: artist || artistProfile._id,
            artistName,
            genre,
            language,
            lyrics,
            isExplicit: isExplicit === "true",
            tags: tags?.split(",").map((tag: string) => tag.trim()) || [],
            duration: Math.floor(duration),
            audioUrl: uploadedAudio.secure_url,
            audioPublicId: uploadedAudio.public_id,
            coverImage: uploadedCover?.secure_url || "",
            coverPublicId: uploadedCover?.public_id || "",
            uploadedBy: new Types.ObjectId(currentUserId),
            source: "custom" as const,
            plays: 0,
            likes: [],
        });

        // Add to playlist if provided
        if (playlistId) {
            const playlist = await Playlist.findById(playlistId);
            if (playlist) {
                playlist.songs.push(String(song._id));
                playlist.totalTracks = playlist.songs.length;
                playlist.totalDuration = (playlist.totalDuration || 0) + song.duration;
                await playlist.save();
            }
        }

        (req as any).io.emit("new_song", song);

        res.status(201).json({
            success: true,
            message: "Song uploaded successfully",
            song,
        });
    } catch (error) {
        console.error("SONG UPLOAD ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to upload song" });
    }
};

export const getMySongs = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const currentUserId = req.user?.toString();
        if (!currentUserId) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }

        const currentUser = await User.findById(currentUserId);
        if (!currentUser || !["artist", "admin"].includes(currentUser.role)) {
            res.status(403).json({
                success: false,
                message: "Only artist accounts can view this library",
            });
            return;
        }

        const songs = await Song.find({ uploadedBy: new Types.ObjectId(currentUserId) })
            .sort({ createdAt: -1 })
            .populate("artist", "name username avatar verified");

        res.status(200).json({
            success: true,
            songs,
        });
    } catch (error) {
        console.error("GET MY SONGS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load songs",
        });
    }
};

// UPDATE SONG
export const updateSong = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.toString();
        if (!currentUserId) {
            res.status(401).json({ success: false, message: "Not authorized" });
            return;
        }

        const song = await Song.findById(id);
        if (!song) {
            res.status(404).json({ success: false, message: "Song not found" });
            return;
        }

        if (song.uploadedBy?.toString() !== currentUserId) {
            res.status(403).json({ success: false, message: "Not authorized to edit this song" });
            return;
        }

        const { title, artistName, genre, language, lyrics } = req.body;
        
        let parsedGenre = song.genre;
        if (genre !== undefined) {
            if (typeof genre === 'string') {
                parsedGenre = genre.split(',').map((g: string) => g.trim()).filter((g: string) => g);
            } else if (Array.isArray(genre)) {
                parsedGenre = genre;
            }
        }

        const updatedSong = await Song.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: title || song.title,
                    artistName: artistName !== undefined ? artistName : song.artistName,
                    genre: parsedGenre,
                    language: language !== undefined ? language : song.language,
                    lyrics: lyrics !== undefined ? lyrics : song.lyrics
                }
            },
            { new: true }
        ).populate("artist", "name username avatar verified");

        res.status(200).json({
            success: true,
            message: "Song updated successfully",
            song: updatedSong
        });
    } catch (error) {
        console.error("UPDATE SONG ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update song" });
    }
};

// SEARCH SONGS
export const searchSongs = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const query = req.query.q as string;
        if (!query) {
            res.status(200).json({ success: true, songs: [] });
            return;
        }

        const regex = new RegExp(query, "i");

        const songs = await Song.find({
            $or: [
                { title: { $regex: regex } },
                { artistName: { $regex: regex } }
            ]
        })
        .populate("artist", "fullName username avatar")
        .limit(20);

        res.status(200).json({
            success: true,
            songs,
        });
    } catch (error) {
        console.error("Error searching songs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search songs",
        });
    }
};

export const getTrendingSongs = async (
    _req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const songs = await Song.find({})
            .sort({ plays: -1 })
            .limit(10)
            .populate("artist", "fullName username avatar verified");

        res.status(200).json({
            success: true,
            songs,
        });
    } catch (error) {
        console.error("Error fetching trending songs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch trending songs",
        });
    }
};