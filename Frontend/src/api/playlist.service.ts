import { apiClient } from './client';

export type PlaylistItem = {
    id: string;
    title: string;
    description?: string;
    coverImage?: string;
    songs: Array<{
        _id: string;
        title: string;
        artistName?: string;
        coverImage?: string;
        duration?: number;
        audioUrl?: string;
    }>;
    totalTracks: number;
    totalDuration: number;
    visibility?: string;
    category?: string;
    likes?: number;
    saves?: number;
    tags?: string[];
    genre?: string;
    language?: string;
    isPinned?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type PlaylistSongPreviewApiItem = {
    _id?: string;
    title?: string;
    artistName?: string;
    coverImage?: string;
    duration?: number;
    audioUrl?: string;
};

export type FeaturedPlaylistItem = PlaylistItem & {
    rank: number;
    owner?: {
        fullName: string;
        username: string;
        avatar: string;
    } | null;
};

type PlaylistApiItem = {
    id: string;
    title: string;
    description?: string;
    coverImage?: string;
    songs?: Array<string | PlaylistSongPreviewApiItem>;
    totalTracks?: number;
    totalDuration?: number;
    visibility?: string;
    category?: string;
    likes?: number;
    saves?: number;
    tags?: string[];
    genre?: string;
    language?: string;
    isPinned?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type PlaylistApiResponse = {
    success: boolean;
    playlists?: PlaylistApiItem[];
    playlist?: PlaylistItem;
    message?: string;
};

type FeaturedPlaylistApiItem = PlaylistApiItem & {
    rank?: number;
    owner?: {
        fullName?: string;
        username?: string;
        avatar?: string;
    } | null;
};

type FeaturedPlaylistApiResponse = {
    success: boolean;
    playlists?: FeaturedPlaylistApiItem[];
    message?: string;
};

type PlaylistByIdApiResponse = {
    success: boolean;
    playlist?: FeaturedPlaylistApiItem;
    message?: string;
};

const toPlaylistItem = (playlist: PlaylistApiItem): PlaylistItem => ({
    id: playlist.id,
    title: playlist.title,
    description: playlist.description,
    coverImage: playlist.coverImage,
    songs: Array.isArray(playlist.songs)
        ? playlist.songs.map((song) => (typeof song === 'string'
            ? {
                _id: song,
                title: '',
                artistName: '',
                coverImage: '',
                duration: 0,
                audioUrl: '',
            }
            : {
                _id: String(song._id ?? ''),
                title: song.title ?? '',
                artistName: song.artistName ?? '',
                coverImage: song.coverImage ?? '',
                duration: song.duration ?? 0,
                audioUrl: song.audioUrl ?? '',
            }))
        : [],
    totalTracks: playlist.totalTracks ?? (Array.isArray(playlist.songs) ? playlist.songs.length : 0),
    totalDuration: playlist.totalDuration ?? 0,
    visibility: playlist.visibility,
    category: playlist.category,
    likes: playlist.likes,
    saves: playlist.saves,
    tags: playlist.tags,
    genre: playlist.genre,
    language: playlist.language,
    isPinned: playlist.isPinned,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
});

const toFeaturedPlaylistItem = (playlist: FeaturedPlaylistApiItem): FeaturedPlaylistItem => ({
    ...toPlaylistItem(playlist),
    rank: playlist.rank ?? 0,
    owner: playlist.owner
        ? {
            fullName: playlist.owner.fullName ?? '',
            username: playlist.owner.username ?? '',
            avatar: playlist.owner.avatar ?? '',
        }
        : null,
});

export const playlistService = {
    getMyPlaylists: async (): Promise<{ success: boolean; playlists: PlaylistItem[] }> => {
        const response = await apiClient('/playlists/me', { method: 'GET' }) as PlaylistApiResponse;
        return {
            success: response.success,
            playlists: Array.isArray(response.playlists) ? response.playlists.map(toPlaylistItem) : [],
        };
    },

    getFeaturedPlaylists: async (): Promise<{ success: boolean; playlists: FeaturedPlaylistItem[] }> => {
        const response = await apiClient('/playlists/featured', { method: 'GET' }) as FeaturedPlaylistApiResponse;
        return {
            success: response.success,
            playlists: Array.isArray(response.playlists) ? response.playlists.map(toFeaturedPlaylistItem) : [],
        };
    },

    getPlaylistById: async (playlistId: string): Promise<{ success: boolean; playlist: FeaturedPlaylistItem | null }> => {
        const response = await apiClient(`/playlists/${playlistId}`, { method: 'GET' }) as PlaylistByIdApiResponse;
        return {
            success: response.success,
            playlist: response.playlist ? toFeaturedPlaylistItem(response.playlist) : null,
        };
    },

    createPlaylist: async (
        titleOrFormData: string | FormData,
        songId?: string
    ): Promise<{ success: boolean; playlist: PlaylistItem }> => {
        const { API_BASE_URL } = await import('./client');
        const { authUtils } = await import('../utils/auth');
        
        let body: FormData;
        if (titleOrFormData instanceof FormData) {
            body = titleOrFormData;
        } else {
            body = new FormData();
            body.append('title', titleOrFormData);
            if (songId) {
                body.append('songId', songId);
            }
        }
        
        const headers: Record<string, string> = {};
        const token = authUtils.getToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/playlists`, {
            method: 'POST',
            headers,
            body,
        });

        const data = await response.json() as PlaylistApiResponse;
        if (!data.playlist) {
            throw new Error(data.message || 'Failed to create playlist');
        }

        return {
            success: data.success,
            playlist: toPlaylistItem(data.playlist as PlaylistApiItem),
        };
    },

    addSongToPlaylist: async (playlistId: string, songId: string): Promise<{ success: boolean; playlist: PlaylistItem }> => {
        const response = await apiClient(`/playlists/${playlistId}/songs`, {
            method: 'POST',
            body: JSON.stringify({ songId }),
        }) as PlaylistApiResponse;

        if (!response.playlist) {
            throw new Error(response.message || 'Failed to update playlist');
        }

        return {
            success: response.success,
            playlist: response.playlist,
        };
    },

    reorderPlaylist: async (playlistId: string, songIds: string[]): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient(`/playlists/${playlistId}/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ songIds }),
        }) as PlaylistApiResponse;

        return {
            success: response.success,
            message: response.message || 'Reordered',
        };
    },
};