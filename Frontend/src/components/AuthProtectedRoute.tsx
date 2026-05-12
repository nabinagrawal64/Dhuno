import { Navigate } from "react-router-dom";
import { authUtils } from "../utils/auth";

export default function AuthProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    // If user is authenticated, redirect to home
    if (authUtils.isAuthenticated()) {
        return <Navigate to="/home" replace />;
    }

    // Otherwise render the auth page
    return <>{children}</>;
}
