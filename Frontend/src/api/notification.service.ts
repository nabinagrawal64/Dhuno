import { apiClient } from './client';

export type NotificationItem = {
    _id: string;
    senderName?: string;
    senderAvatar?: string;
    type: 'invite' | 'alert' | 'creator-update' | 'follow' | 'playlist-like' | 'clip-drop' | 'room-live' | 'system';
    category: 'activity' | 'invites' | 'alerts';
    title: string;
    message: string;
    actionLabel?: string;
    actionUrl?: string;
    isRead: boolean;
    isActionTaken?: boolean;
    priority?: 'low' | 'medium' | 'high';
    metadata?: {
        songTitle?: string;
        roomName?: string;
        playlistName?: string;
    };
    createdAt: string;
};

export const notificationService = {
    getNotifications: async (): Promise<{ success: boolean; notifications: NotificationItem[] }> => {
        return apiClient('/notifications', { method: 'GET' }) as Promise<{ success: boolean; notifications: NotificationItem[] }>;
    },

    markAsRead: async (id: string): Promise<{ success: boolean; notification: NotificationItem }> => {
        return apiClient(`/notifications/${id}/read`, { method: 'PATCH' }) as Promise<{ success: boolean; notification: NotificationItem }>;
    },

    markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
        return apiClient('/notifications/read-all', { method: 'PATCH' }) as Promise<{ success: boolean; message: string }>;
    },

    deleteNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
        return apiClient(`/notifications/${id}`, { method: 'DELETE' }) as Promise<{ success: boolean; message: string }>;
    },

    clearAll: async (): Promise<{ success: boolean; message: string }> => {
        return apiClient('/notifications/clear-all', { method: 'DELETE' }) as Promise<{ success: boolean; message: string }>;
    },
};
