import { apiClient } from "./client";

export interface SignupData {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role?: "user" | "artist";
}

export interface LoginData {
    email: string;
    password: string;
    role?: "user" | "artist" | "admin";
}

export interface GoogleAuthData {
    email: string;
    fullName: string;
    avatar?: string;
    googleId: string;
    role?: "user" | "artist";
}

export interface ForgotPasswordData {
    email: string;
}

export interface VerifyResetCodeData {
    email: string;
    code: string;
}

export interface ResetPasswordData {
    email: string;
    code: string;
    newPassword: string;
}

export interface UserProfile {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    avatar: string;
    bannerImage: string;
    bio: string;
    role: "user" | "artist" | "admin";
    isVerified: boolean;
    isArtistPro: boolean;
    followers: string[];
    following: string[];
    playlists: string[];
    uploadedClips: string[];
    joinedRooms: string[];
    twoFactorEnabled: boolean;
    totalSongs?: number;
}

export interface UpdateProfileData {
    fullName?: string;
    username?: string;
    bio?: string;
    avatar?: string;
    bannerImage?: string;
}

export const authService = {
    signup: async (data: SignupData) => {
        return apiClient("/auth/signup", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    login: async (data: LoginData) => {
        return apiClient("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    googleAuth: async (data: GoogleAuthData) => {
        return apiClient("/auth/google", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    logout: async () => {
        return apiClient("/auth/logout", {
            method: "POST",
        });
    },
    forgotPassword: async (data: ForgotPasswordData) => {
        return apiClient("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    verifyResetCode: async (data: VerifyResetCodeData) => {
        return apiClient("/auth/verify-reset-code", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    resetPassword: async (data: ResetPasswordData) => {
        return apiClient("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    getMe: async () => {
        return apiClient("/auth/me", {
            method: "GET",
        }) as Promise<{ success: boolean; user: UserProfile }>;
    },
    updateMe: async (data: UpdateProfileData) => {
        return apiClient("/auth/me", {
            method: "PUT",
            body: JSON.stringify(data),
        }) as Promise<{ success: boolean; message: string; user: UserProfile }>;
    },
    deleteMe: async () => {
        return apiClient("/auth/me", {
            method: "DELETE",
        }) as Promise<{ success: boolean; message: string }>;
    },
};
