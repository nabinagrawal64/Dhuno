import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Music2 } from "lucide-react";
import { authService, type UserProfile } from "../../api/auth.service";
import { songService, type SongItem } from "../../api/song.service";
import { roomService, type RoomPreview } from "../../api/room.service";
import { usePlayer } from "../../context/PlayerContext";

export type ArtistCardItem = {
    id?: string;
    name: string;
    avatar: string;
    songCount: number;
    verified?: boolean;
};

const DEFAULT_ARTISTS: ArtistCardItem[] = [
    {
        id: "nabinagrawal",
        name: "nabinagrawal",
        avatar: "/images/earth_lens_studio.png",
        songCount: 2,
        verified: true,
    },
    {
        id: "darshan",
        name: "darshan",
        avatar: "/images/darshan.png",
        songCount: 2,
        verified: true,
    },
];

export default function HomePage() {
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, togglePlay, recentSongs, likedSongs, toggleLikeCurrentSong } = usePlayer();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [trendingSongs, setTrendingSongs] = useState<SongItem[]>([]);
    const [loadingSongs, setLoadingSongs] = useState(true);
    const [rooms, setRooms] = useState<RoomPreview[]>([]);

    const featuredTrack = currentSong || recentSongs[0] || trendingSongs[0] || null;
    const featuredTitle = featuredTrack?.title || "Featured Dhuno Music";
    const featuredArtist = featuredTrack?.artistName || (featuredTrack as any)?.artist?.name || (featuredTrack as any)?.artist?.username || "Top Artists";
    const featuredCover = featuredTrack?.coverImage || "/images/earth_lens_studio.png";
    const isFeaturedPlaying = Boolean(currentSong && featuredTrack && currentSong._id === featuredTrack._id && isPlaying);
    const isFeaturedLiked = Boolean(featuredTrack && likedSongs.some(s => s._id === featuredTrack._id));

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const profileRes = await authService.getMe();
                if (isMounted) {
                    setProfile(profileRes.user);
                }
            } catch {
                if (isMounted) {
                    setProfile(null);
                }
            } finally {
                if (isMounted) {
                    setLoadingProfile(false);
                }
            }

            try {
                const songsRes = await songService.getTrendingSongs();
                if (isMounted && songsRes.success) {
                    setTrendingSongs(songsRes.songs);
                }
            } catch (err) {
                console.error("Failed to load trending songs for HomePage:", err);
            } finally {
                if (isMounted) {
                    setLoadingSongs(false);
                }
            }

            try {
                const roomsRes = await roomService.getRooms();
                if (isMounted && roomsRes.success) {
                    setRooms(roomsRes.rooms || []);
                }
            } catch (err) {
                console.error("Failed to load active rooms for HomePage:", err);
            }
        };

        void loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Extract dynamic artist cards from trending songs
    const fetchedArtistCards = Array.from(
        new Map(
            trendingSongs.flatMap((song) => {
                const name = song.artist?.name || song.artist?.username || song.artistName?.trim();
                if (!name) return [];
                return [[name.toLowerCase(), {
                    id: song.artist?._id || name,
                    name,
                    avatar: song.artist?.avatar || song.coverImage || "/images/earth_lens_studio.png",
                    songCount: 1,
                    verified: song.artist?.verified ?? true,
                }]] as const;
            }).reduce((acc, [key, artist]) => {
                const existing = acc.get(key);
                if (existing) {
                    existing.songCount += 1;
                    if (!existing.avatar && artist.avatar) {
                        existing.avatar = artist.avatar;
                    }
                    return acc;
                }
                acc.set(key, { ...artist });
                return acc;
            }, new Map<string, { id: string; name: string; avatar: string; songCount: number; verified: boolean }>())
        ).values()
    );

    // Merge fetched artists with screenshot defaults
    const displayArtists: ArtistCardItem[] = [...fetchedArtistCards];
    DEFAULT_ARTISTS.forEach((def) => {
        if (!displayArtists.some((a) => a.name.toLowerCase() === def.name.toLowerCase())) {
            displayArtists.push(def);
        }
    });

    const getSongsForGenre = (genreName: string) => {
        const target = genreName.toLowerCase();
        const matched = trendingSongs.filter((song) => {
            if (!song.genre) return false;
            const genres = Array.isArray(song.genre)
                ? song.genre
                : typeof song.genre === "string"
                ? (song.genre as string).split(",").map(g => g.trim())
                : [];
            return genres.some(g => g.toLowerCase().includes(target) || target.includes(g.toLowerCase()));
        });
        return matched.length > 0 ? matched : trendingSongs.slice(0, 3);
    };

    const moodGenres = [
        { name: "Pop", subtitle: "Pop & Dance Hits", gradient: "from-pink-950/80 via-purple-950/60 to-slate-900", border: "border-pink-500/20", color: "#ec4899" },
        { name: "Hip-hop", subtitle: "Hip-Hop & Urban Rhythms", gradient: "from-amber-950/80 via-orange-950/60 to-slate-900", border: "border-amber-500/20", color: "#f59e0b" },
        { name: "Lo-fi", subtitle: "Lo-Fi & Chill Beats", gradient: "from-teal-950/80 via-emerald-950/60 to-slate-900", border: "border-teal-500/20", color: "#14b8a6" },
        { name: "Synthwave", subtitle: "Synthwave & Electronic", gradient: "from-blue-950/80 via-indigo-950/60 to-slate-900", border: "border-blue-500/20", color: "#3b82f6" },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good morning";
        if (hour >= 12 && hour < 17) return "Good afternoon";
        if (hour >= 17 && hour < 22) return "Good evening";
        return "Good night";
    };

    const displayName = profile?.fullName?.trim() || profile?.username?.trim() || "Dhuno User";

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary/30 w-full min-h-screen">
            <style dangerouslySetInnerHTML={{
                __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }` }}
            />
            <div>
                {/* Main Content Canvas */}
                <main className="pt-6 md:pt-12 lg:pt-20 pb-44 px-4 md:px-6 lg:px-8 w-full max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 relative">
                        <div>
                            <div className="flex items-center justify-between lg:justify-start gap-3 lg:gap-0 mb-4 w-full">
                                <h1 className="lg:text-4xl sm:text-3xl text-2xl font-extrabold font-headline tracking-tighter" aria-live="polite">
                                    {getGreeting()}, {loadingProfile ? "..." : displayName}
                                </h1>
                                <a href="/notifications" className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors bg-surface-container-high rounded-full w-10 h-10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">notifications</span>
                                </a>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-5 py-1.5 rounded-full bg-surface-container-high text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-300">Calm</button>
                                <button className="px-5 py-1.5 rounded-full bg-surface-container-high text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-300">Energetic</button>
                                <button className="px-5 py-1.5 rounded-full bg-surface-container-high text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-300">Focus</button>
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/profile')}
                            className="lg:flex hidden items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase cursor-pointer group hover:opacity-90"
                        >
                            <span>View My Profile</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">person</span>
                        </div>
                    </div>

                    {/* Hero: Continue Listening / Featured Track (Real Data) */}
                    <section className="lg:mb-12 mb-8">
                        <div className="relative group overflow-hidden rounded-3xl h-auto md:h-80 bg-surface-container shadow-2xl flex flex-col lg:flex-row lg:items-center items-start border border-white/5">
                            {/* Dynamic Background Cover */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    alt={featuredTitle}
                                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                                    src={featuredCover}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                    }}
                                />
                                <div className="absolute inset-0 bg-linear-to-r from-surface via-surface/70 to-transparent" />
                            </div>

                            <div className="relative z-10 p-6 md:p-8 lg:pl-12 max-w-2xl">
                                <span className="text-primary font-extrabold text-xs uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                    {isFeaturedPlaying ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                            NOW PLAYING
                                        </>
                                    ) : currentSong ? (
                                        "CONTINUE LISTENING"
                                    ) : (
                                        "FEATURED TRACK"
                                    )}
                                </span>
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold font-headline tracking-tighter mb-2 leading-tight text-white truncate">
                                    {featuredTitle}
                                </h2>
                                <p className="text-slate-300 text-sm md:text-base lg:text-lg mb-8 max-w-md font-medium truncate">
                                    by {featuredArtist}
                                </p>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <button
                                        onClick={() => {
                                            if (!featuredTrack) return;
                                            if (currentSong?._id === featuredTrack._id) {
                                                togglePlay();
                                            } else {
                                                playSong({
                                                    _id: featuredTrack._id,
                                                    title: featuredTrack.title,
                                                    audioUrl: featuredTrack.audioUrl ?? '',
                                                    coverImage: featuredTrack.coverImage,
                                                    artistName: featuredArtist,
                                                    duration: featuredTrack.duration
                                                });
                                            }
                                        }}
                                        className="px-6 py-3 lg:px-8 lg:py-3.5 text-sm lg:text-base rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-xl lg:text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                                            {isFeaturedPlaying ? "pause" : "play_arrow"}
                                        </span>
                                        {isFeaturedPlaying ? "Pause Playback" : currentSong?._id === featuredTrack?._id ? "Resume Track" : "Play Featured Track"}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Add to favorites"
                                        onClick={() => {
                                            if (featuredTrack) {
                                                if (currentSong?._id === featuredTrack._id) {
                                                    toggleLikeCurrentSong();
                                                } else {
                                                    playSong({
                                                        _id: featuredTrack._id,
                                                        title: featuredTrack.title,
                                                        audioUrl: featuredTrack.audioUrl ?? '',
                                                        coverImage: featuredTrack.coverImage,
                                                        artistName: featuredArtist,
                                                        duration: featuredTrack.duration
                                                    });
                                                }
                                            }
                                        }}
                                        className={`h-11 w-11 lg:h-12 lg:w-12 shrink-0 rounded-full border border-white/10 grid place-items-center transition-all hover:scale-105 cursor-pointer ${
                                            isFeaturedLiked
                                                ? "bg-primary/20 text-primary border-primary/30"
                                                : "bg-surface-container-high text-slate-300 hover:bg-white/10 hover:text-white"
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isFeaturedLiked ? "fill-current text-primary" : ""}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Floating Real Cover Art Box */}
                            <div className="absolute right-12 bottom-0 top-0 hidden lg:flex items-center justify-center">
                                <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 border border-white/10 bg-slate-900">
                                    <img
                                        alt={featuredTitle}
                                        className="w-full h-full object-cover"
                                        src={featuredCover}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TOP ARTISTS SECTION (Matching attached card design) */}
                    <section className="lg:mb-12 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold font-headline tracking-tight text-white">
                                Top Artists
                            </h2>
                            <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#1ad19a]">
                                ARTIST MATCHES
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {displayArtists.map((artist) => (
                                <div
                                    key={artist.name}
                                    onClick={() => navigate(`/search?category=artists&artist=${encodeURIComponent(artist.name.toLowerCase())}&q=${encodeURIComponent(artist.name)}`)}
                                    className="bg-[#0e131b] border border-white/5 rounded-3xl p-4 flex flex-col group cursor-pointer transition-all duration-300 hover:bg-[#141b27] hover:border-[#1ad19a]/30 hover:shadow-2xl hover:shadow-emerald-950/30 transform hover:-translate-y-1"
                                >
                                    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-slate-900/80 mb-3.5 shadow-md">
                                        <img
                                            src={artist.avatar}
                                            alt={artist.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-end justify-between px-1 min-w-0">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <p className="font-bold text-base text-white tracking-tight truncate group-hover:text-[#1ad19a] transition-colors">
                                                {artist.name}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                                                {artist.songCount} {artist.songCount === 1 ? "song" : "songs"}
                                            </p>
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#1ad19a] pb-0.5 shrink-0">
                                            ARTIST
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Nearby Active Rooms - Only render if active rooms exist */}
                    {rooms.length > 0 && (
                        <section className="lg:mb-12 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold font-headline tracking-tight">Nearby Active Rooms</h3>
                                <button
                                    onClick={() => navigate("/rooms/discovery")}
                                    className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                                >
                                    See all local hubs
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {rooms.map((room) => (
                                    <div
                                        key={room._id}
                                        onClick={() => navigate(`/rooms/live?roomId=${room._id}`)}
                                        className="glass-panel p-6 rounded-3xl group cursor-pointer hover:bg-surface-container-high transition-all duration-300 flex flex-col justify-between h-56 border-l-4 border-primary"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined">sensors</span>
                                                </div>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/10 rounded">
                                                    {room.isLive ? "Live Session" : "Active"}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-bold font-headline tracking-tight group-hover:text-primary transition-colors truncate">
                                                {room.roomName}
                                            </h4>
                                            <p className="text-slate-400 text-sm mt-1 truncate">
                                                Hosted by: {room.host?.fullName || room.host?.username || "Host"}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                <span className="material-symbols-outlined text-sm">group</span>
                                                <span>{room.participantCount} listeners</span>
                                            </div>
                                            <button className="bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary hover:text-on-primary transition-all">
                                                Join Live
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recommended for You (Song Grid) */}
                    <section className="lg:mb-12 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold font-headline tracking-tight">Recommended for You</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {loadingSongs && trendingSongs.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-square rounded-2xl bg-surface-container-high mb-3" />
                                        <div className="h-4 bg-surface-container-high rounded w-3/4 mb-1" />
                                        <div className="h-3 bg-surface-container-high rounded w-1/2" />
                                    </div>
                                ))
                            ) : trendingSongs.length > 0 ? (
                                trendingSongs.slice(0, 5).map((song) => (
                                    <div
                                        key={song._id}
                                        onClick={() => playSong({
                                            _id: song._id,
                                            title: song.title,
                                            audioUrl: song.audioUrl ?? '',
                                            coverImage: song.coverImage,
                                            artistName: song.artistName || song.artist?.name || 'Artist',
                                            duration: song.duration
                                        })}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg bg-surface-container">
                                            {song.coverImage ? (
                                                <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                                                    <Music2 className="w-8 h-8" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{song.title}</h5>
                                        <p className="text-xs text-slate-500 truncate">{song.artistName || song.artist?.name || song.artist?.username || 'Artist'}</p>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {/* Default song placeholders */}
                                    <div className="group cursor-pointer">
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                            <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_8JRE5E1SJ3i1vvh4M-gZo2WAcKNQkJ5-47aGCTQ2tx4QurxI6hACplvnE9IbFmBI4UB_Wja10pxm6HJ92xljXuNI0oKd_Ss7rcbOxICW3OCfz03Q-3PUFEvQFKXQpt_Jkb0gxGXXFOtI4dOQnMYmd9qpr2x2-QA5q4vXShhc8YXJt45GlbgQu6JCxq0V5kZ0vu3JKn2CXEzhyd6cwQs2z2QzPrqTfib-qZCq4YrnATzooqJfO0tgroAN5qllWkXCd0d8P7cepDI" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="font-bold text-sm truncate">Crystal Visions</h5>
                                        <p className="text-xs text-slate-500 truncate">Lumina Ray</p>
                                    </div>

                                    <div className="group cursor-pointer">
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                            <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkJlkCra27ghHx-qpCIdufBR_dmwMMLype7Vo2wuDkSZIQxIR7n-REzqDz7p6IJ8R6JTsPwykQoguAk5zhyXNYrPV1tfxjBvkf4RF_e49YzeTiNuj8rYFPoe0SXM8dA_f1sr3j703jHwXDLZxaSCvJV4_gRsnHQgSOjw4R-PrUY8AOo13pIsv74iYK-TzHgM-eGUrUN5AGzLaQA9zYGmoLTH4WwL0VVjUsTeEcHFMgElQXe9OOR-Jg0h95Wu6bjIow9oFi6bKNWCM" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="font-bold text-sm truncate">Midnight Drift</h5>
                                        <p className="text-xs text-slate-500 truncate">Neon Ghost</p>
                                    </div>

                                    <div className="group cursor-pointer">
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                            <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPReeMfeVK3MfPb9qmbkkuf2zQ5MMSTHVVfHKDLRLaKxTja7IxNYzeD2XHZ45PQASddjE5S4pz-6dyg5vr_fLALzhDGxSurfM_rh77ApVH-pbofsyQh1oAGiylIs8zTnSXFGZO--RCqOzyUWt48zGZ53LJV5G9tmlCk7SmbxdH4SZ9ubkx5-OtwlkByp6_0KTbynoxk428XIOUnHm2gbyQd2vuC2UXGsICEr-PKiJ80LjKH009_YwbihGfWq1MtVqKbe5a7VPQJww" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="font-bold text-sm truncate">Pulse Frequency</h5>
                                        <p className="text-xs text-slate-500 truncate">Static Void</p>
                                    </div>

                                    <div className="group cursor-pointer">
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                            <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDKiYUPJuPzE_LkJ_y4XJM463SqNShrBpPwQ2ooDC5y1Fu9Wg836LDHzf3UrgU7oSSOE_H1QwEynAd6z6QZLMYmQjGspj-CVzzNU3ggCCEiJK9ojnlA4apd6GmnDzNcLQmxPzsM4vxGGHkNdGhXheDK4-AVUK_o50cOGMkNf9U1MEHwwbe6iV86_ABGAWjOsabDixK5Yo99FebxTFMkrNZ8mXvAxrQ_ZL1FSvvQYoldAC7gjMuwVojhpM9qt65Q2sar2oMDat6bMU" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="font-bold text-sm truncate">Chrome Horizon</h5>
                                        <p className="text-xs text-slate-500 truncate">Vector 77</p>
                                    </div>

                                    <div className="group cursor-pointer">
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
                                            <img alt="Track Art" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM43nP1fjOgE-WhYQcRWvTdYOPj-TDF8r6uxUllrySOag2qFuEn6UVQcgwuErqAzPZ-MA7LIbCVX6OUCNeZ1vayDNJUE3g-3r1LiALNojUPZxK2ZDmdbteXHd6xiTQz4eLfl-xjCCCxt79X1BYpD-nC8ySU5NPSbP8-1VXiOiHk65SrZoqUV9BO_NEnwH_OGaKtdrXKwfGwLfIpn9gFgTqJOpNIpVOPYzEEnIXsR8U2I85IBXRy8gdK-PvMGd-7S1fVL778iJmAKw" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="font-bold text-sm truncate">Liquid Ether</h5>
                                        <p className="text-xs text-slate-500 truncate">Orbit Flux</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Mood-based Mixes with 3-4 genres and their songs */}
                    <section className="lg:mb-12 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold font-headline tracking-tight text-white">Mood-based Mixes</h3>
                            <button
                                onClick={() => navigate("/search?category=mood")}
                                className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                            >
                                View all mixes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {moodGenres.map((item) => {
                                const songs = getSongsForGenre(item.name);

                                return (
                                    <div
                                        key={item.name}
                                        className={`rounded-3xl p-6 bg-gradient-to-r ${item.gradient} border ${item.border} shadow-xl flex flex-col justify-between space-y-4`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-2xl font-black font-headline tracking-tight text-white">{item.name} Mix</h4>
                                                <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: item.color }}>{item.subtitle}</p>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full text-slate-300">
                                                {songs.length} Tracks
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {songs.slice(0, 3).map((song, idx) => (
                                                <button
                                                    key={`${item.name}-${song._id}`}
                                                    onClick={() => playSong({
                                                        _id: song._id,
                                                        title: song.title,
                                                        audioUrl: song.audioUrl ?? '',
                                                        coverImage: song.coverImage,
                                                        artistName: song.artistName || song.artist?.name || 'Artist',
                                                        duration: song.duration
                                                    })}
                                                    className="w-full rounded-2xl bg-black/40 hover:bg-white/10 border border-white/5 px-3 py-2 flex items-center gap-3 text-left transition-all duration-300 group cursor-pointer"
                                                >
                                                    <span className="text-xs font-black w-5 shrink-0 text-center text-slate-400 group-hover:text-primary">
                                                        {(idx + 1).toString().padStart(2, '0')}
                                                    </span>
                                                    <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-surface-container relative">
                                                        <img src={song.coverImage || "/images/earth_lens_studio.png"} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-xs text-white truncate group-hover:text-primary transition-colors">
                                                            {song.title}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 truncate">
                                                            {song.artistName || song.artist?.name || 'Artist'}
                                                        </p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-lg text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                        play_circle
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

