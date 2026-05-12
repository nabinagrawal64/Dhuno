import { ChartColumnBig, TrendingUp, Users2, PlayCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const metrics = [
    { label: 'Monthly listeners', value: '89.4K', icon: Users2 },
    { label: 'Average completion', value: '74%', icon: PlayCircle },
    { label: 'Follower growth', value: '+12.6%', icon: TrendingUp },
    { label: 'Campaign score', value: 'A-', icon: ChartColumnBig },
];

const barWidths: Record<number, string> = {
    82: 'w-[82%]',
    64: 'w-[64%]',
    91: 'w-[91%]',
};

export default function ArtistAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="rounded-[2rem] border border-white/10 bg-surface-container-low h-32 shadow-2xl" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="rounded-[1.75rem] border border-white/10 bg-surface-container-low h-32 shadow-2xl" />
                    ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-surface-container-low h-64 shadow-2xl" />
                    <div className="rounded-[2rem] border border-white/10 bg-surface-container-low h-64 shadow-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-surface-container-low p-6 shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Audience Analytics</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">See how releases and clips are performing</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">Track engagement, retention, and growth trends to plan your next release with more confidence.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div key={metric.label} className="rounded-[1.75rem] border border-white/10 bg-surface-container-low p-5 shadow-2xl">
                            <Icon className="h-5 w-5 text-primary" />
                            <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">{metric.label}</p>
                            <p className="mt-3 text-3xl font-black tracking-tight">{metric.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-[2rem] border border-white/10 bg-surface-container-low p-6 shadow-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Growth Trend</p>
                    <div className="mt-6 space-y-4">
                        {[
                            { label: 'Songs', value: 82 },
                            { label: 'Clips', value: 64 },
                            { label: 'Followers', value: 91 },
                        ].map((bar) => (
                            <div key={bar.label}>
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>{bar.label}</span>
                                    <span>{bar.value}%</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-white/5">
                                    <div className={`h-2 rounded-full bg-linear-to-r from-primary to-secondary ${barWidths[bar.value] ?? 'w-full'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-surface-container-low p-6 shadow-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Recommended Focus</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Publish one clip teaser every release week.</div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Push short-form content when engagement spikes.</div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Review top cities and plan live sessions there.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
