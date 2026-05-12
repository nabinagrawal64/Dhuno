import { Navigate } from "react-router-dom";
import { authUtils } from "../utils/auth";
import toast from "react-hot-toast";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    // If user is NOT authenticated, redirect to login
    if (!authUtils.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // If token is expired, clear it and redirect to login
    if (authUtils.isTokenExpired()) {
        authUtils.removeToken();
        toast.error("Session expired. Please login again.");
        return <Navigate to="/login" replace />;
    }

    // Otherwise render the protected page
    return <>{children}</>;
}
