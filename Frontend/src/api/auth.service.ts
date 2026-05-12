import { apiClient } from "./client";

export interface SignupData {
    fullName: string;
    username: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface GoogleAuthData {
    email: string;
    fullName: string;
    avatar?: string;
    googleId: string;
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
};
