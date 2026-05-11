import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
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
import AppPage from './components/AppPage'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
 
            <Route path="/login" element={<AuthFlowPage Page={LoginPage} mode="login" />} />
            <Route path="/signup" element={<AuthFlowPage Page={SignupPage} mode="signup" />} />

            <Route path="/home" element={<AppPage><HomePage /></AppPage>} />
            <Route path="/search" element={<AppPage><SearchPage /></AppPage>} />
            <Route path="/library" element={<AppPage><LibraryPage /></AppPage>} />
            <Route path="/profile" element={<AppPage><ProfilePage /></AppPage>} />
            <Route path="/rooms/discovery" element={<AppPage><RoomDiscoveryPage /></AppPage>} />
            <Route path="/rooms/create" element={<AppPage><CreateRoomPage /></AppPage>} />
            <Route path="/rooms/live" element={<AppPage><LiveSessionPage /></AppPage>} />
            <Route path="/clips" element={<AppPage><ClipFeedPage /></AppPage>} />
            <Route path="/player" element={<AppPage><FullPlayerPage /></AppPage>} />
            <Route path="/notifications" element={<AppPage><NotificationsPage /></AppPage>} />
            <Route path="/settings" element={<AppPage><SettingsPage /></AppPage>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App