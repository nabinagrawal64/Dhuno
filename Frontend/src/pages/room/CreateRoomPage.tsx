import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { roomService } from "../../api/room.service";

const roomTags = ["lofi", "party", "electronic", "chill", "hip hop", "indie"];

export default function CreateRoomPage() {
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>(["lofi"]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const previewSubtitle = useMemo(() => {
        if (!roomName.trim()) {
            return "Name your room to preview it here.";
        }

        return `${selectedTags.slice(0, 3).join(" · ") || "general"}`;
    }, [roomName, selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags((current) => (
            current.includes(tag)
                ? current.filter((item) => item !== tag)
                : [...current, tag]
        ));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!roomName.trim()) {
            toast.error("Room name is required");
            return;
        }

        setIsSubmitting(true);

        const createWithLocation = (lat?: number, lng?: number) => {
            roomService.createRoom({
                roomName: roomName.trim(),
                description: description.trim(),
                tags: selectedTags,
                allowChat: true,
                allowQueueAdd: true,
                lat,
                lng
            }).then(response => {
                toast.success("Room created");
                navigate(`/rooms/live?roomId=${response.room._id}`);
            }).catch(error => {
                const message = error instanceof Error ? error.message : "Failed to create room";
                toast.error(message);
            }).finally(() => {
                setIsSubmitting(false);
            });
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    createWithLocation(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Location error:", error);
                    toast.error("Location access denied. Creating room with default location.");
                    createWithLocation(0, 0);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            createWithLocation(0, 0);
        }
    };
 
    return (
        <div className="pb-36 lg:pb-24">
            <div className="mx-auto flex w-full p-6 max-w-7xl flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
                <section className="flex-1 rounded-3xl border border-white/8 bg-white/5 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl md:rounded-4xl md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
                        <div>
                            <p className="text-[10px]  font-bold uppercase tracking-[0.35em] text-primary/80 md:text-xs">Live Rooms</p>
                            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">Create a room that feels alive.</h1>
                        </div>
                        <button
                            className="w-fit rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-primary/40 hover:text-white md:text-sm"
                            type="button"
                            onClick={() => navigate("/rooms/discovery")}
                        >
                            Back to discovery
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <label className="block space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 md:text-xs">Room name</span>
                                <input
                                    className="w-full rounded-xl border border-white/8 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary/60 md:rounded-2xl md:py-4 md:text-base"
                                    placeholder="Midnight Drift"
                                    value={roomName}
                                    onChange={(event) => setRoomName(event.target.value)}
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 md:text-xs">Description</span>
                                <textarea
                                    className="min-h-24 w-full rounded-xl border border-white/8 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-primary/60 md:min-h-30 md:rounded-2xl md:py-4 md:text-base"
                                    placeholder="What are people listening to tonight?"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 md:text-xs">Tags</span>
                                <span className="text-[10px] text-slate-500 md:text-xs">Pick up to 3 for discovery</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {roomTags.map((tag) => {
                                    const active = selectedTags.includes(tag);

                                    return (
                                        <button
                                            key={tag}
                                            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition md:px-4 md:py-2 md:text-xs md:tracking-[0.2em] ${active ? "border-primary/40 bg-primary/15 text-primary" : "border-white/8 bg-black/20 text-slate-400 hover:border-white/16 hover:text-white"}`}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-black/20 p-4 md:rounded-[1.5rem] md:p-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">Preview</p>
                                    <h2 className="mt-1 truncate text-xl font-black tracking-tight md:mt-2 md:text-2xl">{roomName || "Your room"}</h2>
                                    <p className="mt-0.5 truncate text-xs text-slate-400 md:mt-1 md:text-sm">{previewSubtitle}</p>
                                </div>
                                <button
                                    className="w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
                                    disabled={isSubmitting}
                                    type="submit"
                                >
                                    {isSubmitting ? "Creating..." : "Create room"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                <aside className="w-full rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur-xl md:rounded-4xl lg:max-w-xs xl:max-w-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/80 md:text-xs">Why it works</p>
                    <h2 className="mt-2 text-xl font-black tracking-tight md:text-2xl">A room is a shared queue, chat, and playback state.</h2>
                    <div className="mt-4 space-y-4 text-xs text-slate-400 md:mt-6 md:text-sm">
                        <p>Host playback stays authoritative, while everyone else sees the same current song, queue, and room chat in real time.</p>
                        <p>Each room can be public or private, and queue additions can stay open for collaborative sessions.</p>
                        <p>This is the first usable slice of the feature, so you can iterate from a working base instead of another static mockup.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
