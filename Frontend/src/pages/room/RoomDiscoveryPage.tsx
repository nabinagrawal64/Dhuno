import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { roomService, type RoomPreview } from "../../api/room.service";
import { authUtils } from "../../utils/auth";

const categoryLabels = ["all", "public", "private", "friends"] as const;

export default function RoomDiscoveryPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<RoomPreview[]>([]);
    const [activeCategory] = useState<(typeof categoryLabels)[number]>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());
    const [myId, setMyId] = useState("");

    useEffect(() => {
        try {
            const t = authUtils.getToken();
            if (t) { const p = JSON.parse(atob(t.split(".")[1])); if (p.id) setMyId(p.id); }
        } catch { }
    }, []);

    const loadRooms = async (lat?: number, lng?: number) => {
        setIsLoading(true);
        try {
            const response = await roomService.getRooms(lat, lng);
            setRooms(response.rooms || []);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to load rooms";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            loadRooms();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                loadRooms(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error("Location error:", error);
                toast.error("Location access denied. Showing all public rooms.");
                loadRooms();
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, []);

    const filteredRooms = useMemo(() => {
        if (activeCategory === "all") {
            return rooms;
        }

        return rooms.filter((room) => room.visibility === activeCategory);
    }, [activeCategory, rooms]);

    const handleJoin = async (roomId: string) => {
        try {
            await roomService.joinRoom(roomId);
            setJoinedRooms(prev => new Set(prev).add(roomId));
            navigate(`/rooms/live?roomId=${roomId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to join room";
            toast.error(message);
        }
    };

    const handleEnter = (roomId: string) => {
        navigate(`/rooms/live?roomId=${roomId}`);
    };

    const handleDelete = async (roomId: string) => {
        try {
            await roomService.deleteRoom(roomId);
            setRooms(prev => prev.filter(r => r._id !== roomId));
            toast.success("Room deleted");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete room";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen pb-32 lg:pb-0 bg-[radial-gradient(circle_at_top,rgba(90,255,225,0.08),transparent_26%),linear-gradient(180deg,#0e1117_0%,#07090d_100%)] text-white">
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-10">
                {/* top section */}
                <section className="rounded-4xl border border-white/8 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-4xl">
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary/80">Live rooms</p>
                            <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight">Find a room. Join the same playback. Talk while the track moves.</h1>
                            <p className="mt-4 text-sm leading-6 text-slate-400 md:text-base">This discovery view now pulls actual rooms from the backend and opens the shared listening session instead of a placeholder dashboard.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link 
                                to="/rooms/create"
                                className="rounded-full border bg-primary text-black border-white/10 px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:text-white" 
                            >
                                Create room 
                            </Link>
                        </div>
                    </div>
                </section>

                {/* botom section */}
                <section className="grid gap-5 ">
                    <div className="rounded-4xl border border-white/8 bg-white/5 p-5 backdrop-blur-xl md:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h2 className="text-xl font-black tracking-tight md:text-2xl">Featured rooms</h2>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">{filteredRooms.length} rooms</span>
                        </div>

                        {isLoading ? (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                                {[0, 1, 2, 3].map((item) => (
                                    <div key={item} className="h-75 animate-pulse rounded-[1.75rem] border border-white/8 bg-black/20" />
                                ))}
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/15 p-8 text-center text-sm text-slate-400">
                                No rooms match this filter yet. Create the first one or switch the category.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {filteredRooms.map((room) => (
                                    <article key={room._id} className="group overflow-hidden rounded-[1.75rem] border border-white/8 bg-black/20 transition hover:-translate-y-1 hover:border-primary/30">
                                        <div className="relative h-44 overflow-hidden">
                                            <img alt={room.roomName} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={room.bannerImage || room.coverImage || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop"} />
                                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                                            <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white backdrop-blur-md">
                                                {room.isLive ? "Live now" : "Listening"}
                                            </div>
                                            {room.host?._id === myId && (
                                                <button className="absolute right-4 top-4 rounded-full bg-red-500/20 p-1.5 text-red-400 backdrop-blur-md transition hover:bg-red-500/40 hover:text-red-300" type="button" onClick={(e) => { e.stopPropagation(); handleDelete(room._id); }} title="Delete room">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary/80">{room.category}</p>
                                                    <h3 className="truncate text-xl font-black tracking-tight">{room.roomName}</h3>
                                                </div>
                                                <div className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                                                    {room.participantCount} listening
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4">
                                            <p className="line-clamp-2 text-sm leading-6 text-slate-400">{room.description || "No description yet. Jump in and set the vibe."}</p>

                                            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-full bg-black/30">
                                                    <img alt="host" className="h-full w-full object-cover" src={room.host?.avatar || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop"} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Hosted by</p>
                                                    <p className="truncate text-sm font-semibold text-white">{room.host?.fullName || room.host?.username || "Community host"}</p>
                                                </div>
                                                <div className="text-right text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                                                    <div>{room.queueCount} queued</div>
                                                    <div>{room.recentMessageCount} messages</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                {joinedRooms.has(room._id) ? (
                                                    <button className="flex-1 rounded-full border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/20" type="button" onClick={() => handleEnter(room._id)}>
                                                        Enter room
                                                    </button>
                                                ) : (
                                                    <button className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01]" type="button" onClick={() => void handleJoin(room._id)}>
                                                        Join room
                                                    </button>
                                                )}
                                                <button className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-primary/40 hover:text-white" type="button" onClick={() => navigate(`/rooms/live?roomId=${room._id}`)}>
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-4 rounded-4xl border border-white/8 bg-white/5 p-5 backdrop-blur-xl md:p-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary/80">Room state</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight">Playback, queue, reactions, and chat all in one place.</h2>
                        </div>

                        <div className="space-y-3 text-sm leading-6 text-slate-400">
                            <p>Rooms now use the backend as the source of truth, so the live session is no longer a static mockup.</p>
                            <p>Hosts can create the room, participants can join and leave, and the socket layer is ready for room-scoped chat and playback sync.</p>
                            <p>The next step is to connect queue selection from the library and artist playlists directly into the room flow.</p>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
