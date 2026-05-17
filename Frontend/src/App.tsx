import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import HomePage from './pages/home/HomePage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import CreateRoomPage from './pages/room/CreateRoomPage'
import LiveSessionPage from './pages/room/LiveSessionPage'
import RoomDiscoveryPage from './pages/room/RoomDiscoveryPage'
import FullPlayerPage from './pages/screen/FullPlayerPage'
import LibraryPage from './pages/screen/LibraryPage'
import LikedSongsPage from './pages/screen/LikedSongsPage'
import DownloadsPage from './pages/screen/DownloadsPage'
import ProfilePage from './pages/screen/ProfilePage'
import SearchPage from './pages/screen/SearchPage'
import RecentlyPlayedPage from './pages/screen/RecentlyPlayedPage'
import PlaylistDetailsPage from './pages/screen/PlaylistDetailsPage'
import ArtistDashboardPage from './pages/artist/ArtistDashboardPage'
import ArtistSongsPage from './pages/artist/ArtistSongsPage'
import ArtistClipsPage from './pages/artist/ArtistClipsPage'
import ArtistAnalyticsPage from './pages/artist/ArtistAnalyticsPage'
import ArtistPlaylistPage from './pages/artist/ArtistPlaylistPage'
import AuthFlowPage from './components/AuthFlowPage'
import AuthProtectedRoute from './components/AuthProtectedRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AppPage from './components/AppPage'
import ArtistAppPage from './components/ArtistAppPage'
import SessionTimeoutWarning from './components/SessionTimeoutWarning'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { useEffect } from 'react'
import { loggerUtils } from './utils/logger'

function App() {
    // Initialize auth lifecycle management (token expiry checks)
    useAuth()

    // Initialize global error handler and logging
    useEffect(() => {
        loggerUtils.setupGlobalErrorHandler()
        loggerUtils.info("App initialized", { version: "1.0.0" })
    }, [])

    return (
        <>
            <Toaster 
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1c2027',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(16px)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#5affe1',
                            secondary: '#1c2027',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ff5a5a',
                            secondary: '#1c2027',
                        },
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<AuthProtectedRoute><AuthFlowPage Page={LoginPage} /></AuthProtectedRoute>} />
                <Route path="/signup" element={<AuthProtectedRoute><AuthFlowPage Page={SignupPage} /></AuthProtectedRoute>} />
                <Route path="/forgot-password" element={<AuthProtectedRoute><ForgotPasswordPage /></AuthProtectedRoute>} />

                <Route path="/home" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><HomePage /></AppPage></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><SearchPage /></AppPage></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><LibraryPage /></AppPage></ProtectedRoute>} />
                <Route path="/library/liked" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><LikedSongsPage /></AppPage></ProtectedRoute>} />
                <Route path="/library/downloads" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><DownloadsPage /></AppPage></ProtectedRoute>} />
                <Route path="/library/recently-played" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><RecentlyPlayedPage /></AppPage></ProtectedRoute>} />
                <Route path="/library/playlist/:id" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><PlaylistDetailsPage /></AppPage></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><ProfilePage /></AppPage></ProtectedRoute>} />
                <Route path="/rooms/discovery" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><RoomDiscoveryPage /></AppPage></ProtectedRoute>} />
                <Route path="/rooms/create" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><CreateRoomPage /></AppPage></ProtectedRoute>} />
                <Route path="/rooms/live" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><LiveSessionPage /></AppPage></ProtectedRoute>} />
                <Route path="/player" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><FullPlayerPage /></AppPage></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute allowedRoles={["user", "artist", "admin"]}><AppPage><NotificationsPage /></AppPage></ProtectedRoute>} />

                <Route path="/artist" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><Navigate to="/artist/dashboard" replace /></ProtectedRoute>} />
                <Route path="/artist/dashboard" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><ArtistAppPage><ArtistDashboardPage /></ArtistAppPage></ProtectedRoute>} />
                <Route path="/artist/songs" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><ArtistAppPage><ArtistSongsPage /></ArtistAppPage></ProtectedRoute>} />
                <Route path="/artist/playlist/:id" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><ArtistAppPage><ArtistPlaylistPage /></ArtistAppPage></ProtectedRoute>} />
                <Route path="/artist/clips" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><ArtistAppPage><ArtistClipsPage /></ArtistAppPage></ProtectedRoute>} />
                <Route path="/artist/analytics" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><ArtistAppPage><ArtistAnalyticsPage /></ArtistAppPage></ProtectedRoute>} />
                <Route path="/artist/profile" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><ArtistAppPage><ProfilePage /></ArtistAppPage></ProtectedRoute>} />
                <Route path="/clips" element={<ProtectedRoute allowedRoles={["artist", "admin"]}><Navigate to="/artist/clips" replace /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <SessionTimeoutWarning />
        </>
    )
}

export default App