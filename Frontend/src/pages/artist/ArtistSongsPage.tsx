import { useCallback, useEffect, useState } from 'react';
import {
    Music2,
    PlayCircle,
    PauseCircle,
    PencilLine,
    Upload,
    FileAudio2,
    ImageUp,
    LoaderCircle,
    Check,
    LayoutGrid,
    GripVertical,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { songService, type SongItem } from '../../api/song.service';
import { playlistService, type PlaylistItem } from '../../api/playlist.service';
import { usePlayer } from '../../context/PlayerContext';

const languageOptions = ['English', 'Hindi', 'Punjabi', 'Spanish', 'Japanese', 'Korean'];

const emptySongForm = {
    title: '',
    artistName: '',
    genre: '',
    language: 'English',
    lyrics: '',
    tags: '',
    isExplicit: false,
};

const emptyPlaylistForm = {
    title: '',
    genre: '',
    language: 'English',
    tags: '',
};

type TabKey = 'songs' | 'playlists';

export default function ArtistSongsPage() {
    const { playSong, currentSong, isPlaying, setQueue } = usePlayer();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [songs, setSongs] = useState<SongItem[]>([]);
    const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeCreationSection, setActiveCreationSection] = useState<TabKey>('songs');

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [songCoverFile, setSongCoverFile] = useState<File | null>(null);
    const [songFormData, setSongFormData] = useState(emptySongForm);

    const [playlistCoverFile, setPlaylistCoverFile] = useState<File | null>(null);
    const [playlistFormData, setPlaylistFormData] = useState(emptyPlaylistForm);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', artistName: '', genre: '', language: '', lyrics: '' });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'playlists') {
            setActiveCreationSection('playlists');
        } else {
            setActiveCreationSection('songs');
        }
    }, [searchParams]);

    const setTab = (tab: TabKey) => {
        setActiveCreationSection(tab);
        setSearchParams({ tab });
    };

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [songsRes, playlistsRes] = await Promise.all([
                songService.getMySongs(),
                playlistService.getMyPlaylists(),
            ]);

            const fetchedSongs = songsRes.songs || [];
            const fetchedPlaylists = playlistsRes.playlists || [];

            setSongs(fetchedSongs);
            setPlaylists(fetchedPlaylists);

            setQueue(fetchedSongs.map(s => ({
                _id: s._id,
                title: s.title,
                audioUrl: s.audioUrl ?? '',
                coverImage: s.coverImage,
                artistName: s.artistName || s.artist?.name || 'Artist',
                duration: s.duration,
            })));
        } catch {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [setQueue]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleSongSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioFile) return toast.error('Audio file is required');
        if (!songFormData.title.trim()) return toast.error('Song title is required');

        try {
            setIsSubmitting(true);
            await songService.uploadSong({
                ...songFormData,
                audio: audioFile,
                coverImage: songCoverFile,
            });
            toast.success('Song uploaded successfully!');
            setSongFormData(emptySongForm);
            setAudioFile(null);
            setSongCoverFile(null);
            await loadData();
        } catch {
            toast.error('Failed to upload song');
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (song: SongItem) => {
        setEditingId(song._id);
        setEditForm({
            title: song.title ?? '',
            artistName: song.artistName ?? '',
            genre: Array.isArray(song.genre) ? song.genre.join(', ') : (song.genre ?? ''),
            language: song.language ?? 'English',
            lyrics: song.lyrics ?? '',
        });
    };

    const cancelEdit = () => setEditingId(null);

    const saveEdit = async (id: string) => {
        try {
            await songService.updateSong(id, {
                title: editForm.title,
                artistName: editForm.artistName,
                genre: editForm.genre,
                language: editForm.language,
                lyrics: editForm.lyrics,
            });
            toast.success('Song updated successfully');
            setEditingId(null);
            await loadData();
        } catch {
            toast.error('Failed to update song');
        }
    };

    const handlePlaylistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!playlistFormData.title.trim()) {
            toast.error('Playlist name is required');
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('title', playlistFormData.title);
            formData.append('genre', playlistFormData.genre);
            formData.append('language', playlistFormData.language);
            formData.append('tags', playlistFormData.tags);

            if (playlistCoverFile) {
                formData.append('coverImage', playlistCoverFile);
            }

            const response = await playlistService.createPlaylist(formData);
            toast.success(`Playlist "${response.playlist.title}" created`);
            setPlaylistFormData(emptyPlaylistForm);
            setPlaylistCoverFile(null);
            setTab('playlists');
            await loadData();
        } catch {
            toast.error('Failed to create playlist');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center px-4">
                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-surface-container-high px-6 py-4 text-sm font-semibold text-slate-300 shadow-2xl">
                    <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                    Loading artist studio...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen px-4 md:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3 max-w-3xl">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-headline tracking-tight">Artist Studio</h1>
                    <p className="text-slate-500 text-sm md:text-base">Switch between song and playlist creation, then manage the catalog below. Songs can live in multiple playlists.</p>
                </div>

                <div className="inline-flex rounded-2xl border border-white/5 bg-surface-container-high p-1.5 shadow-xl shadow-black/10 self-start lg:self-auto">
                    <button
                        type="button"
                        onClick={() => setTab('songs')}
                        className={`min-w-32 rounded-xl px-5 py-3 text-sm font-bold transition-all ${activeCreationSection === 'songs' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Song
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('playlists')}
                        className={`min-w-32 rounded-xl px-5 py-3 text-sm font-bold transition-all ${activeCreationSection === 'playlists' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Playlist
                    </button>
                </div>
            </div>

            <section className="glass-card w-full rounded-[2.5rem] border border-white/5 p-8 md:p-12 overflow-hidden">
                <div className="relative">
                    <div className={`transition-all duration-300 ease-out ${activeCreationSection === 'songs' ? 'max-h-750 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden pointer-events-none'}`}>
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <Music2 size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-bold">Song Creation</h2>
                                    <p className="text-sm text-slate-500">Upload a new track with its metadata.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSongSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                    <div className="space-y-6">
                                        {/* audio upload */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Audio File</label>
                                            <div onClick={() => document.getElementById('audio-upload')?.click()} className={`h-40 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${audioFile ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-surface-container hover:bg-white/5'}`}>
                                                {audioFile ? (
                                                    <div className="flex flex-col items-center gap-2 text-primary animate-in fade-in zoom-in duration-300">
                                                        <FileAudio2 size={40} />
                                                        <div className="text-center">
                                                            <p className="text-sm font-bold truncate max-w-60">{audioFile.name}</p>
                                                            <p className="text-[10px] opacity-70">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={32} className="text-slate-600" />
                                                        <div className="text-center">
                                                            <p className="text-sm font-bold text-slate-400">Click to upload audio</p>
                                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">MP3, WAV, FLAC</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" id="audio-upload" accept="audio/*" title="Upload audio file" aria-label="Upload audio file" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="hidden" />
                                        </div>
                                        
                                        {/* cover upload */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Cover Image</label>
                                            <div onClick={() => document.getElementById('song-cover')?.click()} className={`w-full max-w-56 aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${songCoverFile ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-surface-container hover:bg-white/5'}`}>
                                                {songCoverFile ? (
                                                    <div className="w-full h-full relative group/img animate-in fade-in zoom-in duration-300">
                                                        <img src={URL.createObjectURL(songCoverFile)} alt="Song cover preview" className="w-full h-full object-cover rounded-[1.4rem]" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity rounded-[1.4rem]">
                                                            <ImageUp className="text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageUp size={32} className="text-slate-600" />
                                                        <div className="text-center">
                                                            <p className="text-sm font-bold text-slate-400">Click to upload cover</p>
                                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">Square image (1:1)</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" id="song-cover" accept="image/*" title="Upload song cover image" aria-label="Upload song cover image" onChange={(e) => setSongCoverFile(e.target.files?.[0] || null)} className="hidden" />
                                        </div>
                                    </div>
                                    
                                    {/* right side form */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Song Name</label>
                                            <input type="text" value={songFormData.title} onChange={(e) => setSongFormData({ ...songFormData, title: e.target.value })} placeholder="Enter song name" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Artist Name</label>
                                            <input type="text" value={songFormData.artistName} onChange={(e) => setSongFormData({ ...songFormData, artistName: e.target.value })} placeholder="Primary artist, featured artist, producer" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Genre</label>
                                            <input type="text" value={songFormData.genre} onChange={(e) => setSongFormData({ ...songFormData, genre: e.target.value })} placeholder="e.g. Hip-hop" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Language</label>
                                            <div className="relative">
                                                <select value={songFormData.language} onChange={(e) => setSongFormData({ ...songFormData, language: e.target.value })} title="Select song language" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer">
                                                    {languageOptions.map(language => <option key={language} value={language}>{language}</option>)}
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><LayoutGrid size={14} /></div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Tags</label>
                                            <input type="text" value={songFormData.tags} onChange={(e) => setSongFormData({ ...songFormData, tags: e.target.value })} placeholder="Comma separated tags" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Lyrics</label>
                                            <textarea value={songFormData.lyrics} onChange={(e) => setSongFormData({ ...songFormData, lyrics: e.target.value })} placeholder="Paste lyrics here. This field is optional." className="w-full h-32 rounded-3xl bg-surface-container border border-white/5 p-6 focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" disabled={isSubmitting} className="bg-primary text-on-primary px-12 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50">
                                        {isSubmitting ? <LoaderCircle className="animate-spin h-5 w-5" /> : <Upload size={20} />}
                                        Publish Song
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className={`transition-all duration-300 ease-out ${activeCreationSection === 'playlists' ? 'max-h-750 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden pointer-events-none'}`}>
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <LayoutGrid size={22} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-bold">Playlist Creation</h2>
                                    <p className="text-sm text-slate-500">Build a playlist, then add songs to it.</p>
                                </div>
                            </div>

                            <form onSubmit={handlePlaylistSubmit} className="grid grid-cols-1 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Cover Image</label>
                                    <div onClick={() => document.getElementById('playlist-cover')?.click()} className="w-48 h-36 rounded-3xl bg-surface-container border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative group">
                                        {playlistCoverFile ? <img src={URL.createObjectURL(playlistCoverFile)} alt="Preview" className="w-full h-full object-cover" /> : (<><ImageUp size={32} className="text-slate-600" /><span className="text-xs text-slate-600 font-bold">Upload playlist artwork</span></>)}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload className="text-white" /></div>
                                    </div>
                                    <input type="file" id="playlist-cover" accept="image/*" title="Upload playlist cover image" aria-label="Upload playlist cover image" onChange={(e) => setPlaylistCoverFile(e.target.files?.[0] || null)} className="hidden" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Playlist Name</label>
                                        <input required type="text" value={playlistFormData.title} onChange={(e) => setPlaylistFormData({ ...playlistFormData, title: e.target.value })} placeholder="Enter playlist name" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Genre</label>
                                        <input type="text" value={playlistFormData.genre} onChange={(e) => setPlaylistFormData({ ...playlistFormData, genre: e.target.value })} placeholder="e.g. Pop, Hip-hop" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Language</label>
                                        <select value={playlistFormData.language} onChange={(e) => setPlaylistFormData({ ...playlistFormData, language: e.target.value })} title="Select playlist language" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none appearance-none">
                                            {languageOptions.map(language => <option key={language} value={language}>{language}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Tags</label>
                                        <input type="text" value={playlistFormData.tags} onChange={(e) => setPlaylistFormData({ ...playlistFormData, tags: e.target.value })} placeholder="Comma separated tags" className="w-full h-14 rounded-2xl bg-surface-container border border-white/5 px-6 focus:ring-2 focus:ring-primary/50 outline-none" />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" disabled={isSubmitting} className="bg-primary text-on-primary px-12 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50">
                                        {isSubmitting ? <LoaderCircle className="animate-spin h-5 w-5" /> : <Check size={20} />}
                                        Create Playlist
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {activeCreationSection === 'songs' && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <PlayCircle className="text-primary" />
                            Song Catalog
                        </h2>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{songs.length} Songs</div>
                    </div>

                    <div className="rounded-4xl border border-white/5 bg-surface-container/40 overflow-hidden">
                        <div className="hidden sm:grid grid-cols-[34px_1fr_68px_48px] gap-4 px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5">
                            <div />
                            <div>Title / Artist</div>
                            <div className="text-right">Duration</div>
                            <div className="text-right">Edit</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {songs.map((song) => {
                                const isThisPlaying = currentSong?._id === song._id && isPlaying;
                                const isEditing = editingId === song._id;
                                const durationSec = song.duration || 0;
                                const durationMin = Math.floor(durationSec / 60);
                                const durationRemSec = durationSec % 60;

                                return (
                                    <div key={song._id} className={isEditing ? 'bg-white/5' : ''}>
                                        {isEditing ? (
                                            <div className="p-5 space-y-6 ring-2 ring-primary/40 rounded-3xl m-2">
                                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                                    <h4 className="font-bold text-primary">Editing Track</h4>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveEdit(song._id)} className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all"><Check size={14} /> Save</button>
                                                        <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase px-1">Title</label><input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Edit title" title="Edit song title" className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm outline-none border border-white/5 focus:border-primary/50" /></div>
                                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase px-1">Artist</label><input value={editForm.artistName} onChange={e => setEditForm({ ...editForm, artistName: e.target.value })} placeholder="Edit artist name" title="Edit artist name" className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm outline-none border border-white/5 focus:border-primary/50" /></div>
                                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase px-1">Genre</label><input value={editForm.genre} onChange={e => setEditForm({ ...editForm, genre: e.target.value })} placeholder="Edit genre" title="Edit genre" className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm outline-none border border-white/5 focus:border-primary/50" /></div>
                                                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase px-1">Language</label><input value={editForm.language} onChange={e => setEditForm({ ...editForm, language: e.target.value })} placeholder="Edit language" title="Edit language" className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-sm outline-none border border-white/5 focus:border-primary/50" /></div>
                                                    <div className="space-y-1.5 md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase px-1">Lyrics</label><textarea value={editForm.lyrics} onChange={e => setEditForm({ ...editForm, lyrics: e.target.value })} placeholder="Edit lyrics" title="Edit lyrics" className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm outline-none border border-white/5 focus:border-primary/50 h-24 resize-none" /></div>
                                                </div>
                                            </div>
                                        ) : (
                                                <div className="grid grid-cols-[28px_1fr_44px] sm:grid-cols-[34px_1fr_68px_48px] gap-3 sm:gap-4 px-3 sm:px-4 py-3 items-center hover:bg-white/5 transition-colors group">
                                                <div className="flex items-center justify-center text-slate-500/80 group-hover:text-primary transition-colors">
                                                    <GripVertical className="h-4 w-4" />
                                                </div>

                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="relative h-11 w-11 rounded-xl overflow-hidden shrink-0 shadow-lg group/img">
                                                        <img src={song.coverImage || 'https://images.unsplash.com/photo-1514525253361-bee8a48740d0?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                                        <button onClick={() => playSong({ _id: song._id, title: song.title, audioUrl: song.audioUrl ?? '', coverImage: song.coverImage, artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist', duration: song.duration })} className={`absolute inset-0 flex items-center justify-center transition-all ${isThisPlaying ? 'bg-primary/40 opacity-100' : 'bg-black/35 opacity-0 group-hover/img:opacity-100'}`}>
                                                            {isThisPlaying ? <PauseCircle className="text-white" size={20} /> : <PlayCircle className="text-white" size={20} />}
                                                        </button>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className={`font-bold text-base truncate transition-colors ${isThisPlaying ? 'text-primary' : 'text-on-surface'}`}>{song.title}</h4>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5">{song.artistName || song.artist?.name || 'Artist'}</p>
                                                    </div>
                                                </div>

                                                <div className="hidden sm:block text-right text-sm text-slate-500">{durationMin}:{String(durationRemSec).padStart(2, '0')}</div>

                                                <div className="flex items-center justify-end">
                                                    <button onClick={() => startEdit(song)} className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Edit Track"><PencilLine size={18} /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {activeCreationSection === 'playlists' && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <LayoutGrid className="text-primary" />
                            Your Playlists
                        </h2>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{playlists.length} Playlists</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {playlists.map(playlist => (
                            <div key={playlist.id} className="glass-card rounded-4xl p-5 border border-white/5 group hover:bg-white/5 transition-all cursor-pointer" onClick={() => navigate(`/artist/playlist/${playlist.id}`)}>
                                <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative shadow-xl">
                                    <img src={playlist.coverImage || 'https://images.unsplash.com/photo-1514525253361-bee8a48740d0?auto=format&fit=crop&w=400&q=80'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <h3 className="font-bold text-lg mb-1 truncate">{playlist.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3">
                                    <span className="text-primary">{playlist.songs?.length || 0} tracks</span>
                                    <span className="opacity-30">•</span>
                                    <span className="truncate">{playlist.genre || 'Various'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
