import { Heart } from 'lucide-react'

export default function GlobalPlayer() {
    return (
        <footer className="fixed bottom-23 lg:bottom-0 left-2 right-2 lg:left-0 lg:right-0 w-[calc(100%-16px)] 
            lg:w-full mx-auto h-16 md:h-20 lg:h-24 z-40 bg-surface-container-highest lg:bg-surface-container rounded-2xl 
            lg:rounded-none border border-white/5 lg:border-none flex items-center px-3 lg:px-8 
            shadow-[0_8px_32px_rgba(0,0,0,0.6)] justify-between overflow-hidden">
            {/* Left Box (Song Info) */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 overflow-hidden pr-2">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg overflow-hidden relative group shrink-0">
                    <img className="w-full h-full object-cover" alt="album art" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbPaNq7Q7ZAgLnuVTIukiGvL5aRKtzzIaIfMzoO64iPGRcq8fjimkLGfP3ZlOndsh5p1sh4kJBIQ79BnrlrE2vKOo77OJbZijj-lb-SoeHm0G4WhkU_dxuhCYFmjm-eITQrKfSnaFAMKGx_eWmkuUETBf-_OPaeH_ylB2gKM3yVIp2GqomD0yC5q-co4DG0fYf9QQpyMQ_GmVOm7-hDCVh-ax9TkcSYtqZdUGaBd2q3eKRgWXcqCl1zcai1tnaNcCqq-CEcBfV4Aw" />
                    <div className="absolute inset-0 bg-primary/20 animate-pulse hidden group-hover:block" />
                </div>
                <div className="flex flex-col min-w-0 flex-1 truncate">
                    <span className="text-on-background font-bold text-sm tracking-tight truncate block">Neon Dreams (Remix)</span>
                    <span className="text-slate-400 text-xs truncate block">Synthetic Horizon</span>
                </div>
            </div>
            
            {/* Middle Box (Controls) */}
            <div className="flex flex-col items-center gap-1 md:gap-2 shrink-0 px-2 lg:px-4 max-w-[40%]">
                <div className="flex items-center gap-2 md:gap-4 lg:gap-8 overflow-hidden">
                    <button className="text-slate-400 hover:text-primary transition-colors hidden lg:block shrink-0"><span className="material-symbols-outlined">shuffle</span></button>
                    <button className="text-white hover:text-primary transition-colors hidden md:block shrink-0"><span className="material-symbols-outlined">skip_previous</span></button>
                    <button className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg shrink-0">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>play_arrow</span>
                    </button>
                    <button className="text-white hover:text-primary transition-colors hidden md:block shrink-0"><span className="material-symbols-outlined">skip_next</span></button>
                    <button className="text-slate-400 hover:text-primary transition-colors hidden lg:block shrink-0"><span className="material-symbols-outlined">repeat</span></button>
                </div>
                
                {/* Progress bar: absolute full-width on mobile, inline on md */}
                <div className="absolute bottom-0 left-0 right-0 md:static w-full flex items-center md:gap-3 md:mt-1">
                    <span className="text-[10px] text-slate-500 font-mono hidden md:block shrink-0">1:42</span>
                    <div className="h-0.5 md:h-1 flex-1 bg-white/10 md:bg-surface-container-highest md:rounded-full relative md:min-w-[100px] lg:min-w-[200px]">
                        <div className="absolute h-full w-[40%] bg-primary md:rounded-full shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.6)]" />
                        <div className="absolute top-1/2 left-[40%] -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-primary hidden md:block" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono hidden md:block shrink-0">3:55</span>
                </div>
            </div>

            {/* Right Box (Actions) */}
            <div className="items-center justify-end gap-3 md:gap-4 lg:gap-6 flex-1 min-w-0 hidden sm:flex shrink-0">
                <button aria-label='add to fav' className="text-slate-400 hover:text-primary transition-colors shrink-0">
                    <Heart className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                <div className="flex items-center gap-2 lg:gap-3 group shrink-0">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-xl lg:text-2xl">volume_up</span>
                    <div className="w-12 md:w-16 lg:w-24 h-1 bg-surface-container-highest rounded-full relative hidden md:block">
                        <div className="absolute h-full w-[70%] bg-on-surface-variant/40 group-hover:bg-primary rounded-full transition-colors" />
                    </div>
                </div>
                <button className="text-slate-400 hover:text-primary transition-colors hidden md:block shrink-0"><span className="material-symbols-outlined text-xl lg:text-2xl">fullscreen</span></button>
            </div>
        </footer>
    );
}
