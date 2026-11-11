import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Copy, X } from "lucide-react";

interface RoomInviteModalProps {
    roomId: string;
    roomName?: string;
    onClose: () => void;
}

export function buildInviteLink(roomId: string): string {
    return `${window.location.origin}/rooms/live?roomId=${encodeURIComponent(roomId)}&join=1`;
}

export function RoomInviteModal({ roomId, roomName, onClose }: RoomInviteModalProps) {
    const inviteLink = buildInviteLink(roomId);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            toast.success("Invite link copied");
        } catch {
            toast.error("Could not copy link");
        }
    };

    return (
        <div
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="glass-panel relative p-8 rounded-3xl border border-white/10 max-w-sm w-full text-center shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold font-headline text-white mb-1">Invite someone nearby</h2>
                <p className="text-xs text-slate-400 mb-6">
                    {roomName ? `${roomName}: ` : ""}scan this code with a phone camera to join and sync instantly.
                </p>
                <div className="bg-white p-4 rounded-2xl inline-block">
                    <QRCodeSVG value={inviteLink} size={208} level="M" />
                </div>
                <button
                    onClick={handleCopy}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-slate-200 transition-colors cursor-pointer"
                >
                    <Copy className="w-4 h-4" />
                    Copy invite link
                </button>
            </div>
        </div>
    );
}
