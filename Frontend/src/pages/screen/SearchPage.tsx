import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Music2, LoaderCircle, Play } from "lucide-react";
import { songService, type SongItem } from "../../api/song.service";
import { playlistService, type FeaturedPlaylistItem } from "../../api/playlist.service";
import { usePlayer } from "../../context/PlayerContext";

const chips = ["All", "Songs", "Artists", "Rooms", "Clips", "Mood"];

const initialRecentSearches = (): string[] => {
    try {
        const item = localStorage.getItem("dhuno_recent_searches");
        return item ? JSON.parse(item) : ["Synthwave 1984", "After Hours"];
    } catch {
        return ["Synthwave 1984", "After Hours"];
    }
};

export default function SearchPage() {
    const navigate = useNavigate();
    const [activeChip, setActiveChip] = useState("All");
    const [playing, setPlaying] = useState(false);
    const [trendingSongs, setTrendingSongs] = useState<SongItem[]>([]);
    const [featuredPlaylists, setFeaturedPlaylists] = useState<FeaturedPlaylistItem[]>([]);
    const [isFeaturedPlaylistsLoading, setIsFeaturedPlaylistsLoading] = useState(true);

    const { playSong } = usePlayer();
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SongItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [recentSearches, setRecentSearches] = useState<string[]>(initialRecentSearches);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await songService.getTrendingSongs();
                if (response.success) {
                    setTrendingSongs(response.songs);
                }
            } catch (error) {
                console.error("Failed to fetch trending songs:", error);
            }
        };
        fetchTrends();
    }, []);

    useEffect(() => {
        const fetchFeaturedPlaylists = async () => {
            try {
                setIsFeaturedPlaylistsLoading(true);
                const response = await playlistService.getFeaturedPlaylists();
                if (response.success) {
                    setFeaturedPlaylists(response.playlists.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch featured playlists:", error);
            } finally {
                setIsFeaturedPlaylistsLoading(false);
            }
        };

        fetchFeaturedPlaylists();
    }, []);

    const addRecentSearch = (term: string) => {
        if (!term.trim()) return;
        setRecentSearches(prev => {
            const updated = [term.trim(), ...prev.filter(t => t !== term.trim())].slice(0, 10);
            localStorage.setItem("dhuno_recent_searches", JSON.stringify(updated));
            return updated;
        });
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("dhuno_recent_searches");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            addRecentSearch(query);
        }
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                setIsSearching(true);
                const res = await songService.searchSongs(query);
                setSearchResults(res.songs || []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary/30 w-full">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }`,
                }}
            />

            <main className="pt-6 md:pt-12 lg:pt-20 pb-44 px-4 md:px-6 lg:px-8 w-full">
                {/* search */}
                <section className="mb-5">
                    <div className="flex items-center gap-3 md:gap-4 w-full">
                        {/* serach and mic */}
                        <div className="relative flex-1 w-full group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                search
                            </span>
                            <input
                                className="w-full rounded-full bg-surface-container-high border border-white/5 py-3.5 pl-12 pr-24 text-sm sm:text-base text-on-surface placeholder:text-slate-500 outline-none transition-all focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Artists, songs, podcasts, or live rooms..."
                            />
                            {query.length > 0 && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:text-on-surface hover:bg-white/5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        close
                                    </span>
                                </button>
                            )}
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-surface-container text-primary hover:bg-primary/15 transition-colors">
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                >
                                    mic
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {query.trim().length > 0 ? (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold font-headline tracking-tight mb-5">Search Results</h2>
                        {isSearching ? (
                            <div className="flex justify-center p-12">
                                <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((song) => (
                                    <div
                                        key={song._id}
                                        onClick={() => {
                                            playSong({ _id: song._id, title: song.title, audioUrl: song.audioUrl ?? '', coverImage: song.coverImage, artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist', duration: song.duration });
                                            addRecentSearch(query);
                                        }}
                                        className="flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-surface-container-low hover:bg-surface-container-high cursor-pointer transition-all group"
                                    >
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 shrink-0 relative">
                                            {song.coverImage ? (
                                                <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                                                    <Music2 className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">{song.title}</p>
                                            <p className="text-xs text-slate-400 truncate">{song.artistName || song.artist?.name || song.artist?.username || 'Artist'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel rounded-3xl p-12 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-500 mb-4">search_off</span>
                                <p className="text-slate-400">No songs found for "{query}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* category list horizontally */}
                        <section className="mb-2.5 lg:mb-5">
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {chips.map((chip) => (
                                    <button
                                        key={chip}
                                        className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${activeChip === chip
                                                ? "bg-primary text-on-primary"
                                                : "bg-surface-container-high text-slate-400 hover:bg-primary/10 hover:text-on-surface"
                                            }`}
                                        onClick={() => setActiveChip(chip)}
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 xl:gap-10">
                            {/* treanding and recent searches */}
                            <div className="space-y-4 lg:space-y-8">
                                {/* Trending Now */}
                                <div className="glass-panel rounded-3xl p-5 md:p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-xl font-bold font-headline tracking-tight">
                                            Trending Now
                                        </h2>
                                        <span className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold">
                                            Songs
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {trendingSongs.length === 0 ? (
                                            <div className="text-slate-600 text-xs py-4 text-center">Loading trends...</div>
                                        ) : trendingSongs.map((song, idx) => (
                                            <button
                                                key={song._id}
                                                onClick={() => {
                                                    playSong({
                                                        _id: song._id,
                                                        title: song.title,
                                                        audioUrl: song.audioUrl ?? '',
                                                        coverImage: song.coverImage,
                                                        artistName: song.artistName || song.artist?.name || 'Artist',
                                                        duration: song.duration
                                                    });
                                                }}
                                                className="w-full rounded-2xl px-2 py-2 flex items-center gap-3 text-left hover:bg-white/5 transition-colors group"
                                            >
                                                <span className="text-primary text-xs font-black w-6 shrink-0 text-center">
                                                    {(idx + 1).toString().padStart(2, '0')}
                                                </span>
                                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                                                    <img src={song.coverImage || ""} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                                        {song.title}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                                        {song.artistName || 'Artist'} • {(song.plays || 0).toLocaleString()} plays
                                                    </p>
                                                </div>
                                                <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" fill="currentColor" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <div className="glass-panel rounded-3xl p-5 md:p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-xl font-bold font-headline tracking-tight">
                                                Recent Searches
                                            </h2>
                                            <button onClick={clearRecentSearches} className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold hover:opacity-80 transition-opacity">
                                                Clear
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {recentSearches.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => {
                                                        setQuery(tag);
                                                        addRecentSearch(tag);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base text-slate-500">
                                                        history
                                                    </span>
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* recommended */}
                            <div className="space-y-6">
                                {/* Featured Playlist */}
                                <div className="relative group overflow-hidden rounded-3xl min-h-[260px] bg-surface-container shadow-2xl">
                                    <img
                                        alt="Featured playlist"
                                        className="absolute inset-0 h-full w-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-700"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH8m5QmUBy3BW8n6StaZN56PN1U7FifNwBkXq3WMn_W1uVt7xCnFLxDdccrd7SSoX1TY6tyQFb64yyfGQX3hLK7iZVCD_00iSI9G0B9m9an0FdMz94NNz43vMHx7Wou0CD2kXkq80ZKWjKPuIfKns873BnjJd57Su-bYLxG5uMTi-KfV-aK-dARPteqBcZ6rSEpQBeCssOP0OO7BDSICKMwyY198N_6BMYtr6KjVP4I12pi0CyL8Suw0q_CsQ1COjph8Soyz5mGuA"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/65 to-transparent" />

                                    <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                                        <span className="text-primary font-bold text-[11px] uppercase tracking-[0.28em] mb-3">
                                            Featured Playlist
                                        </span>
                                        <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tighter mb-3">
                                            Neon Skyline Radiance
                                        </h2>
                                        <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed mb-6">
                                            A high-energy search pick blending cyberpop,
                                            synthwave, and midnight driving sessions.
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <button
                                                className="h-12 w-12 rounded-full bg-linear-to-tr from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 grid place-items-center hover:scale-105 transition-transform"
                                                onClick={() => setPlaying((value) => !value)}
                                            >
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                                >
                                                    {playing ? "pause" : "play_arrow"}
                                                </span>
                                            </button>
                                            <span className="text-sm text-slate-300 font-medium">
                                                Curated by Dhuno AI • 42 tracks
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommended for you */}
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-xl font-bold font-headline tracking-tight">
                                                Top Artist Playlists
                                        </h2>
                                        <span className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold">
                                                Top 3
                                        </span>
                                    </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
                                            {isFeaturedPlaylistsLoading ? (
                                                <div className="glass-panel rounded-3xl p-6 text-slate-500 text-sm sm:col-span-2 2xl:col-span-3">
                                                    Loading top artist playlists...
                                                </div>
                                            ) : featuredPlaylists.length === 0 ? (
                                                <div className="glass-panel rounded-3xl p-6 text-slate-500 text-sm sm:col-span-2 2xl:col-span-3">
                                                    No artist playlists found yet.
                                                </div>
                                            ) : featuredPlaylists.map((playlist) => {
                                                const coverImage = playlist.coverImage || playlist.songs[0]?.coverImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80";
                                                const ownerLabel = playlist.owner?.fullName || playlist.owner?.username || "Artist";

                                                return (
                                                    <button
                                                        key={playlist.id}
                                                        type="button"
                                                        onClick={() => navigate(`/library/playlist/${playlist.id}`)}
                                                        className="glass-panel rounded-3xl p-4 text-left group cursor-pointer hover:bg-surface-container-high transition-all duration-300 hover:-translate-y-1"
                                                    >
                                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                                                            <img
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                src={coverImage}
                                                                alt={playlist.title}
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full grid place-items-center bg-primary text-on-primary shadow-lg shadow-primary/30">
                                                                <Play className="w-4 h-4 fill-current" />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-sm truncate">
                                                                    {playlist.title}
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-1 truncate">
                                                                    {ownerLabel} • {playlist.totalTracks || playlist.songs.length} tracks
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-[0.22em] text-primary font-bold shrink-0">
                                                                #{playlist.rank}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
