import { useEffect, useRef, useState, type ReactNode } from 'react'
import GlobalPlayer from './GlobalPlayer'
import MobileNavbar from './MobileNavbar'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'

function resolveRouteFromAnchor(anchor: HTMLAnchorElement) {
    const href = (anchor.getAttribute('href') ?? '').trim().toLowerCase()
    if (href.startsWith('/')) {
        return href
    }

    const text = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
    const iconText = (
        anchor.querySelector('.material-symbols-outlined')?.textContent ?? ''
    ).trim().toLowerCase()
    const combined = `${text} ${iconText}`

    if (combined.includes('home')) return '/home'
    if (combined.includes('search') || combined.includes('discover')) return '/search'
    if (combined.includes('library')) return '/library'
    if (combined.includes('profile') || combined.includes('person')) return '/profile'
    if (combined.includes('room') || combined.includes('groups')) return '/rooms/discovery'
    if (combined.includes('live') || combined.includes('session')) return '/rooms/live'
    if (combined.includes('create')) return '/rooms/create'
    if (combined.includes('player')) return '/player'
    if (combined.includes('notification') || combined.includes('notify')) return '/notifications'

    return null
}

function UnifiedSidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
    const location = useLocation()
    const isMobile = useIsMobile(1024)

    const links = [
        { to: '/home', label: 'Home', icon: 'home' },
        { to: '/search', label: 'Search', icon: 'search' },
        { to: '/library', label: 'Library', icon: 'library_music' },
        { to: '/rooms/discovery', label: 'Rooms', icon: 'groups' },
        { to: '/profile', label: 'Profile', icon: 'person' },
        { to: '/notifications', label: 'Notify', icon: 'notifications' },
    ]

    return (
        <aside
            data-unified-sidebar="true"
            className={"top-0 z-70 flex h-screen flex-col border-r border-primary/15 bg-surface-container-lowest py-6 transition-[width,padding] duration-300 ease-out " + (isMobile ? 'w-64 px-4 shadow-2xl relative' : 'fixed left-0 ') + (isOpen && !isMobile ? 'w-64 px-4' : !isOpen && !isMobile ? 'w-22 px-3' : '')}
        >
            <div className={"mb-8 flex items-center " + (isOpen ? 'justify-between px-2' : 'justify-center')}>
                <div
                    className={"overflow-hidden transition-all duration-300 " + (isOpen ? 'max-w-45 opacity-100' : 'max-w-0 opacity-0')}
                >
                    <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-primary">Dhuno</h1>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                        Neon Nocturne
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-container-high/40 text-on-surface-variant transition-colors hover:text-primary"
                    aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isMobile ? 'close' : (isOpen ? 'left_panel_close' : 'left_panel_open')}
                    </span>
                </button>
            </div>

            <nav className="space-y-1.5">
                {links.map((link) => {
                    const isActive = location.pathname === link.to

                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={"flex items-center rounded-xl py-3 text-sm font-bold transition-all " + (isOpen ? 'gap-3 px-4' : 'justify-center px-0') + " " + (isActive ? 'bg-primary/20 text-primary shadow-[0_0_16px_rgba(var(--color-primary-rgb),0.18)]' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface')}
                        >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden>
                                {link.icon}
                            </span>
                            <span
                                className={"overflow-hidden whitespace-nowrap transition-all duration-300 " + (isOpen ? 'max-w-30 opacity-100' : 'max-w-0 opacity-0')}
                            >
                                {link.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            <div
                className={"mt-auto rounded-2xl border border-white/10 bg-surface-container-high/40 transition-all duration-300 " + (isOpen ? 'p-3' : 'p-2')}
            >
                <p
                    className={"text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-all duration-300 " + (isOpen ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0')}
                >
                    Logged in
                </p>
                <p
                    className={"text-sm font-bold text-on-surface transition-all duration-300 " + (isOpen ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0')}
                >
                    Dhuno User
                </p>
                {!isOpen ? (
                    <div className="mx-auto h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]" />
                ) : null}
            </div>
        </aside>
    )
}

export default function AppPage({ children }: { children: ReactNode }) {
    const rootRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const location = useLocation()
    // Treat widths below 1024px (lg) as mobile to hide the sidebar on md screens
    const isMobile = useIsMobile(1024)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const desktopLeft = sidebarOpen ? '16rem' : '88px'
    const desktopWidth = sidebarOpen ? 'calc(100vw - 16rem)' : 'calc(100vw - 88px)'

    const routeClass =
        location.pathname === '/home'
            ? 'route-home'
            : location.pathname === '/search'
                ? 'route-search'
                : location.pathname === '/library'
                    ? 'route-library'
                    : location.pathname === '/player'
                            ? 'route-player'
                            : location.pathname === '/notifications'
                                ? 'route-notifications'
                                : location.pathname.startsWith('/rooms')
                                        ? 'route-rooms'
                                        : 'route-default'

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const onClick = (event: Event) => {
            const target = event.target as HTMLElement | null
            const anchor = target?.closest('a') as HTMLAnchorElement | null
            if (!anchor) return

            const route = resolveRouteFromAnchor(anchor)
            if (!route) return

            event.preventDefault()
            navigate(route)
        }

        root.addEventListener('click', onClick)
        return () => root.removeEventListener('click', onClick)
    }, [navigate])

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const scope = (root.querySelector('.desktop-shell') as HTMLElement | null) ?? root

        const cleanup: Array<() => void> = []
        const inputs = Array.from(
            scope.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="search"]'),
        )

        if (location.pathname !== '/search') {
            for (const input of inputs) {
                const placeholder = (input.getAttribute('placeholder') ?? '').toLowerCase()
                if (!placeholder.includes('search') && !placeholder.includes('artists, songs')) {
                    continue
                }

                let target: HTMLElement =
                    input.closest<HTMLElement>('label') ?? input.closest<HTMLElement>('.relative') ?? input

                const parent = target.parentElement
                if (
                    parent &&
                    /(^|\s)flex-1(\s|$)/.test(parent.className) &&
                    parent.querySelectorAll('input').length === 1
                ) {
                    target = parent
                }

                const previousDisplay = target.style.display
                target.style.display = 'none'
                cleanup.push(() => {
                    target.style.display = previousDisplay
                })
            }
        }

        const killIcons = new Set([
            'notifications',
            'settings',
            'help_outline',
            'help',
            'info',
            'info_outline',
        ])

        const iconNodes = Array.from(scope.querySelectorAll('.material-symbols-outlined'))
        for (const node of iconNodes) {
            const iconName = (node.textContent ?? '').trim().toLowerCase()
            if (!killIcons.has(iconName)) {
                continue
            }

            const host =
                (node.closest('button, a') as HTMLElement | null) ??
                (node.parentElement as HTMLElement | null)

            if (!host) {
                continue
            }

            if (host.closest('[data-unified-sidebar="true"]')) {
                continue
            }

            const previousDisplay = host.style.display
            host.style.display = 'none'
            cleanup.push(() => {
                host.style.display = previousDisplay
            })
        }

        return () => {
            cleanup.forEach((restore) => restore())
        }
    }, [location.pathname])

    return (
        <div ref={rootRef} className="relative min-h-screen">
            {/* Desktop Sidebar */}
            {!isMobile ? <UnifiedSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} /> : null}

            {!isMobile ? (
                <>
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                .desktop-shell aside { display: none !important; }
                .desktop-shell [class*="ml-64"] { margin-left: 0 !important; }
                .desktop-shell [class*="left-64"] { left: ${desktopLeft} !important; }
                .desktop-shell [class*="w-[calc(100vw-16rem)]"] { width: ${desktopWidth} !important; }
                
                /* Hide headers globally except for the search page */
                .desktop-shell:not(.route-search) header { display: none !important; }
                
                /* Restore positioning for the search header */
                .desktop-shell.route-search header {
                  left: ${desktopLeft} !important;
                  width: ${desktopWidth} !important;
                  transition: left 300ms ease-out, width 300ms ease-out !important;
                  display: flex !important; /* Ensure it is flex as per SearchPage design */
                }
                
                .desktop-shell.route-player main {
                  padding: 0 !important;
                  margin: 0 !important;
                  max-width: 100% !important;
                  height: 100vh !important;
                }
                .desktop-shell.route-player .lg\\:ml-64 { margin-left: 0 !important; }
                
                .desktop-shell:not(.route-player) footer {
                  left: ${desktopLeft} !important;
                  width: ${desktopWidth} !important;
                  transition: left 300ms ease-out, width 300ms ease-out !important;
                }

                .desktop-shell.route-notifications nav[class*="top"],
                .desktop-shell.route-settings nav[class*="top"] {
                  display: none !important;
                }
                @media (min-width: 1024px) {
                  .desktop-shell:not(.route-player):not(.route-search) main {
                    margin-top: 0 !important;
                    padding: 2rem 2rem 8rem 2rem !important;
                    height: 100vh !important;
                    overflow-y: auto !important;
                    box-sizing: border-box !important;
                  }
                  .desktop-shell.route-search main {
                    padding: 2rem 2rem 8rem 2rem !important;
                    height: 100vh !important;
                    overflow-y: auto !important;
                    box-sizing: border-box !important;
                  }
                }
                .desktop-shell.route-notifications main,
                .desktop-shell.route-settings main {
                  margin-top: 0 !important;
                  padding-top: 2rem !important;
                  height: 100vh !important;
                }
                .desktop-shell:not(.route-player) main h1,
                .desktop-shell:not(.route-player) main h2.text-4xl,
                .desktop-shell:not(.route-player) main h1.text-4xl,
                .desktop-shell:not(.route-player) main [class*="text-4xl"],
                .desktop-shell:not(.route-player) main [class*="text-5xl"] {
                  font-size: 3rem !important;
                  line-height: 1 !important;
                  font-weight: 800 !important;
                  letter-spacing: -0.05em !important;
                  margin-bottom: 0.5rem !important;
                }
                .desktop-shell:not(.route-player) main h1 + p,
                .desktop-shell:not(.route-player) main h2 + p {
                  font-size: 1rem !important;
                  margin-top: 0.5rem !important;
                  color: #94a3b8 !important;
                  max-width: 28rem !important;
                }
              `
                        }}
                    />
                    <div
                        className={"desktop-shell " + routeClass + " min-h-screen overflow-x-hidden transition-[margin-left,width] duration-300 ease-out " + (sidebarOpen ? 'ml-64 w-[calc(100vw-16rem)]' : 'ml-22 w-[calc(100vw-88px)]')}
                    >
                        {children}
                        {location.pathname !== '/player' && <GlobalPlayer />}
                        <MobileNavbar />
                    </div>
                </>
            ) : (
                <>
                    {children}
                    {location.pathname !== '/player' && <GlobalPlayer />}
                    <MobileNavbar />
                </>
            )}
        </div>
    )
}
