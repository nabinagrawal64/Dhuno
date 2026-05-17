import type { ComponentType } from 'react';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import HomePage from './home/HomePage';
import SearchPage from './screen/SearchPage';
import LibraryPage from './screen/LibraryPage';
import DownloadsPage from './screen/DownloadsPage';
import ProfilePage from './screen/ProfilePage';
import ClipFeedPage from './screen/ClipFeedPage';
import FullPlayerPage from './screen/FullPlayerPage';
import RoomDiscoveryPage from './room/RoomDiscoveryPage';
import CreateRoomPage from './room/CreateRoomPage';
import LiveSessionPage from './room/LiveSessionPage';
import NotificationsPage from './notifications/NotificationsPage';

export type DhunoPage = {
  title: string;
  category: string;
  path: string;
  source: string;
  Component: ComponentType;
};

export const dhunoPages: DhunoPage[] = [
  {
    title: "Auth / Login",
    category: "Auth",
    path: "/login",
    source: "Page/Auth/Login.html",
    Component: LoginPage,
  },
  {
    title: "Auth / Signup",
    category: "Auth",
    path: "/signup",
    source: "Page/Auth/Signup.html",
    Component: SignupPage,
  },
  {
    title: "Home",
    category: "Home",
    path: "/home",
    source: "Page/Home/home desktop.html",
    Component: HomePage,
  },
  {
    title: "Screen / Search",
    category: "Screen",
    path: "/search",
    source: "Page/Screen/search desktop.html",
    Component: SearchPage,
  },
  {
    title: "Screen / Library",
    category: "Screen",
    path: "/library",
    source: "Page/Screen/library desktop.html",
    Component: LibraryPage,
  },
  {
    title: "Screen / Downloads",
    category: "Screen",
    path: "/library/downloads",
    source: "Page/Screen/downloads desktop.html",
    Component: DownloadsPage,
  },
  {
    title: "Screen / Profile",
    category: "Screen",
    path: "/profile",
    source: "Page/Screen/profile desktop.html",
    Component: ProfilePage,
  },
  {
    title: "Screen / Clip Feed",
    category: "Screen",
    path: "/clips",
    source: "Page/Screen/clip feed desktop.html",
    Component: ClipFeedPage,
  },
  {
    title: "Screen / Full Player",
    category: "Screen",
    path: "/player",
    source: "Page/Screen/full player desktop.html",
    Component: FullPlayerPage,
  },
  {
    title: "Room / Discovery",
    category: "Room",
    path: "/rooms/discovery",
    source: "Page/Room/room discoovery desktop.html",
    Component: RoomDiscoveryPage,
  },
  {
    title: "Room / Create Room",
    category: "Room",
    path: "/rooms/create",
    source: "Page/Room/Create room desktop.html",
    Component: CreateRoomPage,
  },
  {
    title: "Room / Live Session",
    category: "Room",
    path: "/rooms/live",
    source: "Page/Room/room live sessions enhanced desktop.html",
    Component: LiveSessionPage,
  },
  {
    title: "Notifications",
    category: "Notifications",
    path: "/notifications",
    source: "Page/Notification and settings/notification desktop.html",
    Component: NotificationsPage,
  },
];
