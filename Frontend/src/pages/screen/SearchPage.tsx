import { useState, useEffect } from "react";
import { Heart, Music2, LoaderCircle } from "lucide-react";
import { songService, type SongItem } from "../../api/song.service";
import { usePlayer } from "../../context/PlayerContext";

const chips = ["All", "Songs", "Artists", "Rooms", "Clips", "Mood"];

const trends = [
    { num: "01", name: "Midnight Cyberpunk", count: "2.4M searches" },
    { num: "02", name: "Acoustic Neon Sessions", count: "1.8M searches" },
    { num: "03", name: "Lofi Rain Forest", count: "900K searches" },
    { num: "04", name: "Stellar Drift", count: "540K searches" },
];

const cards = [
    {
        id: 1,
        name: "Neural Beats",
        sub: "Artist • 1.2M Monthly",
        action: "favorite",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCojuL8R9RvQnoe9EvxM4oKMsls-yufR4JeYdn0t8v1oxJ9j1tjwwKQkF6mcT4QqHCFgXKunRnRYT85UhH3w5LBUEyIUQdiwLBLTTgz4O_hl7ifiaL8HnHe_MhHw4WJWowFSXu2XvrRtzun0Cvf3e7LFhM69Qnwq-Fvz3bgv5DbXkHHv3rOeV6FMZ-b1XJEa8c7-5_xhzM8Wkm6J3UvmPC-kXLPKiSS9Y12LjT9_gmU54NkkxAUFltzrmSdljgrintJfv4VX2L8mQM",
    },
    {
        id: 2,
        name: "The Void Session",
        sub: "Album • 2024",
        action: "add",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuABkp4cz_EBZNM_dRzjAbVTT12hVYG1saB8V02Lsgo0U7GHgPrbdb5_Fw7z4WO1DMNS4H0TMWZ9gv4qLcDaDLyFzfv6EoD3xE2q8kKtYIken201BQahK0Z1op0-Ueg_DXTeK0OqXrttmxHXVIu51B0xnUMamLYXBPDGt7d549fMfWRvf_Gvi7AgsnUtWQBCj8rjLjzvvHVFP-O5UUiYdbIfxTuHfvi79GTiSvptPIzIifPPLs4-T-qWo7c3NNrHEPjiVFp7p3FLFDQ",
    },
    {
        id: 3,
        name: "Mainstage Live",
        sub: "Room • 4.2K Listening",
        action: "play_arrow",
        isPrimary: true,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk79ZC5tMqqm97QiATOrMQKMgJrEGRF0wB75S5RrEq42RqpBKgx4LzEw9CMN-eNBy3QxwTlNG2sx0SE3BUHCa83M_mbgTa3KN8XtSrA-nQooyd4aV2GNxJwBTonoKBWzyXkJZL5ZlPDD8IJYYHfXs8KNFxH3lNFHXDknSkUWKhluziZQIS_1p45CFFBVZET7swPpdr-lXNa4YMvjXRDJZhgXjB7Ld7MtNTpv4Vy0MtxMS9-LspsQOGEubaT4aDexZ1Kb9-Ai0e7Os",
    },
    {
        id: 4,
        name: "Hardware Souls",
        sub: "Artist • Electronic",
        action: "more_horiz",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3GygGVcmbHjRNn71J-0Sl4hm2ttt2ptjOpN-MCzYq-lz0cXNHctpD10Pv2Vzs8sAgXLPYn1jdF1_QltujYLVC6sUtaAzOyOc4ftghcaazssnpJgwcBOHcyG8kTVEqX2fmi60hV4YLSLon8EtVEXooPROsdZrXagZ7NIQa6fpXMpzsbDFhV17xOuCBUFryXRWjhKjNLz1Y7mas0g6Dsz96az490P5ONHLxs-VGb9nTsexZITJlRBQrjEO-8",
    },
];

const initialRecentSearches = (): string[] => {
    try {
        const item = localStorage.getItem("dhuno_recent_searches");
        return item ? JSON.parse(item) : ["Synthwave 1984", "After Hours"];
    } catch {
        return ["Synthwave 1984", "After Hours"];
    }
};

export default function SearchPage() {
    const [activeChip, setActiveChip] = useState("All");
    const [playing, setPlaying] = useState(false);

    const { playSong } = usePlayer();
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SongItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const [recentSearches, setRecentSearches] = useState<string[]>(initialRecentSearches);

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
                                className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                                    activeChip === chip
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
                                    Live
                                </span>
                            </div>

                            <div className="space-y-2">
                                {trends.map((trend) => (
                                    <button
                                        key={trend.num}
                                        onClick={() => {
                                            setQuery(trend.name);
                                            addRecentSearch(trend.name);
                                        }}
                                        className="w-full rounded-2xl px-3 py-3 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-primary text-sm font-black w-8 shrink-0">
                                            {trend.num}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-sm truncate">
                                                {trend.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 truncate">
                                                {trend.count}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-500">
                                            trending_up
                                        </span>
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
                                    Recommended For You
                                </h2>
                                <span className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold">
                                    Swipe
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
                                {cards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="glass-panel rounded-3xl p-4 group cursor-pointer hover:bg-surface-container-high transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                                            <img
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                src={card.img}
                                                alt={card.name}
                                            />
                                            <button
                                                className={`absolute bottom-3 right-3 h-10 w-10 rounded-full grid place-items-center transition-all ${
                                                    card.isPrimary
                                                        ? "bg-primary text-on-primary shadow-lg shadow-primary/30"
                                                        : "bg-surface-container-high text-white"
                                                }`}
                                            >
                                                {card.action === "favorite" ? (
                                                    <Heart className="w-4 h-4" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-lg">
                                                        {card.isPrimary
                                                            ? "play_arrow"
                                                            : card.action}
                                                    </span>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm truncate">
                                                    {card.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 truncate">
                                                    {card.sub}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">
                                                north_east
                                            </span>
                                        </div>
                                    </div>
                                ))}
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
