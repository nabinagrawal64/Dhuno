

import { Heart } from 'lucide-react'

export default function FullPlayerPage() {
  return (
    <div className="bg-surface-dim text-on-surface font-body overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
        }
        .glass-panel {
            background: rgba(28, 32, 39, 0.4);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }
        .glow-bloom {
            filter: blur(120px);
            opacity: 0.25;
            background: radial-gradient(circle, #5affe1 0%, transparent 70%);
        }
        .text-glow {
            text-shadow: 0 0 20px rgba(90, 255, 225, 0.4);
        }

.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            user-select: none;
        }
        .glow-bloom {
            filter: blur(80px);
            opacity: 0.25;
        }
        .glass-panel {
            backdrop-filter: blur(16px);
            background: rgba(28, 32, 39, 0.4);
        }

body {
      min-height: max(884px, 100dvh);
    }` }} />
      <div>{/* Immersive Background Atmosphere */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] glow-bloom" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] glow-bloom" style={{background: 'radial-gradient(circle, #92ccff 0%, transparent 70%)'}} />
          <div className="absolute inset-0 bg-[#0a0e15]/60" />
        </div>
        {/* Main Canvas */}
        <main className="relative z-10 grid grid-cols-12 h-screen w-full">
          {/* Left Drawer: Queue */}
          <aside className="col-span-3 h-full py-12 pl-12 pr-6">
            <div className="glass-panel h-full rounded-[2rem] p-8 flex flex-col space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold tracking-tight">Up Next</h2>
                <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary transition-colors">playlist_play</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                {/* Queue Item 1 */}
                <div className="group flex items-center gap-4 cursor-pointer">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img className="w-full h-full object-cover rounded-lg" data-alt="Abstract electronic music album cover with neon geometric shapes and dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbRKnGZOtDjW8GbsifDvvXvcHrexF8ajpWiKB4upIKpTln6OviYq0CsS8RQ_s8UbVcyHM3atxe6oVDewTyROyi0eHRz2WLwC349kWMn9oM0jIkQcwMjJX01amOgPMDfKg3dB-PJvTrc5tRPHg5PCDgBw_W8wFrHI3-GPKiOT2_ksNKUq5aJZNi5dlQC7DDYviOyaCiaWZCdF-1G4rKiEL5yDH0CLgCLrwoZON4kcatymD-OGDUqlGTFfRfQK1kP0kGi-Uks0YzNmc" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Digital Mirage</p>
                    <p className="text-xs text-slate-400 font-medium">Synthwave Collective</p>
                  </div>
                  <span className="text-xs text-slate-500">3:42</span>
                </div>
                {/* Queue Item 2 */}
                <div className="group flex items-center gap-4 cursor-pointer">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img className="w-full h-full object-cover rounded-lg" data-alt="Atmospheric landscape album art with deep purples and high contrast silhouette" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI_xTGo8eb6sQXEgMw10hrkEI8MpYNP-vOXNJiCWNdVjmTuzaeKw3k2FQiczw4pUqkCrw_qZHlZ1dVdDujD_Afq-E3r4TSbEXQSbzTiqWt6_8c_-Jy0HOxXr0BTP5Rj0F8bZ55jR_70_Ost2UnMDIFmAClzJtpL6imsgm_XsBFiLgjkw0-2XifoEdEEbwXBOO8rvujEc5j91TFTcEu0JyXQStw8khM474qS9cWX82ysPTBnJ88dABZUQMrmT6vmPP0iXIWrnuc46E" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Subliminal Echoes</p>
                    <p className="text-xs text-slate-400 font-medium">Neon Dreams</p>
                  </div>
                  <span className="text-xs text-slate-500">4:15</span>
                </div>
                {/* Queue Item 3 */}
                <div className="group flex items-center gap-4 cursor-pointer">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img className="w-full h-full object-cover rounded-lg" data-alt="Close-up of vintage synthesizer knobs under blue and pink stage lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPeFBLGEAL-1tPuz3Ns0LN3uSkGNgDt2JXGo0MtCAa7UiCsi-kpV-QEBWxVYcSEKspSlsiwquwKTY2GqeVDcoLywgSLivVB_FIP6S9ZuE5ifaYJGyEsAJ4OSw-DWNtZEAf1ybmGSgJ-7NAiajmj2c_d5EBAbuYunIoKEk3s2CqIEjRoZAywkvGALN04inSi9fWo9j1aGrOT5v6VSXvReH0StD_LkgeXpwEjZ4kbKe5ULBNQ3lBwTF28Efw_duuST8gUbnQSxJiLyA" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Wired Hearts</p>
                    <p className="text-xs text-slate-400 font-medium">Cyber Punk</p>
                  </div>
                  <span className="text-xs text-slate-500">2:58</span>
                </div>
              </div>
            </div>
          </aside>
          {/* Center: Artwork & Core Info */}
          <div className="col-span-6 flex flex-col items-center justify-center py-12 px-8">
            <div className="relative group">
              {/* Audio Reactive Pulse Glow (Layered) */}
              <div className="absolute -inset-10 bg-primary/20 blur-[60px] rounded-full scale-110 opacity-70 group-hover:scale-125 transition-transform duration-700" />
              {/* Main Artwork */}
              <div className="relative z-10 w-[420px] h-[420px] rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <img className="w-full h-full object-cover" data-alt="Vibrant abstract 3D artwork with flowing liquid textures in turquoise, purple and black" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjgTF5FTruNb7Lz63Bczeg7Qd12QE2tmZBhRara3YfHpifrMJ8qHuIeoyIKnm6tlB0EPCiEl7H0WPA46wwOu-AUgB0dAd5jiepH1Vd6B-QbsV9NLAuPIwll5YdIb1lYQ4kMWTq-edFRMqysXm5ffeItP9yz_bKdx3oYTfGIa8eUcyegYOsyDP3zRnOrK8HnRK5tHZDgan9C4ADp0hq35Hniw3ocjY0Tg2_08ChozS3nGGs-Cz3SLCiRMho33Hwt6XOkrBdU0zsvx4" />
              </div>
            </div>
            {/* Typography Header */}
            <div className="mt-16 text-center">
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface mb-3 text-glow">Electric Midnight</h1>
              <p className="font-body text-xl font-medium text-primary tracking-wide">The Neon Nocturne</p>
            </div>
            {/* Contextual Actions */}
            <div className="mt-8 flex items-center gap-6">
              <button className="p-4 rounded-full glass-panel hover:text-primary transition-all active:scale-95 group">
                <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full glass-panel flex items-center gap-2 hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined">add_circle</span>
                <span className="font-semibold text-sm">Add to Playlist</span>
              </button>
              <button className="p-4 rounded-full glass-panel hover:text-primary transition-all active:scale-95 group">
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">share</span>
              </button>
            </div>
          </div>
          {/* Right Drawer: Settings & Output */}
          <aside className="col-span-3 h-full py-12 pr-12 pl-6">
            <div className="glass-panel h-full rounded-[2rem] p-8 flex flex-col space-y-10 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
              {/* Output Selection */}
              <div className="space-y-4">
                <h2 className="font-headline text-lg font-bold">Connect to Device</h2>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>speaker_group</span>
                  <div>
                    <p className="text-sm font-bold text-primary">Studio Monitors</p>
                    <p className="text-[10px] text-primary/60 uppercase tracking-widest">Active High-Fidelity</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="p-4 rounded-2xl hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-slate-400">headphones</span>
                      <p className="text-sm font-medium text-slate-300">Wireless Headset</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-slate-400">laptop_mac</span>
                      <p className="text-sm font-medium text-slate-300">MacBook Speakers</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Lyrics Snippet / Meta */}
              <div className="flex-1 space-y-4">
                <h2 className="font-headline text-lg font-bold">Lyrics</h2>
                <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
                  <p className="text-lg leading-relaxed font-semibold">Floating in the electric haze...</p>
                  <p className="text-lg leading-relaxed text-primary font-bold">Watching as the city starts to fade...</p>
                  <p className="text-lg leading-relaxed font-semibold">Neon lights are all I need today.</p>
                </div>
              </div>
              {/* Quality Indicator */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-primary text-on-primary">HI-RES</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">FLAC â€¢ 24-bit</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 cursor-pointer">info</span>
                </div>
              </div>
            </div>
          </aside>
        </main>
        {/* Bottom Controls Cluster */}
        
        {/* Immersive Backdrop Particles (Static Representation) */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-20 left-[15%] w-1 h-1 bg-white/20 rounded-full" />
          <div className="absolute top-40 right-[25%] w-1.5 h-1.5 bg-primary/30 rounded-full" />
          <div className="absolute bottom-60 left-[40%] w-1 h-1 bg-secondary/20 rounded-full" />
          <div className="absolute bottom-20 right-[10%] w-2 h-2 bg-white/10 rounded-full" />
        </div>
        {/* Mobile Bottom NavBar (hidden on desktop) */}
        </div>
    </div>
  );
}
