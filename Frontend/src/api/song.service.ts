import { apiClient, API_BASE_URL } from './client';
import { authUtils } from '../utils/auth';
import { csrfUtils } from '../utils/csrf';

export type SongItem = {
    _id: string;
    title: string;
    artistName?: string;
    genre?: string[];
    language?: string;
    lyrics?: string;
    tags?: string[];
    isExplicit?: boolean;
    duration?: number;
    plays?: number;
    coverImage?: string;
    audioUrl?: string;
    createdAt?: string;
    artist?: {
        _id: string;
        name?: string;
        username?: string;
        avatar?: string;
        verified?: boolean;
    };
};

export type SongUploadData = {
    title: string;
    artistName: string;
    genre: string;
    language: string;
    lyrics: string;
    tags: string;
    isExplicit: boolean;
    audio: File;
    coverImage?: File | null;
    playlistId?: string;
};

export const songService = {
    getMySongs: async () => {
        return apiClient('/songs/mine', { method: 'GET' }) as Promise<{ success: boolean; songs: SongItem[] }>;
    },

    uploadSong: async (data: SongUploadData) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('artistName', data.artistName);
        formData.append('genre', data.genre);
        formData.append('language', data.language);
        formData.append('lyrics', data.lyrics);
        formData.append('tags', data.tags);
        formData.append('isExplicit', String(data.isExplicit));
        formData.append('audio', data.audio);

        if (data.playlistId) {
            formData.append('playlistId', data.playlistId);
        }

        if (data.coverImage) {
            formData.append('coverImage', data.coverImage);
        }

        const headers: Record<string, string> = {};
        const token = authUtils.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        Object.assign(headers, csrfUtils.getHeader());

        const response = await fetch(`${API_BASE_URL}/songs/upload`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: formData,
        });

        const dataResponse = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(dataResponse.message || 'Failed to upload song');
        }

        return dataResponse as { success: boolean; song: SongItem };
    },

    updateSong: async (id: string, data: Partial<SongUploadData>) => {
        return apiClient(`/songs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }) as Promise<{ success: boolean; message: string; song: SongItem }>;
    },

    searchSongs: async (query: string): Promise<{ success: boolean; songs: SongItem[] }> => {
        return apiClient(`/songs/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
        }) as Promise<{ success: boolean; songs: SongItem[] }>;
    },

    getTrendingSongs: async (): Promise<{ success: boolean; songs: SongItem[] }> => {
        return apiClient('/songs/trending', {
            method: 'GET',
        }) as Promise<{ success: boolean; songs: SongItem[] }>;
    },
};
