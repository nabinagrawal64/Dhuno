import { ArrowUpRight, Music2, Clapperboard, ChartColumnBig, Users2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const stats = [
    { label: 'Songs Published', value: '42', icon: Music2, tone: 'from-cyan-400/20 to-cyan-400/5' },
    { label: 'Clip Reach', value: '1.8M', icon: Clapperboard, tone: 'from-fuchsia-400/20 to-fuchsia-400/5' },
    { label: 'Monthly Streams', value: '324K', icon: ChartColumnBig, tone: 'from-emerald-400/20 to-emerald-400/5' },
    { label: 'Audience', value: '89K', icon: Users2, tone: 'from-amber-400/20 to-amber-400/5' },
];

const quickLinks = [
    { to: '/artist/songs', label: 'Manage Songs', icon: Music2 },
    { to: '/artist/clips', label: 'Studio Clips', icon: Clapperboard },
    { to: '/artist/analytics', label: 'Audience Analytics', icon: ChartColumnBig },
];

export default function ArtistDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 lg:space-y-8 animate-pulse">
                <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-surface-container-low h-64 shadow-2xl" />
                    <div className="rounded-[2rem] border border-white/10 bg-surface-container-low h-64 shadow-2xl" />
                </section>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="rounded-[1.75rem] border border-white/10 bg-surface-container-low h-32 shadow-2xl" />
                    ))}
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[2rem] border border-white/10 bg-linear-to-br from-primary/15 via-surface-container-low to-surface-container-low p-6 shadow-2xl lg:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Artist Overview</p>
                    <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tighter sm:text-4xl lg:text-5xl">
                        Build your next release, track growth, and keep your studio moving.
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                        Use the studio dashboard to manage songs, clips, and audience growth without leaving the platform.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/artist/songs" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-transform hover:scale-[1.02]">
                            Upload Song <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        <Link to="/artist/clips" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:border-primary/40 hover:text-primary">
                            Open Clips
                        </Link>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-surface-container-low p-6 shadow-2xl lg:p-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">Today</p>
                            <p className="text-lg font-bold text-on-surface">Studio momentum is up 18%</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-on-surface-variant">Release queue</span>
                                <span className="font-bold text-primary">3 pending</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-white/5">
                                <div className="h-2 w-[68%] rounded-full bg-linear-to-r from-primary to-secondary" />
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-on-surface-variant">Audience growth</span>
                                <span className="font-bold text-emerald-400">+4.2K this week</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-white/5">
                                <div className="h-2 w-[82%] rounded-full bg-linear-to-r from-emerald-400 to-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className={`rounded-[1.75rem] border border-white/10 bg-linear-to-br ${item.tone} p-5 shadow-2xl`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">{item.label}</p>
                                    <p className="mt-3 text-3xl font-black tracking-tight text-on-surface">{item.value}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-high/70 text-primary">
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="rounded-[2rem] border border-white/10 bg-surface-container-low p-6 shadow-2xl lg:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Studio Sections</p>
                            <h3 className="mt-2 text-2xl font-black tracking-tight">Everything an artist needs</h3>
                        </div>
                        <Link to="/artist/analytics" className="text-sm font-bold text-primary hover:underline">
                            View analytics
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {quickLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link key={link.to} to={link.to} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-white/8">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <p className="mt-4 text-lg font-bold text-on-surface">{link.label}</p>
                                    <p className="mt-2 text-sm text-slate-400">Open the {link.label.toLowerCase()} workspace.</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-surface-container-low p-6 shadow-2xl lg:p-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Next Actions</p>
                    <div className="mt-5 space-y-4">
                        {[
                            'Finalize the next single artwork and metadata',
                            'Schedule a clip teaser for the release week',
                            'Review weekly audience retention and engagement trends',
                        ].map((item) => (
                            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
