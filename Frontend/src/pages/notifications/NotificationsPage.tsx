export default function NotificationsPage() {
    return (
        <div className="bg-surface-dim text-on-surface font-body min-h-screen overflow-x-hidden relative selection:bg-primary/30 selection:text-primary">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glow-shadow {
            box-shadow: 0 0 40px rgba(90, 255, 225, 0.04);
        }
        .glass-panel {
            backdrop-filter: blur(16px);
            background: rgba(28, 32, 39, 0.6);
        }
        .coral-accent-glow {
            box-shadow: 0 0 15px rgba(255, 184, 187, 0.15);
        }

body {
      min-height: max(884px, 100dvh);
    }`,
                }}
            />
            <div>
                {/* Ambient Background Glows */}
                <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-tertiary-container/5 blur-[120px] pointer-events-none" />

                {/* Main Content Area */}
                <main className="pt-6 md:pt-12 lg:pt-20 px-4 md:px-6 lg:px-8 h-screen overflow-y-auto no-scrollbar">
                    {/* Header Section */}
                    <section className="md:mb-5 mb-2">
                        <div className="flex items-start gap-3 md:gap-4">
                            <button
                                className="lg:hidden p-1 -ml-2 text-slate-400 hover:text-white shrink-0"
                                onClick={() =>
                                    document.dispatchEvent(
                                        new CustomEvent(
                                            "toggle-mobile-sidebar",
                                        ),
                                    )
                                }
                            >
                                <span className="material-symbols-outlined text-3xl">
                                    menu
                                </span>
                            </button>

                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tighter">
                                    Notifications
                                </h1>
                            </div>
                        </div>
                    </section>

                    {/* Filter Chips (No Lines) */}
                    <section className="flex gap-3">
                        <button className="px-6 py-2 rounded-full bg-primary/10 text-primary font-label text-sm font-semibold hover:bg-primary/20 transition-colors">
                            All Activity
                        </button>
                        <button className="px-6 py-2 rounded-full bg-surface-container-high/40 backdrop-blur-md text-on-surface-variant font-label text-sm font-semibold hover:bg-surface-container-highest transition-colors">
                            Invites
                        </button>
                        <button className="px-6 py-2 rounded-full bg-surface-container-high/40 backdrop-blur-md text-on-surface-variant font-label text-sm font-semibold hover:bg-surface-container-highest transition-colors">
                            Alerts
                        </button>
                    </section>

                    {/* Notifications List */}
                    <section className="flex flex-col my-5 gap-4 pb-10">
                        {/* Item 1: Social Session Invite */}
                        <div className="group relative flex items-center gap-6 p-5 rounded-2xl bg-surface-container-high/40 backdrop-blur-lg border border-outline-variant/15 overflow-hidden transition-all hover:bg-surface-container-high/60">
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            {/* Avatar */}
                            <div className="relative size-14 shrink-0 rounded-full overflow-hidden shadow-[0_0_20px_rgba(90,255,225,0.1)]">
                                <img
                                    alt="Jane Doe"
                                    className="w-full h-full object-cover"
                                    data-alt="moody portrait of a man with neon blue and cyan rim lighting against a dark background"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCrj1DjxuoXZgyVj1YE616lYYxdKAflOCrRgcEryiKighz4zQVayaUHdomgPuNjUU7I0mcEVW2KQXsWJo5Y00lo5CQM29bK4vvDOJL0uc9ZK_9iFQFWav4pCIM7GHImN2JhGit997xxZ3tX-4s5dCDJ6osOULGz74HhRt23cig3uIiaxlauaFRvk8MGvF60Bb_3KlFEduO_eSw4B37BU1eIiQNCY7FeMrLFsX-dwAExS5J0FC3yZawo7rBn_W2UtBmHkflcEIUM6Az"
                                />
                                {/* Online Indicator */}
                                <div className="absolute bottom-0 right-0 size-3.5 bg-primary rounded-full border-2 border-surface-container-high" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-label font-bold uppercase tracking-[0.1em] text-secondary">
                                        Session Invite
                                    </span>
                                    <span className="text-xs text-on-surface-variant/70">
                                        2h ago
                                    </span>
                                </div>
                                <p className="font-body text-[15px] text-inverse-surface truncate">
                                    <strong className="font-semibold text-white">
                                        Jane Doe
                                    </strong>{" "}
                                    invited you to join an audio session:{" "}
                                    <span className="italic text-on-surface">
                                        "Indie Pop Hits"
                                    </span>
                                </p>
                            </div>
                            {/* Action */}
                            <div className="shrink-0 pl-2">
                                <button className="px-6 py-2.5 rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary font-label text-sm font-bold shadow-[0_0_15px_rgba(90,255,225,0.2)] hover:shadow-[0_0_25px_rgba(90,255,225,0.4)] transition-all transform hover:scale-105">
                                    Join
                                </button>
                            </div>
                        </div>

                        {/* Item 2: New Clip Alert (Coral Accent) */}
                        <div className="group relative flex items-center gap-6 p-5 rounded-2xl bg-surface-container-high/40 backdrop-blur-lg border border-outline-variant/15 overflow-hidden transition-all hover:bg-surface-container-high/60">
                            {/* Hover Glow Coral */}
                            <div className="absolute inset-0 bg-linear-to-r from-tertiary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            {/* Album Art / Thumbnail */}
                            <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(255,184,187,0.1)]">
                                <img
                                    alt="The Weeknd Clip"
                                    className="w-full h-full object-cover"
                                    data-alt="abstract neon light trails in deep red and coral colors over a pitch black void"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbztZY4EvqxTnQ_IFOmOELFYb0-5K6u7MjRJOsq4CRJW-LFUMjK1Wj5o8TI-lxRjozptKFY6PaC7sG3pxUj-p2cJxx1h4aZ46Os4FCPUBl4R1c6kIIM-blLB1qUSR5FI_v247uVxcxsgD4tsuNdlSIjkhzKBw0cjJyfGw3BzSOX5j7TbPZyQDpI2Ptl1OV3vECsy1KT-XbtyRPVd-lthmtdvnsFUXqNdnzCiUJKOwzFQ_KlgBQmP88dhHJepPONVvz9XNJYadrbbLo"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <span
                                        className="material-symbols-outlined text-white text-xl"
                                        style={{
                                            fontVariationSettings: '"FILL" 1',
                                        }}
                                    >
                                        play_arrow
                                    </span>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-label font-bold uppercase tracking-[0.1em] text-tertiary-container flex items-center gap-1">
                                        <span
                                            className="material-symbols-outlined text-[14px]"
                                            style={{
                                                fontVariationSettings:
                                                    '"FILL" 1',
                                            }}
                                        >
                                            local_fire_department
                                        </span>{" "}
                                        Hot Drop
                                    </span>
                                    <span className="text-xs text-on-surface-variant/70">
                                        4h ago
                                    </span>
                                </div>
                                <p className="font-body text-[15px] text-inverse-surface truncate">
                                    Check out the latest exclusive clip from{" "}
                                    <strong className="font-semibold text-white">
                                        The Weeknd
                                    </strong>
                                </p>
                            </div>
                            {/* Action */}
                            <div className="shrink-0 pl-2">
                                <button className="px-6 py-2.5 rounded-full bg-surface-container-highest/80 text-inverse-surface font-label text-sm font-bold hover:bg-surface-bright transition-colors border border-outline-variant/30">
                                    View
                                </button>
                            </div>
                        </div>

                        {/* Item 3: Creator Update */}
                        <div className="group relative flex items-center gap-6 p-5 rounded-2xl bg-surface-container-high/40 backdrop-blur-lg border border-outline-variant/15 overflow-hidden transition-all hover:bg-surface-container-high/60">
                            <div className="absolute inset-0 bg-linear-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            {/* Avatar */}
                            <div className="relative size-14 shrink-0 rounded-full overflow-hidden">
                                <img
                                    alt="Creator Profile"
                                    className="w-full h-full object-cover"
                                    data-alt="silhouette of a dj at a concert with vibrant blue and purple stage lights"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA52DNB1pXoIpJweNaXtNhCtZ62xoZXRcZbFkSEbdfPS1mBVDmPGi367HCHnkaMt9bBqZYrYAZxWo1tibNANJNz9mkOeE4Py2VHfT33IbOUHQJUI0HRneFf4aSYZZMb5rxMgsowoeZfrntOMQqFI0paFaI-Jr1zVboIhVt3TtEax1I6Xq-dbqa2SJ0tQF9DeHI7fhDsNsEglvbG4-nUWUeZnR4Kaj03GDcedcAgSB14V0hxmyl9gR1aZa4MoiR7kEzjVwD_1d2aaxY_"
                                />
                            </div>
                            {/* Content */}
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-label font-bold uppercase tracking-[0.1em] text-secondary-fixed-dim">
                                        Creator Update
                                    </span>
                                    <span className="text-xs text-on-surface-variant/70">
                                        Yesterday
                                    </span>
                                </div>
                                <p className="font-body text-[15px] text-inverse-surface truncate">
                                    <strong className="font-semibold text-white">
                                        DJ Horizon
                                    </strong>{" "}
                                    posted a new tour schedule for the upcoming
                                    European leg.
                                </p>
                            </div>
                            {/* Action */}
                            <div className="shrink-0 pl-2">
                                <button className="px-6 py-2.5 rounded-full bg-surface-container-highest/80 text-inverse-surface font-label text-sm font-bold hover:bg-surface-bright transition-colors border border-outline-variant/30">
                                    Read
                                </button>
                            </div>
                        </div>

                        {/* Item 4: Follower Alert */}
                        <div className="group relative flex items-center gap-6 p-5 rounded-2xl bg-surface-container-high/40 backdrop-blur-lg border border-outline-variant/15 overflow-hidden transition-all hover:bg-surface-container-high/60">
                            <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            {/* Multi-Avatar (Simulated) */}
                            <div className="relative size-14 shrink-0">
                                <div className="absolute top-0 left-0 size-10 rounded-full border-2 border-surface-container-high overflow-hidden z-10">
                                    <img
                                        alt="Follower"
                                        className="w-full h-full object-cover"
                                        data-alt="close-up profile of a woman smiling with subtle cinematic teal lighting"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4w4pq8fskg0IuyfDB4ozMdmrJ1D4kXul534AMpppC1pyDTivFrQ9yGFWYSgB9ICf3rzxaQgWg6ileBMnqJAB6_t-fZEvgHTB6jPi9BTtoBf_EfbzSkVa_AZgGUY34CEIPE8cAvdDQBGbkxBJ-wd-_gwafUMBiDixnjAxpm2PJmEDXWyLYUh9JmGZLJf1nSn2D4G6g0Xtm0ZzQDwXz2aKjDE6LMuShSUzJb4lF6Z5qFDMbtHktN8_i0luE3KwDorocnT4zUoy5ZEM9"
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 size-10 rounded-full border-2 border-surface-container-high overflow-hidden bg-surface-variant flex items-center justify-center">
                                    <span className="text-xs font-bold text-on-surface-variant">
                                        +3
                                    </span>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-label font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                                        Network
                                    </span>
                                    <span className="text-xs text-on-surface-variant/70">
                                        2d ago
                                    </span>
                                </div>
                                <p className="font-body text-[15px] text-inverse-surface truncate">
                                    <strong className="font-semibold text-white">
                                        Alex M.
                                    </strong>{" "}
                                    and 3 others started following your
                                    "Midnight Drive" playlist.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
