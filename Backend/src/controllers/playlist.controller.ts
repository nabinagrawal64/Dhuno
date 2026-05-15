import type { Response } from 'express';
import mongoose from 'mongoose';
import Playlist from '../models/playlist.model';
import Song from '../models/song.model';
import User from '../models/user.model';
import { AuthRequest } from '../types/request.types';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

const uploadToCloudinary = (
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'video'
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

const normalizePlaylist = (playlist: any, songsPreview: any[] = []) => ({
    id: playlist._id.toString(),
    title: playlist.title,
    description: playlist.description,
    coverImage: playlist.coverImage || (songsPreview[0]?.coverImage ?? ''),
    songs: songsPreview,
    totalTracks: playlist.totalTracks ?? songsPreview.length,
    totalDuration: playlist.totalDuration ?? songsPreview.reduce((s: number, x: any) => s + (x.duration || 0), 0),
    visibility: playlist.visibility,
    category: playlist.category,
    likes: Array.isArray(playlist.likes) ? playlist.likes.length : 0,
    saves: playlist.saves ?? 0,
    tags: Array.isArray(playlist.tags) ? playlist.tags : [],
    genre: playlist.genre || '',
    language: playlist.language || '',
    isPinned: Boolean(playlist.isPinned),
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
});

const addPlaylistToUser = async (userId: string, playlistId: string) => {
    await User.findByIdAndUpdate(userId, {
        $addToSet: { playlists: playlistId },
    });
};

export const getMyPlaylists = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }

        const playlists = await Playlist.find({ owner: req.user }).sort({ updatedAt: -1 }).lean();

        // For each playlist, load a small preview of the referenced songs (keep order)
        const result = [];
        for (const pl of playlists) {
            const ids = Array.isArray(pl.songs) ? pl.songs.filter(Boolean) : [];
            let songsPreview: any[] = [];

            if (ids.length > 0) {
                const docs = await Song.find({ _id: { $in: ids } }).lean();
                const map: Record<string, any> = {};
                for (const d of docs) map[String(d._id)] = d;
                // maintain original order
                songsPreview = ids.map((id: string) => {
                    const s = map[String(id)];
                    if (!s) return null;
                    return {
                        _id: String(s._id),
                        title: s.title,
                        artistName: s.artistName || s.artist?.name || '',
                        coverImage: s.coverImage || '',
                        duration: s.duration || 0,
                        audioUrl: s.audioUrl || '',
                    };
                }).filter(Boolean).slice(0, 50);
            }

            result.push(normalizePlaylist(pl, songsPreview));
        }

        res.status(200).json({ success: true, playlists: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to fetch playlists' });
    }
};

export const getTopArtistPlaylists = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const playlists = await Playlist.find({
            visibility: 'public',
            category: 'playlist',
        })
            .sort({ saves: -1, updatedAt: -1 })
            .populate({
                path: 'owner',
                select: 'fullName username avatar role',
            })
            .lean();

        const artistPlaylists = playlists.filter((playlist: any) => playlist.owner && playlist.owner.role === 'artist');

        const result = artistPlaylists
            .slice(0, 3)
            .map((playlist: any, index: number) => ({
                ...normalizePlaylist(playlist, []),
                rank: index + 1,
                owner: playlist.owner ? {
                    fullName: playlist.owner.fullName || '',
                    username: playlist.owner.username || '',
                    avatar: playlist.owner.avatar || '',
                } : null,
            }));

        res.status(200).json({ success: true, playlists: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to fetch featured playlists' });
    }
};

export const getPlaylistById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }

        const playlistId = req.params.id;
        if (!playlistId) {
            res.status(400).json({ success: false, message: 'Playlist id is required' });
            return;
        }

        const playlist = await Playlist.findOne({
            _id: playlistId,
            $or: [
                { visibility: 'public' },
                { owner: req.user },
            ],
            category: 'playlist',
        })
            .populate({
                path: 'owner',
                select: 'fullName username avatar role',
            })
            .lean();

        type PopulatedPlaylistOwner = {
            fullName?: string;
            username?: string;
            avatar?: string;
        } | null;

        type PopulatedPlaylist = typeof playlist & {
            owner?: PopulatedPlaylistOwner;
        };

        const populatedPlaylist = playlist as PopulatedPlaylist;

        if (!populatedPlaylist) {
            res.status(404).json({ success: false, message: 'Playlist not found' });
            return;
        }

        const ids = Array.isArray(populatedPlaylist.songs) ? populatedPlaylist.songs.filter(Boolean) : [];
        let songsPreview: any[] = [];

        if (ids.length > 0) {
            const docs = await Song.find({ _id: { $in: ids } }).lean();
            const map: Record<string, any> = {};
            for (const d of docs) map[String(d._id)] = d;

            songsPreview = ids.map((songId: string) => {
                const song = map[String(songId)];
                if (!song) return null;

                return {
                    _id: String(song._id),
                    title: song.title,
                    artistName: song.artistName || song.artist?.name || '',
                    coverImage: song.coverImage || '',
                    duration: song.duration || 0,
                    audioUrl: song.audioUrl || '',
                };
            }).filter(Boolean).slice(0, 50);
        }

        res.status(200).json({
            success: true,
            playlist: {
                ...normalizePlaylist(populatedPlaylist, songsPreview),
                owner: populatedPlaylist.owner ? {
                    fullName: populatedPlaylist.owner.fullName || '',
                    username: populatedPlaylist.owner.username || '',
                    avatar: populatedPlaylist.owner.avatar || '',
                } : null,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to fetch playlist' });
    }
};

export const createPlaylist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }

        const { title, genre, language, tags, songId } = req.body;
        const file = req.file;

        if (!title) {
            res.status(400).json({ success: false, message: 'Playlist name is required' });
            return;
        }

        let coverImage = '';
        if (file) {
            const uploaded = await uploadToCloudinary(file.buffer, 'dhuno/playlist_covers', 'image');
            coverImage = uploaded.secure_url;
        }

        const songs: string[] = [];
        let totalDuration = 0;

        if (songId) {
            const song = await Song.findById(songId);
            if (song) {
                songs.push(songId);
                totalDuration = song.duration || 0;
            }
        }

        const playlist = await Playlist.create({
            title,
            description: '',
            coverImage,
            owner: new mongoose.Types.ObjectId(String(req.user)),
            songs,
            totalTracks: songs.length,
            totalDuration,
            visibility: 'public',
            category: 'playlist',
            likes: [],
            saves: 0,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
            genre: genre || '',
            language: language || '',
            isPinned: false,
        });

        await addPlaylistToUser(String(req.user), playlist._id.toString());

        res.status(201).json({ success: true, playlist: normalizePlaylist(playlist) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to create playlist' });
    }
};

export const addSongToPlaylist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }

        const playlistId = req.params.id;
        const songId = typeof req.body?.songId === 'string' ? req.body.songId.trim() : '';

        if (!playlistId || !songId) {
            res.status(400).json({ success: false, message: 'Playlist and song are required' });
            return;
        }

        const playlist = await Playlist.findOne({ _id: playlistId, owner: req.user });
        if (!playlist) {
            res.status(404).json({ success: false, message: 'Playlist not found' });
            return;
        }

        const song = await Song.findById(songId);
        if (!song) {
            res.status(404).json({ success: false, message: 'Song not found' });
            return;
        }

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            playlist.totalTracks = playlist.songs.length;
            playlist.totalDuration = (playlist.totalDuration || 0) + (song.duration || 0);
            await playlist.save();
        }

        await addPlaylistToUser(String(req.user), playlist._id.toString());

        res.status(200).json({ success: true, playlist: normalizePlaylist(playlist) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to update playlist' });
    }
};

export const reorderPlaylistSongs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }

        const playlistId = req.params.id;
        const songIds = req.body?.songIds;

        if (!playlistId || !Array.isArray(songIds)) {
            res.status(400).json({ success: false, message: 'Playlist and songIds array are required' });
            return;
        }

        const playlist = await Playlist.findOne({ _id: playlistId, owner: req.user });
        if (!playlist) {
            res.status(404).json({ success: false, message: 'Playlist not found' });
            return;
        }

        playlist.songs = songIds;
        await playlist.save();

        res.status(200).json({ success: true, message: 'Playlist reordered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Failed to reorder playlist' });
    }
};