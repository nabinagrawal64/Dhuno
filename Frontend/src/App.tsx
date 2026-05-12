import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import HomePage from './pages/home/HomePage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import CreateRoomPage from './pages/room/CreateRoomPage'
import LiveSessionPage from './pages/room/LiveSessionPage'
import RoomDiscoveryPage from './pages/room/RoomDiscoveryPage'
import ClipFeedPage from './pages/screen/ClipFeedPage'
import FullPlayerPage from './pages/screen/FullPlayerPage'
import LibraryPage from './pages/screen/LibraryPage'
import ProfilePage from './pages/screen/ProfilePage'
import SearchPage from './pages/screen/SearchPage'
import SettingsPage from './pages/settings/SettingsPage'
import AuthFlowPage from './components/AuthFlowPage'
import AuthProtectedRoute from './components/AuthProtectedRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AppPage from './components/AppPage'
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

                <Route path="/home" element={<ProtectedRoute><AppPage><HomePage /></AppPage></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><AppPage><SearchPage /></AppPage></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><AppPage><LibraryPage /></AppPage></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><AppPage><ProfilePage /></AppPage></ProtectedRoute>} />
                <Route path="/rooms/discovery" element={<ProtectedRoute><AppPage><RoomDiscoveryPage /></AppPage></ProtectedRoute>} />
                <Route path="/rooms/create" element={<ProtectedRoute><AppPage><CreateRoomPage /></AppPage></ProtectedRoute>} />
                <Route path="/rooms/live" element={<ProtectedRoute><AppPage><LiveSessionPage /></AppPage></ProtectedRoute>} />
                <Route path="/clips" element={<ProtectedRoute><AppPage><ClipFeedPage /></AppPage></ProtectedRoute>} />
                <Route path="/player" element={<ProtectedRoute><AppPage><FullPlayerPage /></AppPage></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><AppPage><NotificationsPage /></AppPage></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><AppPage><SettingsPage /></AppPage></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <SessionTimeoutWarning />
        </>
    )
}

export default App