import { apiClient } from "./client";

export interface RoomHost {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
}

export interface RoomPreview {
    _id: string;
    roomName: string;
    description: string;
    coverImage: string;
    bannerImage: string;
    category: string;
    visibility: "public" | "private";
    host?: RoomHost | null;
    participantCount: number;
    totalJoins: number;
    currentSong: {
        trackId: string;
        title: string;
        artist: string;
        artwork: string;
        audioUrl: string;
        lyrics?: string;
    };
    queueCount: number;
    allowChat: boolean;
    allowQueueAdd: boolean;
    allowGuests: boolean;
    tags: string[];
    recentMessageCount: number;
    isLive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoomParticipant {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
    role: string;
}

export interface RoomMessage {
    sender: RoomParticipant | null;
    text: string;
    createdAt: string;
}

export interface RoomDetail extends RoomPreview {
    participants: RoomParticipant[];
    queue: {
        trackId: string;
        title: string;
        artist: string;
        artwork: string;
        audioUrl: string;
        lyrics?: string;
        addedBy: string;
    }[];
    recentMessages: RoomMessage[];
    djMode: boolean;
    currentDJ: string;
}

export interface CreateRoomPayload {
    roomName: string;
    description?: string;
    category?: string;
    visibility?: "public" | "private";
    coverImage?: string;
    bannerImage?: string;
    tags?: string[];
    allowChat?: boolean;
    allowQueueAdd?: boolean;
    allowGuests?: boolean;
    city?: string;
    area?: string;
    radius?: number;
    lat?: number;
    lng?: number;
}

export interface RoomTrackPayload {
    trackId: string;
    title: string;
    artist?: string;
    artwork?: string;
    audioUrl?: string;
}

export interface RoomQueueItem {
    trackId: string;
    title: string;
    artist: string;
    artwork: string;
    audioUrl: string;
    lyrics?: string;
    addedBy: string;
}

export interface ParticipantInfo {
    userId: string;
    socketId: string;
    fullName: string;
    username: string;
    avatar: string;
    role: string;
}

export const roomService = {
    getRooms: async (lat?: number, lng?: number) => {
        const query = lat && lng ? `?lat=${lat}&lng=${lng}` : "";
        return apiClient(`/rooms${query}`, {
            method: "GET",
        }) as Promise<{ success: boolean; rooms: RoomPreview[] }>;
    },
    getRoomById: async (roomId: string) => {
        return apiClient(`/rooms/${roomId}`, {
            method: "GET",
        }) as Promise<{ success: boolean; room: RoomDetail }>;
    },
    createRoom: async (payload: CreateRoomPayload) => {
        return apiClient("/rooms", {
            method: "POST",
            body: JSON.stringify(payload),
        }) as Promise<{ success: boolean; message: string; room: RoomPreview }>;
    },
    joinRoom: async (roomId: string) => {
        return apiClient(`/rooms/${roomId}/join`, {
            method: "POST",
        }) as Promise<{ success: boolean; message: string; room: RoomDetail }>;
    },
    leaveRoom: async (roomId: string) => {
        return apiClient(`/rooms/${roomId}/leave`, {
            method: "POST",
        }) as Promise<{ success: boolean; message: string }>;
    },
    sendRoomMessage: async (roomId: string, text: string) => {
        return apiClient(`/rooms/${roomId}/message`, {
            method: "POST",
            body: JSON.stringify({ text }),
        }) as Promise<{ success: boolean; message: RoomMessage }>;
    },
    addTrackToQueue: async (roomId: string, payload: RoomTrackPayload) => {
        return apiClient(`/rooms/${roomId}/queue`, {
            method: "POST",
            body: JSON.stringify(payload),
        }) as Promise<{ success: boolean; queue: RoomDetail["queue"] }>;
    },
    syncPlayback: async (
        roomId: string,
        payload: {
            currentSong: RoomTrackPayload;
            currentlyPlaying?: string;
            isLive?: boolean;
        }
    ) => {
        return apiClient(`/rooms/${roomId}/sync`, {
            method: "PUT",
            body: JSON.stringify(payload),
        }) as Promise<{ success: boolean; room: RoomPreview }>;
    },

    toggleDJMode: async (roomId: string) => {
        return apiClient(`/rooms/${roomId}/dj/toggle`, {
            method: "POST",
        }) as Promise<{ success: boolean; djMode: boolean; currentDJ: string }>;
    },

    assignDJ: async (roomId: string, userId: string) => {
        return apiClient(`/rooms/${roomId}/dj/assign`, {
            method: "POST",
            body: JSON.stringify({ userId }),
        }) as Promise<{ success: boolean; currentDJ: string }>;
    },

    updateRoomVisibility: async (roomId: string, visibility: "public" | "private") => {
        return apiClient(`/rooms/${roomId}/visibility`, {
            method: "PUT",
            body: JSON.stringify({ visibility }),
        }) as Promise<{ success: boolean; visibility: string }>;
    },

    reorderQueue: async (roomId: string, queue: RoomQueueItem[]) => {
        return apiClient(`/rooms/${roomId}/queue/reorder`, {
            method: "PUT",
            body: JSON.stringify({ queue }),
        }) as Promise<{ success: boolean; queue: RoomQueueItem[] }>;
    },

    removeFromQueue: async (roomId: string, index: number) => {
        return apiClient(`/rooms/${roomId}/queue/${index}`, {
            method: "DELETE",
        }) as Promise<{ success: boolean; queue: RoomQueueItem[] }>;
    },

    deleteRoom: async (roomId: string) => {
        return apiClient(`/rooms/${roomId}`, {
            method: "DELETE",
        }) as Promise<{ success: boolean; message: string }>;
    },
};
