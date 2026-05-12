import { useSessionTimeout } from '../hooks/useSessionTimeout';

export default function SessionTimeoutWarning() {
    const { showWarning, secondsRemaining, handleExtendSession, handleLogout } =
        useSessionTimeout();

    if (!showWarning) return null;

    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-surface-dim rounded-3xl border border-white/10 p-8 max-w-md w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-orange-400 text-2xl">
                            schedule
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-on-surface">
                            Session Expiring
                        </h2>
                        <p className="text-sm text-slate-400">
                            You'll be logged out soon
                        </p>
                    </div>
                </div>

                {/* Message */}
                <p className="text-slate-300 mb-6 leading-relaxed">
                    Due to inactivity, your session will expire in{' '}
                    <span className="font-bold text-orange-400">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </span>
                    . Stay logged in or you'll be signed out.
                </p>

                {/* Countdown Bar */}
                <div className="mb-8">
                    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-1000"
                            style={{
                                width: `${(secondsRemaining / (INACTIVITY_LOGOUT_TIME / 1000)) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-3 rounded-full border border-slate-600 text-slate-300 font-semibold hover:bg-red-600/10 hover:border-red-500 hover:text-red-400 transition-colors"
                    >
                        Logout Now
                    </button>
                    <button
                        onClick={handleExtendSession}
                        className="px-4 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                        Stay Logged In
                    </button>
                </div>

                {/* Info */}
                <p className="text-xs text-slate-500 text-center mt-4">
                    Your activity was inactive for 5 minutes
                </p>
            </div>
        </div>
    );
}

// Add to top of component for countdown styling
const INACTIVITY_LOGOUT_TIME = 2 * 60 * 1000;
