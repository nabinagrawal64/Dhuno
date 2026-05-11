import { useState } from 'react'
import ThemePicker from '../../components/ThemePicker'

type SettingsTab = 'account' | 'appearance'

const accountSections = [
    {
        title: 'Profile',
        description: 'Update your public identity and contact details.',
    },
    {
        title: 'Security',
        description: 'Password, sessions, and two-factor protection.',
    },
    {
        title: 'Devices',
        description: 'Review active logins across phones and desktops.',
    },
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account')

    return (
        <div className="overflow-hidden bg-surface-dim text-on-surface min-h-screen">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-panel {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    .glow-shadow {
                        box-shadow: 0 0 20px rgba(90, 255, 225, 0.05);
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    body {
                        background-color: #0f131b;
                        color: #dfe2ed;
                        font-family: 'Manrope', sans-serif;
                        min-height: max(884px, 100dvh);
                    }`,
                }}
            />

            <main className="pt-6 md:pt-12 lg:pt-20 md:pb-28 pb-20 px-4 md:px-6 lg:px-8 h-screen overflow-y-auto no-scrollbar">
                <section className="mb-5 flex items-center gap-3">
                    <button
                        className="lg:hidden p-1 -ml-2 text-slate-400 hover:text-white shrink-0"
                        onClick={() =>
                            document.dispatchEvent(
                                new CustomEvent('toggle-mobile-sidebar'),
                            )
                        }
                    >
                        <span className="material-symbols-outlined text-3xl">
                            menu
                        </span>
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline tracking-tighter mt-1">
                            Settings
                        </h1>
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8">
                    <div className="glass-panel rounded-[1.75rem] border border-white/5 p-4 sm:p-5 glow-shadow h-fit">
                        <div className="mb-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-bold mb-2">
                                Settings Menu
                            </p>
                            <p className="text-sm text-slate-400 leading-6">
                                Manage account details, security, appearance, and
                                device preferences.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                            <button
                                onClick={() => setActiveTab('account')}
                                className={
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-150 ' +
                                    (activeTab === 'account'
                                        ? 'bg-primary/15 text-primary border border-primary/20'
                                        : 'bg-black/10 text-slate-400 border border-transparent hover:bg-white/5 hover:text-on-surface')
                                }
                            >
                                <span className="material-symbols-outlined">
                                    account_circle
                                </span>
                                <div>
                                    <p className="font-bold text-sm">Account</p>
                                    <p className="text-[11px] opacity-80">
                                        Profile and security
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab('appearance')}
                                className={
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-150 ' +
                                    (activeTab === 'appearance'
                                        ? 'bg-primary/15 text-primary border border-primary/20'
                                        : 'bg-black/10 text-slate-400 border border-transparent hover:bg-white/5 hover:text-on-surface')
                                }
                            >
                                <span className="material-symbols-outlined">
                                    palette
                                </span>
                                <div>
                                    <p className="font-bold text-sm">Appearance</p>
                                    <p className="text-[11px] opacity-80">
                                        Theme and visual style
                                    </p>
                                </div>
                            </button>
                        </div>

                        <div className="mt-5 rounded-2xl bg-black/15 border border-white/5 p-4">
                            <p className="text-xs text-slate-400 mb-2">Current Plan</p>
                            <p className="text-sm font-bold text-primary mb-4">
                                Dhuno Free
                            </p>
                            <button className="w-full py-3 rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary text-sm font-bold active:scale-95 transition-transform">
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>

                    <section className="min-w-0">
                        <div className="glass-panel rounded-[1.75rem] border border-white/5 p-5 sm:p-6 lg:p-8 glow-shadow">
                            <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tighter capitalize">
                                        {activeTab} Settings
                                    </h2>
                                    <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base leading-6">
                                        {activeTab === 'account'
                                            ? 'Manage your public profile, password, connected devices, and access settings.'
                                            : 'Customize the look and feel of Dhuno across all of your screens and sessions.'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.24em]">
                                    <span>Synced</span>
                                    <span className="material-symbols-outlined text-sm">
                                        cloud_done
                                    </span>
                                </div>
                            </header>

                            {activeTab === 'account' ? (
                                <div className="space-y-6">
                                    <section className="rounded-[1.5rem] bg-black/15 border border-white/5 p-5 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                                            <div className="relative group cursor-pointer shrink-0">
                                                <img
                                                    alt="Profile Image"
                                                    className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 transition-all group-hover:ring-primary/40"
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHcMv5N28xmPdNBJRuDxGAdxI9-k-rRcJBJFKOTdpBJVz-bYTYRZRd8QZhXY4GkWXfwNjq4jGIPopGcIDdM1KrOj7F0lj8Co37LY4_n8EoFrhDCmEC4W5LKOBs8cJ4OcQ_1pnDzXLAZhVEZBqqYIIVKLpWcoFeWIL8OM4HT7Yd3-vlJPObNC9atJd-bL8_VIMgtqxW7a0rHSUuznltJJWvV2pvCRd9zg92MxwKOlCrvPHBPJORs6gsdvKbIxIkqM1dgzd2-v7IQKwM"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-primary">
                                                        edit
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-bold text-on-surface mb-1">
                                                    Elena Vance
                                                </h3>
                                                <p className="text-slate-500 text-sm">
                                                    Profile picture visible to followers
                                                    and room members.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <label className="space-y-2 block">
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                                    Full Name
                                                </span>
                                                <input
                                                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                                    type="text"
                                                    defaultValue="Elena Vance"
                                                />
                                            </label>
                                            <label className="space-y-2 block">
                                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                                    Email Address
                                                </span>
                                                <input
                                                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                                    type="email"
                                                    defaultValue="elena.vance@dhunomusic.com"
                                                />
                                            </label>
                                        </div>
                                    </section>

                                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {accountSections.map((section) => (
                                            <div
                                                key={section.title}
                                                className="rounded-[1.5rem] bg-black/15 border border-white/5 p-5"
                                            >
                                                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4">
                                                    <span className="material-symbols-outlined">
                                                        {section.title === 'Profile'
                                                            ? 'badge'
                                                            : section.title === 'Security'
                                                                ? 'verified_user'
                                                                : 'devices'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-on-surface mb-2">
                                                    {section.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 leading-6">
                                                    {section.description}
                                                </p>
                                            </div>
                                        ))}
                                    </section>

                                    <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5">
                                        <div className="rounded-[1.5rem] bg-black/15 border border-white/5 p-5 sm:p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-xl font-bold text-on-surface">
                                                        Security
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Manage your password and
                                                        authentication methods.
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-tertiary-container">
                                                    verified_user
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <div className="group flex items-center justify-between gap-4 p-4 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-high transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container shrink-0">
                                                            <span className="material-symbols-outlined">
                                                                key
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-on-surface">
                                                                Change Password
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Last changed 3 months ago
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-600 group-hover:text-tertiary-container transition-colors shrink-0">
                                                        chevron_right
                                                    </span>
                                                </div>

                                                <div className="group flex items-center justify-between gap-4 p-4 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-high transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary shrink-0">
                                                            <span className="material-symbols-outlined">
                                                                phonelink_lock
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-on-surface">
                                                                Two-Factor Authentication
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                Enabled • SMS ending in 4492
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded">
                                                            Active
                                                        </span>
                                                        <span className="material-symbols-outlined text-slate-600 group-hover:text-secondary transition-colors">
                                                            chevron_right
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-[1.5rem] bg-black/15 border border-white/5 p-5 sm:p-6 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-on-surface mb-2">
                                                    Danger Zone
                                                </h3>
                                                <p className="text-sm text-slate-500 leading-6">
                                                    Permanently delete the account
                                                    and remove saved data.
                                                </p>
                                            </div>
                                            <button className="mt-6 w-full bg-red-600 cursor-pointer rounded-full border border-[#ffb8bb]/30 text-[#ffb8bb] font-bold py-3 hover:bg-red-400 transition-colors">
                                                Deactivate Account
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="rounded-[1.5rem] bg-black/15 border border-white/5 p-5 sm:p-6">
                                        <h3 className="text-xl font-bold text-on-surface mb-2">
                                            Visual Identity
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-6 mb-6">
                                            Choose the theme system that best fits
                                            your late-night listening mood and device.
                                        </p>
                                        <ThemePicker />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row text-sm md:text-base justify-end gap-3 pt-4 lg:pt-8">
                                <button className="px-8 py-3 rounded-full border border-outline-variant/30 text-slate-400 font-bold hover:bg-white/5 transition-colors">
                                    Discard Changes
                                </button>
                                <button className="px-8 py-3 rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all">
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    )
}
