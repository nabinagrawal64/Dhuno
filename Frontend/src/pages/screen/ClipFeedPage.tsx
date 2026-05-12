import { Heart } from "lucide-react";

const clips = [
    {
        title: "Midnight Resonance",
        artist: "@cyber_pulse",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAU5ZiA_qUYVkC_PQ_-Zpgls_jb9l3B1ziGqlORu_CfaB4tbHR8_FCOOzWKbEWr5bOq-YEPZHeVJf9LU2gh0chz5SS5tzJ3qBjGcdFPg6XRbWKy3zrXPsjR7XnopR0yNukK6g-Yauu8gyEpWWEtX8ZrDTTMoIxu8L7eLIiCEW3jWBNo-0O3WJ4JiZm_00ZJkm0Fza58aSsTlbi7NGaBH8Y4HLRIKxs6Pe-cUqQoTNSoatS_mP0jX2I79i-jZT9OpBPpYysNfyWlmg",
    },
    {
        title: "Ethereal Chords",
        artist: "@strum_ghost",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYi4ZS1eIWGcGG-WxO9_mTbf5TggvZPCike518m5WZOB1UvGDHVgXybOmtfgRcBG7n4vw67Ii1gaAmIU-c6TuWHmtwkfrsrQBdEtm2PUWpDWuLhD9qk2KOh_ZIKQvgnQwZ_FTcRhapVUrEgHOUrEZymeMXg-NuQ6nROx42LTwRbJP2xXKIoZdSrzclgpDYstEX7Kd9rJlqkryANUc7R372iHa6_JfgbiW95iVkZFIsfI0NbSIGK91GkZFANdfsyFyxaTMlW3XriTw",
    },
    {
        title: "808 Distortion Loop",
        artist: "@bass_master",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmzKVKlMheVscJaYM5Od7fL_tbD2bA2dpZ0922K3vsEa8Gt31BQgXg4sKdojRhuBLCI5nlrYJ1MUZZYq0zhX09zWo-N9olFzAplNbBjLkGshDcwxB60Uz2W_PYbrgRX8b719pbsksIeWV_Y_DcBAVVY2f7vtCqftVKuydZI818mwWoi2B_HBBPsAMFAL93315RufRHZ3GWsZyq1ToDGlLJg-ylOZau0s89mNeanGDSJTrJ-JtXgn2o1S2z3BgL0S8OuA5dQOERI_U",
    },
    {
        title: "Velvet Vocals",
        artist: "@luna_melody",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzA0HGF0R0r6-JwPop3T6J-H25dJR9iG8Ynu9UfzQJWAEtZwRCKrJz5HXbOo2a2JOLEcmqnItTLFSEAlp00kb7s3LEgHBy-gO3xe-kJWKqwBuC9Ux2TXIO-Gi3lhUaS-hfgq4fY_9NrMneFzX0rHtba89TJwXHXMEKVseYqzhZP1JvYdZ08sWeJkRqZEw96KmEm76ZLyNTHceFCPBMfdGuCASgm990hRExI6acCTKJA-dur48TReDVwJA1loP_RNaCV7BYROnNUbs",
    },
];

export default function ClipFeedPage() {
    return (
        <div className="bg-background text-on-background font-body select-none min-h-screen overflow-hidden">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    .text-glow {
                        text-shadow: 0 0 12px rgba(90, 255, 225, 0.4);
                    }
                    .waveform-bar {
                        width: 3px;
                        background: #5affe1;
                        border-radius: 99px;
                        margin: 0 1px;
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    body {
                        min-height: max(884px, 100dvh);
                    }`,
                }}
            />

            <main className="pt-6 md:pt-12 lg:pt-20 pb-32 px-4 md:px-6 lg:px-8 h-screen overflow-y-auto no-scrollbar">
                <section className="mb-5 md:mb-8 flex flex-col gap-4">
                    <div className="flex items-center justify-between lg:justify-start gap-3 w-full">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tighter text-glow">
                                Sound Clips Discovery
                            </h1>
                        </div>
                        <a href="/notifications" className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors bg-surface-container-high rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">notifications</span>
                        </a>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 md:gap-6 gap-4">
                    {clips.map((clip, index) => (
                        <div
                            key={clip.title}
                            className={`group relative bg-surface-container rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                                index % 2 === 1 ? "xl:mt-10" : ""
                            }`}
                        >
                            <div className="aspect-3/4 relative">
                                <img
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    src={clip.image}
                                    alt={clip.title}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-surface-dim via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-24 left-6 right-6 flex items-end gap-0.5 h-12">
                                    <div className="waveform-bar h-[40%]" />
                                    <div className="waveform-bar h-[60%]" />
                                    <div className="waveform-bar h-[90%]" />
                                    <div className="waveform-bar h-[40%]" />
                                    <div className="waveform-bar h-[70%]" />
                                    <div className="waveform-bar h-full" />
                                    <div className="waveform-bar h-[50%]" />
                                    <div className="waveform-bar h-[80%]" />
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h2 className="text-xl font-bold font-headline mb-1">
                                        {clip.title}
                                    </h2>
                                    <p className="text-primary text-sm font-semibold tracking-wide">
                                        {clip.artist}
                                    </p>
                                </div>
                                <div className="absolute top-6 right-4 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button aria-label="make fav" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:text-red-400">
                                        <Heart className="h-5 w-5" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:text-primary">
                                        <span className="material-symbols-outlined">
                                            share
                                        </span>
                                    </button>
                                    <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:text-secondary">
                                        <span className="material-symbols-outlined">
                                            person_add
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
