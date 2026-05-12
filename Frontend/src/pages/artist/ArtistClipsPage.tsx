import { Clapperboard, Heart, Share2, Pin } from 'lucide-react';
import { useState, useEffect } from 'react';

const clips = [
    { title: 'Midnight Resonance', reach: '240K views', status: 'Pinned' },
    { title: 'Studio Teaser', reach: '98K views', status: 'Trending' },
    { title: 'Behind the Mix', reach: '61K views', status: 'Draft' },
];

export default function ArtistClipsPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="rounded-[2rem] border border-white/10 bg-surface-container-low h-32 shadow-2xl" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="rounded-[2rem] border border-white/10 bg-surface-container-low p-5 shadow-2xl h-96" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-surface-container-low p-6 shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Clip Studio</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">Manage teaser clips and short-form promos</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">Use clips for promotion, audience growth, and release countdowns. This section lives in the artist studio now.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {clips.map((clip) => (
                    <article key={clip.title} className="rounded-[2rem] border border-white/10 bg-surface-container-low p-5 shadow-2xl">
                        <div className="aspect-[3/4] rounded-[1.5rem] bg-linear-to-br from-primary/20 via-surface-container-high to-surface-container-low p-4">
                            <div className="flex h-full flex-col justify-between rounded-[1.25rem] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.24em] text-primary">
                                    <span>{clip.status}</span>
                                    <Clapperboard className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white">{clip.title}</h2>
                                    <p className="mt-2 text-sm text-slate-300">{clip.reach}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-slate-300">
                            <button className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">
                                <Heart className="h-4 w-4" /> Like
                            </button>
                            <button className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">
                                <Share2 className="h-4 w-4" /> Share
                            </button>
                            <button className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">
                                <Pin className="h-4 w-4" /> Pin
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
