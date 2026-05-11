const playlists = [
    {
        title: "Midnight Drive",
        meta: "24 tracks • 1h 45m",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxNCu7UKs9Zv0sni3A6R1AQiBVZsOSzMHgjBxF_oUrIw7IgbIycMGmp_fimUP1EEmmHZaIi030Y0lV68A0wizI2vD3DYhoPXUVV5l8jpb9i6bNJMNs6Z7NOwkbOD_z4IhxiKyK8ajmq7ijKXQOLhQrlOpncG1v9YLksrr2B-_bDFZESOMMOkbNZWc4jy2Osz_wEs3sooZFbY4-oen2R2fmL_A7xHt5DLr48dp3pvTHUMqsJSgdwWEuRrX7MQM7zK9NeCwU7jzXDOA",
    },
    {
        title: "Cyberpunk Soul",
        meta: "18 tracks • 1h 12m",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAq1Rr-B68cpX_dj5CAkooPG9FYtK_0D8Bjd2fNV2Q1ZDOfbxNfNpT6z28tD1BfvTnIcxjmuO6QR8BNGsJZTvqqJg-8C7o5lKZtESgcQ-2PpHa2cgxyyRvlT74kyc0QN3Fus-4bSA637O20wBRUZYCCJOe0nHR0c6r846IsxBNX094-WFlEfGAXDf7OQvACWxpvODv9OP78O_OgNM-5WKWOiEpqp3MzCvvOy3veo1wozY6jL4S3nkQ-kd-g_O3VaLARoq04r9GMRHU",
    },
    {
        title: "Neon Afterglow",
        meta: "31 tracks • 2h 08m",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu8lvQVyp6jbZMWRrKn6xWgOXVIecWPWLarzZHQ2vV08ODDDJuOGTxO8X_7HTwuy1zhWYBgHEh24pgMFhXY97BvsM2pWzXlPST-vqPaMElmK3dL6R-kumtd3cQEpX34ONUjW2avLGbzqPia46V_i4BdBm-7r_40CZk-FFgWLg8BFNwXyiz63qLsuwSutfEv5QhDuMoK3maNbvyJHK_pLH9adbvZZc1LqViOASWtXLL8INdtHXJyL34WmP2YSqowwm6BQQhP2ZHEgg",
    },
];

const clips = [
    {
        title: "New Synth Jam #4",
        meta: "12K views • 0:45",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDl-OUlLq85mcqqqH39EBfmblXo7NVZm_qAk17s9TH_IGeMfKCD373yCcrX0Ey1_slzKs4LdmMI48tbtuU_w9DYemBUAYHsXAr6vU1Y6f4AiV1gAZjRrgxDLJ9TRbn2t7L34ZFNDe_9TrayyQdPVUZWoRe_nr6G3sSUX6FksT6ciCeGI6lfDv-3ZrMl0YFBo3ULOF2f9fj7l7C2O6GQM_EcUE-OicUjxqUJqqXpsgPHN0BzJHfDSv_j8nLtXT2pmPMW69rGBHAIisQ",
    },
    {
        title: "Live at Neon Plaza",
        meta: "45K views • 1:20",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF5HG42si8ol2onjwieBPccOxFUbB4D8IeMKg79Jf4cg76DN-SG45Uf06yxieiSivrLGpC9SMRwC6317fNd9fyk-cBo0wbK2L-8CvBunLFOtOogBqMQGNZHy93tAJ5PQUqQgBgJ91b5nbKzuOgLAt9rrFvlnGg1N9yJrV92I4BwvWhFkbhB8SPabn8nf5Up4qyr6AvX6clIs2RVRrFRBw8ZPu86CtT-Pgx-LAFh3Brtxad_v3SBEKGnusQqcV-asi3vuDifiiEKuw",
    },
    {
        title: "Vocal Session Snip",
        meta: "8K views • 0:15",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBY4FpXZsQzDxJLzcKIO028K59ZE5JXJ9jPwHv4CLYCYVd0E7y3w99OEO-FOjsXvZPzHFa9jF5baKxpjJET7aY4og2uMd2MW_A6L1E4tBf7hhWbgYt3jHQUmcrZrTBEnufijtVItZXwlcGMXxsH5xHQRRFv3aBTY3NL3hHXeI74cD4wAa4koa6JUetPkoJ8repXVaDvhOfne2KBuNEhNQEg3Y1bS77HVO9Yeej6JRTDDcmqp0RgyOdy_AHUXLMFrqg2gPpJvLkg7ss",
    },
];

const activity = [
    { label: "Latest release", value: "Neon Skyline Sessions" },
    { label: "Top genre", value: "Retro synth / dreamwave" },
    { label: "Based in", value: "Digital Void, Tokyo" },
];

export default function ProfilePage() {
    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-card {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    .hero-linear {
                        background:
                            radial-linear(circle at top left, rgba(90, 255, 225, 0.1), transparent 28%),
                            llinear-linear(180deg, rgba(90, 255, 225, 0.05) 0%, rgba(15, 19, 27, 0) 100%);
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    body {
                        min-height: max(884px, 100dvh);
                    }`,
                }}
            />

            <main className="hero-linear pt-6 md:pt-12 lg:pt-20 pb-32 px-4 md:px-6 lg:px-8 h-screen overflow-y-auto no-scrollbar">
                <section className="lg:mb-5 mb-3 flex items-center gap-3">
                    <button
                        className="lg:hidden p-1 -ml-2 text-slate-400 hover:text-white shrink-0"
                        onClick={() =>
                            document.dispatchEvent(
                                new CustomEvent("toggle-mobile-sidebar"),
                            )
                        }
                    >
                        <span className="material-symbols-outlined text-3xl">
                            menu
                        </span>
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tighter">
                            Profile
                        </h1>
                    </div>
                </section>

                <section className="glass-card rounded-4xl border border-white/5 overflow-hidden mb-8">
                    <div className="relative h-36 sm:h-44 lg:h-56">
                        <img
                            alt="Profile cover"
                            className="absolute inset-0 w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrGbD9rdY6kxLzCb9m7ClK285o1hlb3ONQcqem7MUafMBdX6EZiWLVYrw2HGt4PJmpm0Ie9tW6vS43aR7rcgLFcHw9lCOUcARLo7FJu3KbNKtNX7wBtoevioZFUQK3Ixf0ypzV3FzJ-Ph-C1wPxSGOLrJHIR2bFoB5f83A7-osxHtdt0qGChxxtnZn-Xh4YF-3BqgFbB2xFvskKaJtCGDgmGte2e3nAPOWvrcJuNFgd2xvpJBbR65svpbEMTAPRTzyHWg-PfcZePk"
                        />
                        <div className="absolute inset-0 bg-llinear-to-t from-background via-background/25 to-transparent" />
                    </div>

                    <div className="px-5 sm:px-7 lg:px-8 pb-6 sm:pb-8 -mt-14 sm:-mt-16 relative z-10">
                        <div className="flex flex-col xl:flex-row xl:items-end gap-6 xl:gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6 flex-1 min-w-0">
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-3 bg-primary/10 blur-2xl rounded-4xl" />
                                    <img
                                        alt="User Profile Avatar"
                                        className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-[1.75rem] object-cover shadow-2xl border-4 border-surface-container-high"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgqA1yvyroO159AD4HB0crZ6KnIWc7h8TS7p-F56NHdt8ztAUjgl3-yL6UByz-oEHyPkXYEarDLbic1UyNTaiz0zYHhror8dhZ77W9ZTejcHRTguQimKJHEtE81MqZLR6n8Vzn3Lvo6BF-v3RFgx54V-bad6EpfhcV1zgwXdiQ4q5r15BNNoBpj9TC3i1njjWgSLS64Ka8mNmmnUblOnkwI6S1sJdqMyEOUGqXc78EyDqKOUQWVJq95XUWGLSnSffORCvOTo0Mayc"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-surface-container-highest text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                                            Artist Pro
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                            Verified Creator
                                        </span>
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black font-headline tracking-tighter text-on-surface leading-none">
                                        Luna Nova
                                    </h2>
                                    <p className="text-slate-400 max-w-2xl mt-3 text-sm sm:text-base leading-relaxed">
                                        Curating the sounds of the neon underground.
                                        A cinematic blend of retro-wave, future soul,
                                        and late-night city energy for listeners who
                                        want atmosphere as much as rhythm.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <button className="flex-1 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold text-sm sm:text-base px-4 py-2 md:px-6 md:py-3 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-sm shadow-primary/20 whitespace-nowrap">
                                    Edit Profile
                                </button>
                                <button className="flex-1 glass-card hover:bg-surface-container-high/60 text-on-surface font-bold text-sm sm:text-base px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center justify-center gap-1.5 md:gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-xs sm:text-base">
                                        share
                                    </span>
                                    Share
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
                            {[
                                { value: "12.4K", label: "Followers", accent: "text-primary" },
                                { value: "842", label: "Following", accent: "text-on-surface" },
                                { value: "15", label: "Playlists", accent: "text-on-surface" },
                                { value: "68", label: "Clips", accent: "text-on-surface" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl bg-black/20 border border-white/5 px-4 py-4 sm:px-5 sm:py-5"
                                >
                                    <p className={`text-2xl sm:text-3xl font-bold font-headline ${stat.accent}`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-2">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-8">
                    <div className="space-y-8 min-w-0">
                        <div className="glass-card rounded-[1.75rem] border border-white/5 p-5 sm:p-6 lg:p-7">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <h3 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">
                                    Public Playlists
                                </h3>
                                <button className="text-primary text-sm font-bold hover:underline self-start sm:self-auto">
                                    View All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {playlists.map((playlist) => (
                                    <div
                                        key={playlist.title}
                                        className="group rounded-3xl bg-black/15 border border-white/5 p-4 hover:bg-white/4 transition-all duration-300"
                                    >
                                        <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square">
                                            <img
                                                alt={playlist.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                src={playlist.image}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-on-primary scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-primary/25">
                                                    <span
                                                        className="material-symbols-outlined text-3xl"
                                                        style={{ fontVariationSettings: '"FILL" 1' }}
                                                    >
                                                        play_arrow
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-headline font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                                            {playlist.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {playlist.meta}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-[1.75rem] border border-white/5 p-5 sm:p-6 lg:p-7">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <h3 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">
                                    Featured Clips
                                </h3>
                                <button className="text-primary text-sm font-bold hover:underline self-start sm:self-auto">
                                    See More
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {clips.map((clip) => (
                                    <div
                                        key={clip.title}
                                        className="flex items-center gap-4 rounded-2xl bg-black/15 border border-white/5 p-3 group cursor-pointer hover:bg-white/4 transition-colors"
                                    >
                                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 relative">
                                            <img
                                                alt={clip.title}
                                                className="w-full h-full object-cover"
                                                src={clip.image}
                                            />
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">
                                                    play_circle
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                                                {clip.title}
                                            </h4>
                                            <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                {clip.meta}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors shrink-0">
                                            north_east
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="glass-card rounded-[1.75rem] border border-white/5 p-5 sm:p-6">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold mb-3">
                                About
                            </p>
                            <p className="text-slate-300 text-sm leading-7">
                                Luna Nova designs immersive listening worlds for
                                night drives, creative sessions, and intimate room
                                takeovers. Each set is built to feel cinematic,
                                modern, and emotionally precise.
                            </p>

                            <div className="space-y-4 mt-6">
                                {activity.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-start justify-between gap-4 rounded-2xl bg-black/15 border border-white/5 px-4 py-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold">
                                                {item.label}
                                            </p>
                                            <p className="text-sm text-on-surface font-semibold mt-2">
                                                {item.value}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-primary shrink-0">
                                            bolt
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-[1.75rem] border border-white/5 p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold font-headline">
                                    Performance Snapshot
                                </h3>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                                    Live
                                </span>
                            </div>

                            <div className="space-y-5">
                                {[
                                    { label: "Monthly listeners", value: "1.2M", width: "w-[88%]" },
                                    { label: "Completion rate", value: "76%", width: "w-[76%]" },
                                    { label: "Room engagement", value: "91%", width: "w-[91%]" },
                                ].map((bar) => (
                                    <div key={bar.label}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-300">
                                                {bar.label}
                                            </span>
                                            <span className="text-xs font-bold text-primary">
                                                {bar.value}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-linear-to-r from-primary to-primary-container ${bar.width}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/5 bg-linear-to-br from-primary/12 to-transparent p-5 sm:p-6">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-primary font-bold mb-3">
                                Next Move
                            </p>
                            <h3 className="text-xl font-bold font-headline mb-2">
                                Launch a new spotlight set
                            </h3>
                            <p className="text-sm text-slate-400 leading-6 mb-5">
                                Publish a fresh listening room or featured clip to
                                keep this profile active and discoverable.
                            </p>
                            <button className="w-full rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary font-bold py-3 hover:scale-[1.01] transition-transform">
                                Create New Feature
                            </button>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
