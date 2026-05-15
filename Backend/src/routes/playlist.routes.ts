import express from 'express';
import { protect } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';
import { addSongToPlaylist, createPlaylist, getMyPlaylists, getPlaylistById, getTopArtistPlaylists, reorderPlaylistSongs } from '../controllers/playlist.controller';

const router = express.Router();

router.get('/me', protect, getMyPlaylists);
router.get('/featured', getTopArtistPlaylists);
router.get('/:id', protect, getPlaylistById);
router.post('/', protect, upload.single('coverImage'), createPlaylist);
router.post('/:id/songs', protect, addSongToPlaylist);
router.put('/:id/reorder', protect, reorderPlaylistSongs);

export default router;