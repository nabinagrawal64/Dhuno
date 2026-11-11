import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCheck, Trash2, BellOff, Volume2, Music, Sparkles } from "lucide-react";
import { notificationService, type NotificationItem } from "../../api/notification.service";
import { useSocket } from "../../context/SocketContext";

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { socket } = useSocket();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<"all" | "activity" | "invites" | "alerts">("all");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationService.getNotifications();
            if (res.success) {
                setNotifications(res.notifications || []);
            }
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchNotifications();
    }, []);

    // Listen for live socket notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (data: Partial<NotificationItem> & { sampleId?: string }) => {
            console.log("🔔 [NotificationsPage] Received live notification:", data);
            toast.success(data.message || data.title || "New notification!", {
                icon: "🔔",
                position: "top-right",
            });

            const newNotif: NotificationItem = {
                _id: data.sampleId || `temp-${Date.now()}`,
                senderName: data.senderName || "Dhuno",
                senderAvatar: data.senderAvatar || "",
                type: data.type || "creator-update",
                category: data.category || "activity",
                title: data.title || "New Notification",
                message: data.message || "",
                actionLabel: data.actionLabel || "View",
                actionUrl: data.actionUrl || "",
                isRead: false,
                createdAt: new Date().toISOString(),
            };

            setNotifications((prev) => [newNotif, ...prev]);
        };

        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [socket]);

    const handleMarkAsRead = async (id: string, actionUrl?: string) => {
        try {
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            if (!id.startsWith("temp-")) {
                await notificationService.markAsRead(id);
            }
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }

        if (actionUrl) {
            navigate(actionUrl);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            await notificationService.markAllAsRead();
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark all as read");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (!id.startsWith("temp-")) {
                await notificationService.deleteNotification(id);
            }
            toast.success("Notification removed");
        } catch {
            toast.error("Failed to delete notification");
        }
    };

    const handleClearAll = async () => {
        try {
            setNotifications([]);
            await notificationService.clearAll();
            toast.success("All notifications cleared");
        } catch {
            toast.error("Failed to clear notifications");
        }
    };

    const filteredNotifications = notifications.filter((item) => {
        if (activeCategory === "all") return true;
        return item.category === activeCategory;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 172800) return "Yesterday";
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <div className="bg-surface-dim text-on-surface font-body relative selection:bg-primary/30 selection:text-primary w-full min-h-screen">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        backdrop-filter: blur(16px);
                        background: rgba(28, 32, 39, 0.6);
                    }`,
                }}
            />
            <div>
                {/* Ambient Background Glows */}
                <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-tertiary-container/5 blur-[120px] pointer-events-none" />

                {/* Main Content Area */}
                <main className="pt-6 md:pt-12 lg:pt-20 pb-44 px-4 md:px-6 lg:px-8 w-full">
                    {/* Header Section */}
                    <section className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tighter text-white">
                                        Notifications
                                    </h1>
                                    {unreadCount > 0 && (
                                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-xs border border-primary/30 animate-pulse">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm mt-1">
                                    Stay updated with song releases, creator updates, and community activity.
                                </p>
                            </div>

                            {/* Header Actions */}
                            {notifications.length > 0 && (
                                <div className="flex items-center gap-3 shrink-0">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                                        >
                                            <CheckCheck className="w-4 h-4 text-primary" />
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={handleClearAll}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Filter Chips */}
                    <section className="flex flex-wrap gap-3 mb-6">
                        <button
                            onClick={() => setActiveCategory("all")}
                            className={`px-6 py-2 rounded-full font-label text-sm font-semibold transition-all cursor-pointer ${
                                activeCategory === "all"
                                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                    : "bg-surface-container-high/40 text-slate-400 hover:bg-surface-container-highest hover:text-white"
                            }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setActiveCategory("activity")}
                            className={`px-6 py-2 rounded-full font-label text-sm font-semibold transition-all cursor-pointer ${
                                activeCategory === "activity"
                                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                    : "bg-surface-container-high/40 text-slate-400 hover:bg-surface-container-highest hover:text-white"
                            }`}
                        >
                            Activity
                        </button>
                        <button
                            onClick={() => setActiveCategory("invites")}
                            className={`px-6 py-2 rounded-full font-label text-sm font-semibold transition-all cursor-pointer ${
                                activeCategory === "invites"
                                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                    : "bg-surface-container-high/40 text-slate-400 hover:bg-surface-container-highest hover:text-white"
                            }`}
                        >
                            Invites
                        </button>
                        <button
                            onClick={() => setActiveCategory("alerts")}
                            className={`px-6 py-2 rounded-full font-label text-sm font-semibold transition-all cursor-pointer ${
                                activeCategory === "alerts"
                                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                    : "bg-surface-container-high/40 text-slate-400 hover:bg-surface-container-highest hover:text-white"
                            }`}
                        >
                            Alerts
                        </button>
                    </section>

                    {/* Notifications List */}
                    <section className="flex flex-col gap-4 pb-10">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                                <span className="material-symbols-outlined text-4xl animate-spin text-primary">
                                    progress_activity
                                </span>
                                <p className="text-sm font-medium">Fetching notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="glass-panel p-12 rounded-3xl text-center border border-white/5 flex flex-col items-center justify-center my-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <BellOff className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 font-headline">No notifications yet</h3>
                                <p className="text-slate-400 text-sm max-w-sm">
                                    When artists release new songs, create playlists, or invite you to live sessions, updates will appear here!
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => handleMarkAsRead(item._id, item.actionUrl)}
                                    className={`group relative flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl backdrop-blur-lg border transition-all cursor-pointer ${
                                        !item.isRead
                                            ? "bg-surface-container-high/70 border-primary/30 shadow-lg shadow-primary/5"
                                            : "bg-surface-container-high/30 border-white/5 hover:bg-surface-container-high/50"
                                    }`}
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                                    {/* Sender Avatar / Icon */}
                                    <div className="relative size-12 sm:size-14 shrink-0 rounded-full overflow-hidden bg-surface-container-highest border border-white/10 flex items-center justify-center">
                                        {item.senderAvatar ? (
                                            <img
                                                src={item.senderAvatar}
                                                alt={item.senderName || "Notification"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center">
                                                {item.type === "creator-update" ? (
                                                    <Music className="w-6 h-6" />
                                                ) : item.type === "invite" ? (
                                                    <Volume2 className="w-6 h-6" />
                                                ) : (
                                                    <Sparkles className="w-6 h-6" />
                                                )}
                                            </div>
                                        )}

                                        {/* Unread Pill */}
                                        {!item.isRead && (
                                            <div className="absolute top-0 right-0 size-3 bg-primary rounded-full border-2 border-surface" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-label font-bold uppercase tracking-[0.1em] text-primary">
                                                {item.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {formatTimeAgo(item.createdAt)}
                                            </span>
                                        </div>
                                        <p className="font-body text-sm sm:text-[15px] text-slate-200 line-clamp-2">
                                            {item.message}
                                        </p>
                                    </div>

                                    {/* Action Buttons & Trash */}
                                    <div className="shrink-0 flex items-center gap-2 pl-2">
                                        {item.actionLabel && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(item._id, item.actionUrl);
                                                }}
                                                className="px-4 py-2 rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary font-label text-xs font-bold shadow-md hover:scale-105 transition-all cursor-pointer"
                                            >
                                                {item.actionLabel}
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(item._id, e)}
                                            className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
