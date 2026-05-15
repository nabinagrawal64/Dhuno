import { Music2, Play, ArrowLeft, MoreHorizontal, GripVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { useEffect, useState } from 'react';
import { playlistService, type FeaturedPlaylistItem } from '../../api/playlist.service';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1514525253361-bee8a48740d0?auto=format&fit=crop&w=800&q=80';

type PlaylistSong = {
    _id: string;
    title: string;
    artistName?: string;
    coverImage?: string;
    duration?: number;
    audioUrl?: string;
};

type OwnedPlaylistView = {
    id: string;
    name: string;
    songs: PlaylistSong[];
    updatedAt: string;
    coverImage?: string;
};

type PlaylistView = OwnedPlaylistView | FeaturedPlaylistItem;

function formatTime(sec?: number) {
    if (!sec || !isFinite(sec) || isNaN(sec)) return '--:--';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

interface SortableSongRowProps {
    song: PlaylistSong;
    idx: number;
    onPlay: () => void;
}

interface SongRowProps {
    song: PlaylistSong;
    idx: number;
    onPlay: () => void;
    dragHandle?: boolean;
    dragProps?: {
        attributes?: Record<string, unknown>;
        listeners?: Record<string, unknown>;
    };
    isDragging?: boolean;
}

function toPlayableSong(song: PlaylistSong) {
    return {
        _id: song._id,
        title: song.title,
        audioUrl: song.audioUrl ?? '',
        coverImage: song.coverImage ?? '',
        artistName: song.artistName || 'Unknown Artist',
        duration: song.duration ?? 0,
    };
}

function SongRow({ song, idx, onPlay, dragHandle = false, dragProps, isDragging = false }: SongRowProps) {
    return (
        <div
            className={`w-full flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-2xl hover:bg-white/5 transition-all text-left group ${isDragging ? 'bg-white/10 shadow-2xl ring-1 ring-primary/20' : ''}`}
        >
            {dragHandle ? (
                <button
                    {...(dragProps?.attributes ?? {})}
                    {...(dragProps?.listeners ?? {})}
                    className="p-2 text-slate-700 hover:text-primary cursor-grab active:cursor-grabbing shrink-0"
                >
                    <GripVertical size={18} />
                </button>
            ) : (
                <div className="w-8 shrink-0" />
            )}

            <button
                onClick={onPlay}
                className="flex-1 flex items-center gap-4 min-w-0"
            >
                <span className="hidden md:block w-8 text-sm font-medium text-slate-600 group-hover:text-primary transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                </span>

                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                        src={song.coverImage || DEFAULT_COVER}
                        alt={song.title}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-surface-container shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{song.title}</p>
                        <p className="text-xs text-slate-500 truncate">{song.artistName || 'Unknown Artist'}</p>
                    </div>
                </div>

                <div className="text-right shrink-0 pr-2">
                    <span className="text-xs font-medium text-slate-500">{formatTime(song.duration)}</span>
                </div>
            </button>
        </div>
    );
}

function SortableSongRow({ song, idx, onPlay }: SortableSongRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: song._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <SongRow
                song={song}
                idx={idx}
                onPlay={onPlay}
                dragHandle
                dragProps={{ attributes, listeners }}
                isDragging={isDragging}
            />
        </div>
    );
}

export default function PlaylistDetailsPage() {
    const { id } = useParams();
    const { playlists, playSong } = usePlayer();
    const navigate = useNavigate();
    const [localSongs, setLocalSongs] = useState<PlaylistSong[]>([]);
    const [remotePlaylist, setRemotePlaylist] = useState<FeaturedPlaylistItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const ownedPlaylist = playlists.find(p => p.id === id) as OwnedPlaylistView | undefined;
    const activePlaylist: PlaylistView | null = ownedPlaylist ?? remotePlaylist;
    const isEditable = Boolean(ownedPlaylist);

    useEffect(() => {
        let mounted = true;

        if (!id) {
            setIsLoading(false);
            return () => { mounted = false; };
        }

        if (ownedPlaylist) {
            setRemotePlaylist(null);
            setLocalSongs(ownedPlaylist.songs);
            setIsLoading(false);
            return () => { mounted = false; };
        }

        (async () => {
            try {
                setIsLoading(true);
                const response = await playlistService.getPlaylistById(id);
                if (!mounted) return;

                setRemotePlaylist(response.playlist);
                setLocalSongs(response.playlist?.songs ?? []);
            } catch (error) {
                console.error('Failed to load playlist:', error);
                if (mounted) {
                    setRemotePlaylist(null);
                    setLocalSongs([]);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [id, ownedPlaylist]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (isLoading) {
        return (
            <div className="bg-surface text-on-surface font-body min-h-screen w-full flex items-center justify-center">
                <div className="text-center text-slate-500">Loading playlist...</div>
            </div>
        );
    }

    if (!activePlaylist) {
        return (
            <div className="bg-surface text-on-surface font-body min-h-screen w-full flex items-center justify-center">
                <div className="text-center">
                    <Music2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Playlist not found</h1>
                    <button 
                        onClick={() => navigate('/library')}
                        className="mt-4 text-primary font-bold"
                    >
                        Go back to Library
                    </button>
                </div>
            </div>
        );
    }

    const playlistName = ownedPlaylist?.name || remotePlaylist?.title || 'Playlist';
    const ownerLabel = remotePlaylist?.owner?.fullName || remotePlaylist?.owner?.username || 'Artist';
    const coverImage = activePlaylist.coverImage || localSongs[0]?.coverImage || DEFAULT_COVER;
    const updatedAt = ownedPlaylist?.updatedAt || remotePlaylist?.updatedAt || new Date().toISOString();

    async function handleDragEnd(event: DragEndEvent) {
        if (!isEditable || !ownedPlaylist) return;

        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = localSongs.findIndex((s) => s._id === active.id);
            const newIndex = localSongs.findIndex((s) => s._id === over.id);

            const newSongs = arrayMove(localSongs, oldIndex, newIndex);
            setLocalSongs(newSongs);

            try {
                await playlistService.reorderPlaylist(ownedPlaylist.id, newSongs.map(s => s._id));
            } catch (error) {
                console.error('Failed to sync new order:', error);
            }
        }
    }

    return (
        <div className="bg-surface text-on-surface font-body min-h-screen w-full">
            <div className="relative h-[30vh] md:h-[35vh] overflow-hidden flex items-end">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={coverImage} 
                        alt="" 
                        className="w-full h-full object-cover scale-110 blur-xl opacity-20"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/60 to-surface/20" />
                </div>
                
                <div className="relative z-10 w-full pt-20 pb-6 px-4 md:px-6 lg:px-8">
                    <button 
                        type="button"
                        onClick={() => navigate('/library')}
                        className="absolute top-6 left-4 md:left-6 lg:left-8 p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-6 md:gap-8">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-surface-container">
                            {coverImage ? (
                                <img src={coverImage} alt={playlistName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/30 to-secondary/30">
                                    <Music2 className="w-12 h-12 text-white/20" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block">
                                Playlist
                            </span>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-headline tracking-tighter mb-3 leading-tight truncate">
                                {playlistName}
                            </h1>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <span className="text-on-surface">{localSongs.length} tracks</span>
                                <span className="opacity-30">•</span>
                                <span>Updated {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(updatedAt))}</span>
                                {!isEditable && (
                                    <>
                                        <span className="opacity-30">•</span>
                                        <span>By {ownerLabel}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-6 lg:px-8 py-5 flex items-center gap-4 md:gap-6">
                <button 
                    onClick={() => localSongs.length > 0 && playSong(toPlayableSong(localSongs[0]))}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform shrink-0"
                >
                    <Play fill="currentColor" className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button className="p-2 md:p-2.5 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 transition-colors shrink-0">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="px-4 md:px-6 lg:px-8 pb-44">
                <div className="hidden md:grid grid-cols-[3rem_3rem_1fr_auto] gap-4 px-4 py-3 border-b border-white/5 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    <span className="w-8"></span>
                    <span className="w-8">#</span>
                    <span>Title / Artist</span>
                    <span className="text-right pr-2">Duration</span>
                </div>

                <div className="space-y-1">
                    {localSongs.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-500">
                            This playlist is empty.
                        </div>
                    ) : isEditable ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localSongs.map(s => s._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {localSongs.map((song, idx) => (
                                    <SortableSongRow 
                                        key={song._id} 
                                        song={song} 
                                        idx={idx} 
                                        onPlay={() => playSong(toPlayableSong(song))} 
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="space-y-1">
                            {localSongs.map((song, idx) => (
                                <SongRow
                                    key={song._id}
                                    song={song}
                                    idx={idx}
                                    onPlay={() => playSong(toPlayableSong(song))}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
