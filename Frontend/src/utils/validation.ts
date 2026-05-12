/**
 * Input Validation & Sanitization Utility
 * 
 * Provides safe validation for auth forms:
 * - Email validation (RFC 5322 simplified)
 * - Password strength validation
 * - XSS prevention through sanitization
 * - Field trimming and normalization
 */

export const validationUtils = {
    /**
     * Validate email format
     */
    isValidEmail: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    /**
     * Validate password strength
     * Requirements:
     * - At least 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number or special character
     */
    validatePasswordStrength: (password: string): {
        isStrong: boolean;
        message: string;
    } => {
        if (password.length < 8) {
            return {
                isStrong: false,
                message: "Password must be at least 8 characters",
            };
        }

        if (!/[A-Z]/.test(password)) {
            return {
                isStrong: false,
                message: "Password must contain at least one uppercase letter",
            };
        }

        if (!/[a-z]/.test(password)) {
            return {
                isStrong: false,
                message: "Password must contain at least one lowercase letter",
            };
        }

        if (!/[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return {
                isStrong: false,
                message: "Password must contain at least one number or special character",
            };
        }

        return {
            isStrong: true,
            message: "Password is strong",
        };
    },

    /**
     * Validate username
     * Requirements:
     * - 3-20 characters
     * - Only alphanumeric and underscores
     * - Cannot start with number
     */
    isValidUsername: (username: string): boolean => {
        const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_]{2,19}$/;
        return usernameRegex.test(username.trim());
    },

    /**
     * Validate full name
     * Requirements:
     * - At least 2 characters
     * - Only letters, spaces, hyphens, apostrophes
     */
    isValidFullName: (fullName: string): boolean => {
        const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
        return nameRegex.test(fullName.trim());
    },

    /**
     * Sanitize input by removing XSS vectors
     * - Removes script tags and event handlers
     * - Escapes HTML special characters
     */
    sanitizeInput: (input: string): string => {
        if (!input) return "";

        // Trim whitespace
        let sanitized = input.trim();

        // Remove any HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, "");

        // Escape HTML special characters
        const htmlEscapeMap: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "/": "&#x2F;",
        };

        sanitized = sanitized.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);

        return sanitized;
    },

    /**
     * Validate form data object
     */
    validateLoginForm: (data: { email: string; password: string }): {
        isValid: boolean;
        errors: Record<string, string>;
    } => {
        const errors: Record<string, string> = {};

        if (!data.email.trim()) {
            errors.email = "Email is required";
        } else if (!validationUtils.isValidEmail(data.email)) {
            errors.email = "Please enter a valid email";
        }

        if (!data.password.trim()) {
            errors.password = "Password is required";
        } else if (data.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },

    /**
     * Validate signup form data
     */
    validateSignupForm: (data: {
        fullName: string;
        username: string;
        email: string;
        password: string;
        confirm: string;
    }): {
        isValid: boolean;
        errors: Record<string, string>;
    } => {
        const errors: Record<string, string> = {};

        // Validate full name
        if (!data.fullName.trim()) {
            errors.fullName = "Full name is required";
        } else if (!validationUtils.isValidFullName(data.fullName)) {
            errors.fullName = "Full name must be at least 2 characters";
        }

        // Validate username
        if (!data.username.trim()) {
            errors.username = "Username is required";
        } else if (!validationUtils.isValidUsername(data.username)) {
            errors.username =
                "Username must be 3-20 characters (letters, numbers, underscores only)";
        }

        // Validate email
        if (!data.email.trim()) {
            errors.email = "Email is required";
        } else if (!validationUtils.isValidEmail(data.email)) {
            errors.email = "Please enter a valid email";
        }

        // Validate password
        if (!data.password.trim()) {
            errors.password = "Password is required";
        } else {
            const passwordCheck = validationUtils.validatePasswordStrength(data.password);
            if (!passwordCheck.isStrong) {
                errors.password = passwordCheck.message;
            }
        }

        // Validate password confirmation
        if (!data.confirm.trim()) {
            errors.confirm = "Please confirm your password";
        } else if (data.password !== data.confirm) {
            errors.confirm = "Passwords do not match";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },
};
