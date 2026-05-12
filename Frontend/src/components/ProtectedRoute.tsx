import { Navigate, useLocation } from "react-router-dom";
import { authUtils } from "../utils/auth";
import toast from "react-hot-toast";

export default function ProtectedRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles?: Array<"user" | "artist" | "admin">;
}) {
    const location = useLocation();

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

    const role = authUtils.getRole() ?? "user";
    const isAllowed = !allowedRoles || allowedRoles.includes(role);

    if (!isAllowed) {
        const fallbackPath = role === "artist" ? "/artist/dashboard" : "/home";

        if (location.pathname.startsWith("/artist")) {
            return <Navigate to="/artist/dashboard" replace />;
        }

        return <Navigate to={fallbackPath} replace />;
    }

    // Otherwise render the protected page
    return <>{children}</>;
}
