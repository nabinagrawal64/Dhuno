import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { Music2, Sparkles, ChartColumnBig, UserRound, Clapperboard } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import GlobalPlayer from './GlobalPlayer';

const artistLinks = [
    { to: '/artist/dashboard', label: 'Dashboard', icon: Sparkles },
    { to: '/artist/songs', label: 'Songs', icon: Music2 },
    { to: '/artist/clips', label: 'Clips', icon: Clapperboard },
    { to: '/artist/analytics', label: 'Analytics', icon: ChartColumnBig },
    { to: '/artist/profile', label: 'Profile', icon: UserRound },
];

function ArtistMobileNav() {
    const location = useLocation();

    const tabClass = (path: string) => {
        const isActive = location.pathname.startsWith(path);
        return `flex flex-col items-center justify-center transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-secondary'}`;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 rounded-t-3xl bg-surface-container/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-5 gap-2 text-center">
                <Link to="/artist/dashboard" className={tabClass('/artist/dashboard')}>
                    <span className={`material-symbols-outlined text-2xl ${location.pathname.startsWith('/artist/dashboard') ? 'text-primary' : ''}`}>dashboard</span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest">Dash</span>
                </Link>
                <Link to="/artist/songs" className={tabClass('/artist/songs')}>
                    <span className={`material-symbols-outlined text-2xl ${location.pathname.startsWith('/artist/songs') ? 'text-primary' : ''}`}>music_note</span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest">Songs</span>
                </Link>
                <Link to="/artist/clips" className={tabClass('/artist/clips')}>
                    <span className={`material-symbols-outlined text-2xl ${location.pathname.startsWith('/artist/clips') ? 'text-primary' : ''}`}>movie_filter</span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest">Clips</span>
                </Link>
                <Link to="/artist/analytics" className={tabClass('/artist/analytics')}>
                    <span className={`material-symbols-outlined text-2xl ${location.pathname.startsWith('/artist/analytics') ? 'text-primary' : ''}`}>query_stats</span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest">Stats</span>
                </Link>
                <Link to="/artist/profile" className={tabClass('/artist/profile')}>
                    <span className={`material-symbols-outlined text-2xl ${location.pathname.startsWith('/artist/profile') ? 'text-primary' : ''}`}>person</span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest">Profile</span>
                </Link>
            </div>
        </nav>
    );
}

export default function ArtistAppPage({ children }: { children: ReactNode }) {
    const location = useLocation();
    const isMobile = useIsMobile(1024);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const desktopLeft = sidebarOpen ? '18rem' : '88px';
    const desktopWidth = sidebarOpen ? 'calc(100vw - 18rem)' : 'calc(100vw - 88px)';

    return (
        <div className="min-h-screen bg-background text-on-background artist-desktop-shell">
            {!isMobile ? (
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                            @media (min-width: 1024px) {
                                .artist-desktop-shell footer {
                                    left: ${desktopLeft} !important;
                                    width: ${desktopWidth} !important;
                                    transition: left 300ms ease-out, width 300ms ease-out !important;
                                }
                            }
                        `
                    }}
                />
            ) : null}

            <aside className={`fixed left-0 top-0 hidden h-screen flex-col border-r border-white/10 bg-surface-container-lowest/95 py-6 backdrop-blur-xl transition-[width,padding] duration-300 ease-out lg:flex ${sidebarOpen ? 'w-72 px-5' : 'w-22 px-3'}`}>
                <div className={`mb-8 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'max-w-44 opacity-100' : 'max-w-0 opacity-0'}`}>
                        <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-primary">Dhuno</h1>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                            Artist Studio
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-container-high/40 text-on-surface-variant transition-colors hover:text-primary"
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >   
                        <span className="material-symbols-outlined text-[20px]">
                            {sidebarOpen ? 'left_panel_close' : 'left_panel_open'}
                        </span>
                    </button>
                </div>

                <nav className="space-y-2">
                    {artistLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname.startsWith(link.to);
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center rounded-2xl py-3 text-sm font-bold transition-all ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'} ${isActive ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
                            >
                                <Icon className="h-4.5 w-4.5" />
                                <span
                                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'max-w-28 opacity-100' : 'max-w-0 opacity-0'}`}
                                >
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={`mt-auto rounded-3xl border border-white/10 bg-surface-container-high/40 transition-all duration-300 ${sidebarOpen ? 'p-4' : 'p-2'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-all duration-300 ${sidebarOpen ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                        Current Mode
                    </p>
                    <p className={`mt-1 text-sm font-bold text-on-surface transition-all duration-300 ${sidebarOpen ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                        Artist Dashboard
                    </p>
                    <p className={`mt-2 text-xs leading-relaxed text-slate-400 transition-all duration-300 ${sidebarOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                        Manage releases, clips, and audience growth from one place.
                    </p>
                    {!sidebarOpen ? <div className="mx-auto h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]" /> : null}
                </div>
            </aside>

            <div className={`min-h-screen ${sidebarOpen ? 'lg:pl-72 pb-24' : 'lg:pl-22 pb-24'}`}>
                <header className="sticky top-0 z-40 border-b border-white/10 bg-background/75 px-4 py-4 backdrop-blur-xl lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Artist Studio</p>
                            <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                {location.pathname === '/artist/dashboard' && 'Dashboard'}
                                {location.pathname === '/artist/songs' && 'Songs'}
                                {location.pathname === '/artist/clips' && 'Clips'}
                                {location.pathname === '/artist/analytics' && 'Analytics'}
                                {location.pathname === '/artist/profile' && 'Profile'}
                            </h2>
                        </div>
                    </div>
                </header>

                <main className={'px-4 py-6 pb-20 lg:px-8 lg:py-8'}>
                    {children}
                </main> 

                <GlobalPlayer />
                <ArtistMobileNav />
            </div>
        </div>
    );
}
