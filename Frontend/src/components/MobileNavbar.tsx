import { Link, useLocation } from 'react-router-dom'

export default function MobileNavbar() {
    const location = useLocation();
    
    const getTabClass = (path: string) => {
        const isActive = location.pathname.startsWith(path);
        if (isActive) {
            return "flex flex-col items-center justify-center text-primary font-bold after:content-[''] after:w-1 after:h-1 after:bg-primary after:rounded-full after:mt-1 cursor-pointer";
        }
        return "flex flex-col items-center justify-center text-slate-500 hover:text-secondary transition-colors cursor-pointer group";
    };

    const getIconStyle = (path: string) => {
        return location.pathname.startsWith(path) ? { fontVariationSettings: '"FILL" 1' } : {};
    };

    return (
        <div className="lg:hidden">
            <nav className="fixed bottom-0 left-0 w-full bg-surface-container flex justify-around items-center pt-3 pb-6 px-4 rounded-t-[2rem] z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
                <Link to="/home" className={getTabClass('/home')}>
                    <span className="material-symbols-outlined text-2xl group-active:scale-90 duration-300" style={getIconStyle('/home')}>home</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Home</span>
                </Link>
                <Link to="/search" className={getTabClass('/search')}>
                    <span className="material-symbols-outlined text-2xl group-active:scale-90 duration-300" style={getIconStyle('/search')}>search</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Search</span>
                </Link>
                <Link to="/rooms/discovery" className={getTabClass('/rooms/discovery')}>
                    <span className="material-symbols-outlined text-2xl group-active:scale-90 duration-300" style={getIconStyle('/rooms')}>groups</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Rooms</span>
                </Link>
                <Link to="/clips" className={getTabClass('/clips')}>
                    <span className="material-symbols-outlined text-2xl group-active:scale-90 duration-300" style={getIconStyle('/clips')}>movie_filter</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Clips</span>
                </Link>
                <Link to="/library" className={getTabClass('/library')}>
                    <span className="material-symbols-outlined text-2xl group-active:scale-90 duration-300" style={getIconStyle('/library')}>library_music</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Library</span>
                </Link>
            </nav>
        </div>
    );
}