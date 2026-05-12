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

    return (
        <div className="lg:hidden">
            <nav className="fixed bottom-0 left-0 w-full bg-surface-container flex justify-around items-center pt-3 pb-2.5 px-4 rounded-t-4xl z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
                <Link to="/home" className={getTabClass('/home')}>
                    <span className={`material-symbols-outlined text-2xl group-active:scale-90 duration-300 ${location.pathname.startsWith('/home') ? 'text-primary' : ''}`}>home</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Home</span>
                </Link>
                <Link to="/search" className={getTabClass('/search')}>
                    <span className={`material-symbols-outlined text-2xl group-active:scale-90 duration-300 ${location.pathname.startsWith('/search') ? 'text-primary' : ''}`}>search</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Search</span>
                </Link>
                <Link to="/rooms/discovery" className={getTabClass('/rooms/discovery')}>
                    <span className={`material-symbols-outlined text-2xl group-active:scale-90 duration-300 ${location.pathname.startsWith('/rooms') ? 'text-primary' : ''}`}>groups</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Rooms</span>
                </Link>
                <Link to="/library" className={getTabClass('/library')}>
                    <span className={`material-symbols-outlined text-2xl group-active:scale-90 duration-300 ${location.pathname.startsWith('/library') ? 'text-primary' : ''}`}>library_music</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Library</span>
                </Link>
                <Link to="/profile" className={getTabClass('/profile')}>
                    <span className={`material-symbols-outlined text-2xl group-active:scale-90 duration-300 ${location.pathname.startsWith('/profile') ? 'text-primary' : ''}`}>person</span>
                    <span className="font-manrope text-[10px] uppercase tracking-widest mt-1">Profile</span>
                </Link>
            </nav>
        </div>
    );
}