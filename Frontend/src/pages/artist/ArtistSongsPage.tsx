import { useEffect, useState } from 'react';
import { Music2, PlayCircle, PauseCircle, PencilLine, Upload, FileAudio2, ImageUp, LoaderCircle, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { songService, type SongItem } from '../../api/song.service';
import { usePlayer } from '../../context/PlayerContext';

const emptyForm = {
    title: '',
    artistName: '',
    genre: '',
    language: 'English',
    lyrics: '',
    tags: '',
    isExplicit: false,
};

export default function ArtistSongsPage() {
    const { playSong, currentSong, isPlaying, setQueue } = usePlayer();

    const [songs, setSongs] = useState<SongItem[]>([]);
    const [isLoadingSongs, setIsLoadingSongs] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [formData, setFormData] = useState(emptyForm);

    // Inline edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', artistName: '', genre: '', language: '', lyrics: '' });

    const loadSongs = async () => {
        try {
            setIsLoadingSongs(true);
            const response = await songService.getMySongs();
            const fetched = response.songs || [];
            setSongs(fetched);
            // Push all songs into the global queue so skip works
            setQueue(fetched.map(s => ({
                _id: s._id,
                title: s.title,
                audioUrl: s.audioUrl ?? '',
                coverImage: s.coverImage,
                artistName: s.artist?.name ?? s.artist?.username ?? 'Artist',
                duration: s.duration,
            })));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to load songs');
        } finally {
            setIsLoadingSongs(false);
        }
    };

    useEffect(() => {
        loadSongs();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!audioFile) {
            toast.error('Audio file is required');
            return;
        }

        if (!formData.title.trim()) {
            toast.error('Song title is required');
            return;
        }

        try {
            setIsSubmitting(true);
            await songService.uploadSong({
                title: formData.title,
                artistName: formData.artistName,
                genre: formData.genre,
                language: formData.language,
                lyrics: formData.lyrics,
                tags: formData.tags,
                isExplicit: formData.isExplicit,
                audio: audioFile,
                coverImage: coverFile,
            });

            toast.success('Song uploaded successfully');
            setFormData(emptyForm);
            setAudioFile(null);
            setCoverFile(null);
            await loadSongs();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to upload song');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePlay = (song: SongItem) => {
        if (!song.audioUrl) {
            toast.error('No audio URL for this song');
            return;
        }
        playSong({
            _id: song._id,
            title: song.title,
            audioUrl: song.audioUrl,
            coverImage: song.coverImage,
            artistName: song.artistName || song.artist?.name || song.artist?.username || 'Artist',
            duration: song.duration,
        });
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
            const response = await songService.updateSong(id, {
                title: editForm.title,
                artistName: editForm.artistName,
                genre: editForm.genre,
                language: editForm.language,
                lyrics: editForm.lyrics,
            });
            setSongs(prev => prev.map(s => s._id === id ? response.song : s));
            toast.success('Song updated');
            setEditingId(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update song');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-4xl border border-white/10 bg-surface-container-low p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Song Studio</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight">Manage releases and drafts</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">Upload new songs, attach cover art, and keep your artist library in one workspace.</p>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="rounded-4xl border border-white/10 bg-surface-container-low p-6 shadow-2xl">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Upload Studio</p>
                            <h2 className="mt-2 text-xl font-black tracking-tight">Create a new song</h2>
                        </div>
                        <Upload className="h-5 w-5 text-primary" />
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 sm:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Title *</span>
                            <input name="title" value={formData.title} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/40" placeholder="Song title" required />
                        </label>

                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Artist Name</span>
                            <input name="artistName" value={formData.artistName} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/40" placeholder="Artist name(s)" />
                        </label>

                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Genre</span>
                            <input name="genre" value={formData.genre} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/40" placeholder="Hip-hop, ambient…" />
                        </label>

                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Language</span>
                            <input name="language" value={formData.language} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/40" placeholder="English" />
                        </label>

                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Tags</span>
                            <input name="tags" value={formData.tags} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/40" placeholder="chill, night, synth" />
                        </label>

                        <label className="space-y-2 sm:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Lyrics</span>
                            <textarea name="lyrics" value={formData.lyrics} onChange={handleChange} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/40" placeholder="Paste lyrics or notes here" />
                        </label>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/40">
                            <FileAudio2 className="h-4 w-4 text-primary" />
                            <span>{audioFile ? audioFile.name : 'Select audio file *'}</span>
                            <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/40">
                            <ImageUp className="h-4 w-4 text-primary" />
                            <span>{coverFile ? coverFile.name : 'Select cover image'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                        </label>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <input id="isExplicit" name="isExplicit" type="checkbox" checked={formData.isExplicit} onChange={handleChange} className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary" />
                        <label htmlFor="isExplicit" className="text-sm text-slate-300">Mark as explicit</label>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary disabled:opacity-70">
                        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {isSubmitting ? 'Uploading…' : 'Upload Song'}
                    </button>
                </form>

                {/* Library List */}
                <div className="rounded-4xl border border-white/10 bg-surface-container-low p-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black tracking-tight">Library</h2>
                        <span className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">{songs.length} items</span>
                    </div>

                    <div className="mt-5 space-y-3">
                        {isLoadingSongs ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3 w-full">
                                            <div className="shrink-0 h-11 w-11 rounded-2xl bg-white/10" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-white/10 rounded w-1/3" />
                                                <div className="h-3 bg-white/10 rounded w-1/4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : songs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">No songs uploaded yet. Upload your first track on the left.</div>
                        ) : (
                            songs.map((song) => {
                                const isThisSongPlaying = currentSong?._id === song._id && isPlaying;
                                const isEditing = editingId === song._id;

                                return (
                                    <div key={song._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        {/* Song row */}
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                {/* Cover art or placeholder */}
                                                <div className="relative shrink-0 h-11 w-11 rounded-2xl overflow-hidden">
                                                    {song.coverImage ? (
                                                        <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-primary/15 text-primary">
                                                            <Music2 className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate font-bold text-on-surface">{song.title}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {song.genre && (
                                                            <span className="text-xs font-bold text-primary">
                                                                {song.genre}
                                                            </span>
                                                        )}
                                                        {song.artistName ? ` • ${song.artistName}` : ` • ${song.artist?.name || song.artist?.username || 'Artist'}`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Controls (play / edit / delete) */}
                                            <div className="flex items-center gap-3 text-sm text-slate-300 shrink-0">
                                                <span className="text-xs text-slate-500">{song.plays ? `${song.plays.toLocaleString()} plays` : 'Draft'}</span>
                                                <button
                                                    type="button"
                                                    aria-label={isThisSongPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                                                    onClick={() => handlePlay(song)}
                                                    className={`rounded-full border p-2 transition-colors ${isThisSongPlaying ? 'border-primary text-primary' : 'border-white/10 hover:text-primary'}`}
                                                >
                                                    {isThisSongPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label={`Edit ${song.title}`}
                                                    onClick={() => isEditing ? cancelEdit() : startEdit(song)}
                                                    className={`rounded-full border p-2 transition-colors ${isEditing ? 'border-primary text-primary' : 'border-white/10 hover:text-primary'}`}
                                                >
                                                    {isEditing ? <X className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline edit form */}
                                        {isEditing && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                                                <input
                                                    value={editForm.title}
                                                    onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    value={editForm.artistName}
                                                    onChange={e => setEditForm(p => ({ ...p, artistName: e.target.value }))}
                                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                                                    placeholder="Artist Name"
                                                />
                                                <input
                                                    value={editForm.language}
                                                    onChange={e => setEditForm(p => ({ ...p, language: e.target.value }))}
                                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/40"
                                                    placeholder="Language"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveEdit(song._id)}
                                                        className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary"
                                                    >
                                                        <Check className="h-3 w-3" /> Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-on-surface"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-4xl border border-white/10 bg-surface-container-low p-6 shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Publishing Checklist</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Upload cover art</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Add lyrics and metadata</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Schedule clip teaser</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Confirm release date</div>
                </div>
            </div>
        </div>
    );
}
