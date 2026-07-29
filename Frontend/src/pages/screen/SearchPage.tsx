import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Music2, LoaderCircle, Play, Download, CheckCircle2 } from "lucide-react";
import { songService, type SongItem } from "../../api/song.service";
import { playlistService, type FeaturedPlaylistItem } from "../../api/playlist.service";
import { usePlayer } from "../../context/PlayerContext";

const chips = ["All", "Songs", "Artists", "Mood"];

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
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryParam = searchParams.get("category");
    const artistParam = searchParams.get("artist");
    const queryParam = searchParams.get("q");

    const activeChip = (() => {
        if (!categoryParam) {
            if (artistParam) return "Artists";
            return "All";
        }
        const lower = categoryParam.toLowerCase();
        if (lower === "songs") return "Songs";
        if (lower === "artists" || lower === "artist") return "Artists";
        if (lower === "mood") return "Mood";
        return "All";
    })();

    const [trendingSongs, setTrendingSongs] = useState<SongItem[]>([]);
    const [featuredPlaylists, setFeaturedPlaylists] = useState<FeaturedPlaylistItem[]>([]);
    const [isFeaturedPlaylistsLoading, setIsFeaturedPlaylistsLoading] = useState(true);

    const { playSong, downloadSong, isSongDownloaded, downloadingIds } = usePlayer();
    const [query, setQuery] = useState(queryParam || artistParam || "");
    const [searchResults, setSearchResults] = useState<SongItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const [recentSearches, setRecentSearches] = useState<string[]>(initialRecentSearches);
    const [selectedGenre, setSelectedGenre] = useState<string>("All");

    const allExtractedGenres = Array.from(
        new Set(
            [...trendingSongs, ...searchResults].flatMap((song) => {
                if (!song.genre) return [];
                if (Array.isArray(song.genre)) return song.genre;
                if (typeof song.genre === "string") return (song.genre as string).split(",").map(g => g.trim());
                return [];
            }).filter(Boolean)
        )
    );

    const defaultGenres = ["Pop", "Hip-hop", "Lo-fi", "Synthwave", "Electronic", "Chill", "Rock"];
    const availableGenres = Array.from(new Set([...allExtractedGenres, ...defaultGenres]));

    const getSongsForGenre = (genreName: string) => {
        const target = genreName.toLowerCase();
        const matched = [...trendingSongs, ...searchResults].filter((song) => {
            if (!song.genre) return false;
            const genres = Array.isArray(song.genre)
                ? song.genre
                : typeof song.genre === "string"
                ? (song.genre as string).split(",").map(g => g.trim())
                : [];
            return genres.some(g => g.toLowerCase().includes(target) || target.includes(g.toLowerCase()));
        });
        return matched.length > 0 ? matched : trendingSongs.slice(0, 4);
    };

    const getGenreGradient = (genreName: string) => {
        const lower = genreName.toLowerCase();
        if (lower.includes("pop")) return "bg-gradient-to-r from-pink-950/70 via-purple-950/60 to-slate-900 border-pink-500/20";
        if (lower.includes("hip") || lower.includes("rap")) return "bg-gradient-to-r from-amber-950/70 via-orange-950/60 to-slate-900 border-amber-500/20";
        if (lower.includes("lo-fi") || lower.includes("chill") || lower.includes("acoustic")) return "bg-gradient-to-r from-teal-950/70 via-emerald-950/60 to-slate-900 border-teal-500/20";
        if (lower.includes("synth") || lower.includes("electro") || lower.includes("techno")) return "bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900 border-blue-500/20";
        if (lower.includes("rock") || lower.includes("indie")) return "bg-gradient-to-r from-red-950/70 via-rose-950/60 to-slate-900 border-red-500/20";
        return "bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-950 border-cyan-500/20";
    };

    useEffect(() => {
        const initialQ = queryParam || artistParam || "";
        setQuery(initialQ);
    }, [queryParam, artistParam]);

    const handleChipClick = (chip: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("category", chip.toLowerCase());
        if (chip !== "Artists") {
            newParams.delete("artist");
        }
        setSearchParams(newParams);
    };

    const handleArtistClick = (artistName: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("category", "artists");
        newParams.set("artist", artistName.toLowerCase());
        newParams.set("q", artistName);
        setSearchParams(newParams);
        setQuery(artistName);
    };

    const handleQueryChange = (val: string) => {
        setQuery(val);
        const newParams = new URLSearchParams(searchParams);
        if (val.trim()) {
            newParams.set("q", val);
        } else {
            newParams.delete("q");
            newParams.delete("artist");
        }
        setSearchParams(newParams, { replace: true });
    };

    const DEFAULT_ARTISTS = [
        {
            name: "nabinagrawal",
            avatar: "/images/earth_lens_studio.png",
            verified: true,
            songCount: 2,
        },
        {
            name: "darshan",
            avatar: "/images/darshan.png",
            verified: true,
            songCount: 2,
        },
    ];

    const fetchedArtistCards = Array.from(
        new Map(
            [...trendingSongs, ...searchResults].flatMap((song) => {
                const artistName = song.artist?.name || song.artist?.username || song.artistName?.trim();
                if (!artistName) {
                    return [];
                }

                return [[artistName.toLowerCase(), {
                    name: artistName,
                    avatar: song.artist?.avatar || song.coverImage || "/images/earth_lens_studio.png",
                    verified: song.artist?.verified ?? false,
                    songCount: 1,
                }]] as const;
            })
                .reduce((acc, [key, artist]) => {
                    const existing = acc.get(key);
                    if (existing) {
                        existing.songCount += 1;
                        if (!existing.avatar && artist.avatar) {
                            existing.avatar = artist.avatar;
                        }
                        existing.verified = existing.verified || artist.verified;
                        return acc;
                    }

                    acc.set(key, { ...artist });
                    return acc;
                }, new Map<string, { name: string; avatar: string; verified: boolean; songCount: number }>())
        ).values()
    ).sort((left, right) => right.songCount - left.songCount);

    const artistCards = [...fetchedArtistCards];
    DEFAULT_ARTISTS.forEach((def) => {
        if (!artistCards.some((a) => a.name.toLowerCase() === def.name.toLowerCase())) {
            artistCards.push(def);
        }
    });

    const startVoiceSearch = () => {
        const win = window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any };
        const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (!SpeechRecognitionClass) {
            window.alert("Voice search is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionClass();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results || [])
                .map((result: any) => result[0]?.transcript ?? "")
                .join("")
                .trim();

            if (transcript) {
                setQuery(transcript);
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

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
                                onChange={(e) => handleQueryChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Artists, songs, podcasts, or live rooms..."
                            />
                            {query.length > 0 && (
                                <button
                                    onClick={() => handleQueryChange("")}
                                    className="absolute right-12 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:text-on-surface hover:bg-white/5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        close
                                    </span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={startVoiceSearch}
                                aria-label={isListening ? "Listening for voice search" : "Search by voice"}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full transition-colors ${isListening ? "bg-primary text-on-primary animate-pulse" : "bg-surface-container text-primary hover:bg-primary/15"}`}
                            >
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
                                        className="flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-surface-container-low hover:bg-surface-container-high cursor-pointer transition-all group"
                                    >
                                        <div 
                                            className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 shrink-0 relative"
                                            onClick={() => {
                                                playSong({ _id: song._id, title: song.title, audioUrl: song.audioUrl ?? '', coverImage: song.coverImage, artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist', duration: song.duration });
                                                addRecentSearch(query);
                                            }}
                                        >
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
                                        <div 
                                            className="flex-1 min-w-0"
                                            onClick={() => {
                                                playSong({ _id: song._id, title: song.title, audioUrl: song.audioUrl ?? '', coverImage: song.coverImage, artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist', duration: song.duration });
                                                addRecentSearch(query);
                                            }}
                                        >
                                            <p className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">{song.title}</p>
                                            <p className="text-xs text-slate-400 truncate">{song.artistName || song.artist?.name || song.artist?.username || 'Artist'}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isSongDownloaded(song._id)) {
                                                    downloadSong({
                                                        _id: song._id,
                                                        title: song.title,
                                                        audioUrl: song.audioUrl ?? '',
                                                        coverImage: song.coverImage,
                                                        artistName: song.artistName || song.artist?.name || 'Artist',
                                                        duration: song.duration
                                                    });
                                                }
                                            }}
                                            disabled={downloadingIds.includes(song._id)}
                                            className={`p-2 rounded-xl transition-all ${
                                                isSongDownloaded(song._id) 
                                                    ? "text-secondary bg-secondary/10" 
                                                    : "text-slate-400 hover:text-primary hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                            } ${downloadingIds.includes(song._id) ? "animate-pulse opacity-100" : ""}`}
                                        >
                                            {isSongDownloaded(song._id) ? (
                                                <CheckCircle2 size={18} />
                                            ) : (
                                                <Download size={18} />
                                            )}
                                        </button>
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
                                        onClick={() => handleChipClick(chip)}
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {activeChip === "Songs" ? (
                            <div className="space-y-6 w-full">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl font-bold font-headline tracking-tight text-white">
                                        Trending & Popular Songs
                                    </h2>
                                    <span className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold">
                                        {trendingSongs.length} SONGS
                                    </span>
                                </div>

                                {trendingSongs.length === 0 ? (
                                    <div className="glass-panel rounded-3xl p-8 text-slate-500 text-sm text-center">
                                        Loading songs...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 w-full">
                                        {trendingSongs.map((song, idx) => (
                                            <div
                                                key={song._id}
                                                className="w-full flex items-center gap-4 rounded-2xl bg-[#0e131b] hover:bg-[#141b27] border border-white/5 p-3 sm:p-4 transition-all duration-300 group cursor-pointer"
                                                onClick={() => {
                                                    playSong({
                                                        _id: song._id,
                                                        title: song.title,
                                                        audioUrl: song.audioUrl ?? '',
                                                        coverImage: song.coverImage,
                                                        artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist',
                                                        duration: song.duration
                                                    });
                                                }}
                                            >
                                                <span className="text-primary text-sm font-black w-6 shrink-0 text-center">
                                                    {(idx + 1).toString().padStart(2, '0')}
                                                </span>

                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container relative shadow-md">
                                                    <img
                                                        src={song.coverImage || "/images/earth_lens_studio.png"}
                                                        alt={song.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play className="w-5 h-5 text-white fill-current" />
                                                    </div>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-base text-white truncate group-hover:text-primary transition-colors">
                                                        {song.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                                                        {song.artistName || song.artist?.name || song.artist?.username || 'Artist'} • {(song.plays || 0).toLocaleString()} plays
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isSongDownloaded(song._id)) {
                                                            downloadSong({
                                                                _id: song._id,
                                                                title: song.title,
                                                                audioUrl: song.audioUrl ?? '',
                                                                coverImage: song.coverImage,
                                                                artistName: song.artistName || song.artist?.name || 'Artist',
                                                                duration: song.duration
                                                            });
                                                        }
                                                    }}
                                                    disabled={downloadingIds.includes(song._id)}
                                                    className={`p-2.5 rounded-xl transition-all ${
                                                        isSongDownloaded(song._id) 
                                                            ? "text-secondary bg-secondary/10" 
                                                            : "text-slate-400 hover:text-primary hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                                    } ${downloadingIds.includes(song._id) ? "animate-pulse opacity-100" : ""}`}
                                                >
                                                    {isSongDownloaded(song._id) ? (
                                                        <CheckCircle2 size={20} />
                                                    ) : (
                                                        <Download size={20} />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : activeChip === "Artists" ? (
                            <div className="space-y-8 w-full">
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-xl font-bold font-headline tracking-tight text-white">
                                            Top Artists
                                        </h2>
                                        <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#1ad19a]">
                                            ARTIST MATCHES
                                        </span>
                                    </div>

                                    {artistCards.length === 0 ? (
                                        <div className="glass-panel rounded-3xl p-6 text-slate-500 text-sm">
                                            No artist matches yet. Play or search for songs to discover artists here.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                                            {artistCards.map((artist) => (
                                                <button
                                                    key={artist.name.toLowerCase()}
                                                    type="button"
                                                    onClick={() => handleArtistClick(artist.name)}
                                                    className="bg-[#0e131b] border border-white/5 rounded-3xl p-4 flex flex-col group cursor-pointer transition-all duration-300 hover:bg-[#141b27] hover:border-[#1ad19a]/30 hover:shadow-2xl hover:shadow-emerald-950/30 transform hover:-translate-y-1 text-left w-full"
                                                >
                                                    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-slate-900/80 mb-3.5 shadow-md">
                                                        <img
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            src={artist.avatar || "/images/earth_lens_studio.png"}
                                                            alt={artist.name}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex items-end justify-between px-1 min-w-0 w-full">
                                                        <div className="min-w-0 flex-1 pr-2">
                                                            <p className="truncate text-base font-bold text-white tracking-tight group-hover:text-[#1ad19a] transition-colors capitalize">{artist.name}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                                                                {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-xl font-bold font-headline tracking-tight text-white">
                                            Top Artist Playlists
                                        </h2>
                                        <span className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold">
                                            Top 3
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                        {isFeaturedPlaylistsLoading ? (
                                            <div className="glass-panel rounded-3xl p-6 text-slate-500 text-sm col-span-full">
                                                Loading top artist playlists...
                                            </div>
                                        ) : featuredPlaylists.length === 0 ? (
                                            <div className="glass-panel rounded-3xl p-6 text-slate-500 text-sm col-span-full">
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
                                                    className="glass-panel flex h-full w-full flex-col overflow-hidden rounded-3xl p-4 text-left group cursor-pointer transition-all duration-300 hover:bg-surface-container-high"
                                                >
                                                    <div className="relative aspect-[4/5] w-full shrink-0 rounded-2xl overflow-hidden mb-4 bg-surface-container">
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
                        ) : activeChip === "Mood" ? (
                            <div className="space-y-10 w-full">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold font-headline tracking-tight text-white">
                                            Genres & Mood Mixes
                                        </h2>
                                        <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-primary">
                                            {availableGenres.length} GENRES
                                        </span>
                                    </div>

                                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedGenre("All")}
                                            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                                                selectedGenre === "All"
                                                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                                    : "bg-surface-container-high text-slate-400 hover:text-white hover:bg-white/10"
                                            }`}
                                        >
                                            All Genres
                                        </button>
                                        {availableGenres.map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setSelectedGenre(g)}
                                                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                                                    selectedGenre.toLowerCase() === g.toLowerCase()
                                                        ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                                        : "bg-surface-container-high text-slate-400 hover:text-white hover:bg-white/10"
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(selectedGenre === "All" ? availableGenres : [selectedGenre]).map((genre) => {
                                    const genreSongs = getSongsForGenre(genre);
                                    const cardBg = getGenreGradient(genre);

                                    return (
                                        <div key={genre} className="space-y-4">
                                            <div className={`rounded-3xl p-6 ${cardBg} border shadow-xl relative overflow-hidden`}>
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div>
                                                        <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary">
                                                            GENRE CATEGORY
                                                        </span>
                                                        <h3 className="text-2xl font-black font-headline text-white mt-1">
                                                            {genre}
                                                        </h3>
                                                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                                                            {genreSongs.length} tracks curated in this vibe
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedGenre(genre === selectedGenre ? "All" : genre)}
                                                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-colors"
                                                    >
                                                        {selectedGenre === genre ? "Show All" : "Focus"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                                {genreSongs.map((song, idx) => (
                                                    <div
                                                        key={`${genre}-${song._id}`}
                                                        className="w-full flex items-center gap-4 rounded-2xl bg-[#0e131b] hover:bg-[#141b27] border border-white/5 p-3.5 transition-all duration-300 group cursor-pointer"
                                                        onClick={() => {
                                                            playSong({
                                                                _id: song._id,
                                                                title: song.title,
                                                                audioUrl: song.audioUrl ?? '',
                                                                coverImage: song.coverImage,
                                                                artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist',
                                                                duration: song.duration
                                                            });
                                                        }}
                                                    >
                                                        <span className="text-primary text-xs font-black w-5 shrink-0 text-center">
                                                            {(idx + 1).toString().padStart(2, '0')}
                                                        </span>

                                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container relative shadow-md">
                                                            <img
                                                                src={song.coverImage || "/images/earth_lens_studio.png"}
                                                                alt={song.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Play className="w-4 h-4 text-white fill-current" />
                                                            </div>
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
                                                                {song.title}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                                                                {song.artistName || song.artist?.name || song.artist?.username || 'Artist'}
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isSongDownloaded(song._id)) {
                                                                    downloadSong({
                                                                        _id: song._id,
                                                                        title: song.title,
                                                                        audioUrl: song.audioUrl ?? '',
                                                                        coverImage: song.coverImage,
                                                                        artistName: song.artistName || song.artist?.name || 'Artist',
                                                                        duration: song.duration
                                                                    });
                                                                }
                                                            }}
                                                            disabled={downloadingIds.includes(song._id)}
                                                            className={`p-2 rounded-xl transition-all ${
                                                                isSongDownloaded(song._id) 
                                                                    ? "text-secondary bg-secondary/10" 
                                                                    : "text-slate-400 hover:text-primary hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                                            } ${downloadingIds.includes(song._id) ? "animate-pulse opacity-100" : ""}`}
                                                        >
                                                            {isSongDownloaded(song._id) ? (
                                                                <CheckCircle2 size={18} />
                                                            ) : (
                                                                <Download size={18} />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <section className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 xl:gap-10">
                                <div className="space-y-4 lg:space-y-8">
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
                                            ) : trendingSongs.slice(0, 3).map((song, idx) => (
                                                <button
                                                    key={song._id}
                                                    onClick={() => {
                                                        playSong({
                                                            _id: song._id,
                                                            title: song.title,
                                                            audioUrl: song.audioUrl ?? '',
                                                            coverImage: song.coverImage,
                                                            artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist',
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
                                                            {song.artistName || song.artist?.name || song.artist?.username || 'Artist'} • {(song.plays || 0).toLocaleString()} plays
                                                        </p>
                                                    </div>
                                                    <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" fill="currentColor" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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
                                                            handleQueryChange(tag);
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

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-xl font-bold font-headline tracking-tight text-white">
                                                Top Artists
                                            </h2>
                                            <span className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#1ad19a]">
                                                Artist matches
                                            </span>
                                        </div>

                                        {artistCards.length === 0 ? (
                                            <div className="glass-panel rounded-3xl p-6 text-slate-500 text-sm">
                                                No artist matches yet. Play or search for songs to discover artists here.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                                                {artistCards.map((artist) => (
                                                    <button
                                                        key={artist.name.toLowerCase()}
                                                        type="button"
                                                        onClick={() => handleArtistClick(artist.name)}
                                                        className="bg-[#0e131b] border border-white/5 rounded-3xl p-4 flex flex-col group cursor-pointer transition-all duration-300 hover:bg-[#141b27] hover:border-[#1ad19a]/30 hover:shadow-2xl hover:shadow-emerald-950/30 transform hover:-translate-y-1 text-left w-full"
                                                    >
                                                        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-slate-900/80 mb-3.5 shadow-md">
                                                            <img
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                src={artist.avatar || "/images/earth_lens_studio.png"}
                                                                alt={artist.name}
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "/images/earth_lens_studio.png";
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="flex items-end justify-between px-1 min-w-0 w-full">
                                                            <div className="min-w-0 flex-1 pr-2">
                                                                <p className="truncate text-base font-bold text-white tracking-tight group-hover:text-[#1ad19a] transition-colors">{artist.name}</p>
                                                                <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                                                                    {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
                                                                </p>
                                                            </div>
                                                            <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em] text-[#1ad19a] pb-0.5 ml-2">
                                                                ARTIST
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-xl font-bold font-headline tracking-tight text-white">
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
                                                        className="glass-panel flex h-full w-full flex-col overflow-hidden rounded-3xl p-4 text-left group cursor-pointer transition-all duration-300 hover:bg-surface-container-high"
                                                    >
                                                        <div className="relative aspect-[4/5] w-full shrink-0 rounded-2xl overflow-hidden mb-4 bg-surface-container">
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
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
