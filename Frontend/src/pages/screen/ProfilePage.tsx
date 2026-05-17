import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService, type UpdateProfileData, type UserProfile, type ChangePasswordData } from '../../api/auth.service';
import { authUtils } from '../../utils/auth';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=800&q=80';

function toCount(value: unknown): number {
    if (typeof value === 'number') return value;
    return Array.isArray(value) ? value.length : 0;
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isArtistProfile = location.pathname === '/artist/profile';
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
        currentPassword: '',
        newPassword: '',
    });
    const [isEnabling2FA, setIsEnabling2FA] = useState(false);
    const [twoFactorOTP, setTwoFactorOTP] = useState('');
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [form, setForm] = useState<UpdateProfileData>({
        fullName: '',
        username: '',
        bio: '',
        avatar: '',
        bannerImage: '',
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await authService.getMe();
                setProfile(response.user);
                setForm({
                    fullName: response.user.fullName ?? '',
                    username: response.user.username ?? '',
                    bio: response.user.bio ?? '',
                    avatar: response.user.avatar ?? '',
                    bannerImage: response.user.bannerImage ?? '',
                });
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, []);

    const stats = useMemo(
        () => [
            { value: toCount(profile?.followers).toLocaleString(), label: 'Followers', accent: 'text-primary' },
            { value: toCount(profile?.following).toLocaleString(), label: 'Following', accent: 'text-on-surface' },
            { value: toCount(profile?.playlists).toLocaleString(), label: 'Playlists', accent: 'text-on-surface' },
            {
                value: isArtistProfile
                    ? toCount(profile?.totalSongs).toLocaleString()
                    : toCount(profile?.joinedRooms).toLocaleString(),
                label: isArtistProfile ? 'Total Songs' : 'Rooms',
                accent: 'text-on-surface'
            },
        ],
        [profile],
    );

    const onEditClick = () => {
        if (!profile) return;
        setForm({
            fullName: profile.fullName ?? '',
            username: profile.username ?? '',
            bio: profile.bio ?? '',
            avatar: profile.avatar ?? '',
            bannerImage: profile.bannerImage ?? '',
        });
        setIsEditing(true);
    };

    const onFormChange = (field: keyof UpdateProfileData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const saveProfile = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            const payload: UpdateProfileData = {
                fullName: form.fullName?.trim(),
                username: form.username?.trim().toLowerCase(),
                bio: form.bio?.trim(),
                avatar: form.avatar?.trim(),
                bannerImage: form.bannerImage?.trim(),
            };

            const response = await authService.updateMe(payload);
            setProfile(response.user);
            setIsEditing(false);
            toast.success('Profile updated');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const shareProfile = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Profile link copied');
        } catch {
            toast.error('Unable to copy profile link');
        }
    };

    const handleLogout = async () => {
        await authUtils.logout((path) => navigate(path));
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Delete your account permanently? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await authService.deleteMe();
            authUtils.removeToken();
            authUtils.removeRole();
            toast.success('Account deleted successfully');
            navigate('/signup');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete account');
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        try {
            setPasswordSaving(true);
            await authService.changePassword(passwordForm);
            toast.success('Password updated successfully');
            setIsChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update password');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleRequestEnable2FA = async () => {
        try {
            setTwoFactorLoading(true);
            await authService.requestEnable2FA();
            setIsEnabling2FA(true);
            toast.success('Verification code sent to your email');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to request 2FA');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const handleVerifyEnable2FA = async () => {
        if (!twoFactorOTP) {
            toast.error('Please enter the verification code');
            return;
        }

        try {
            setTwoFactorLoading(true);
            const response = await authService.verifyEnable2FA(twoFactorOTP);
            setBackupCodes(response.backupCodes || []);
            setProfile(prev => prev ? { ...prev, twoFactorEnabled: true } : null);
            setIsEnabling2FA(false);
            toast.success('2FA enabled successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to verify 2FA');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) return;

        try {
            setTwoFactorLoading(true);
            await authService.disable2FA();
            setProfile(prev => prev ? { ...prev, twoFactorEnabled: false } : null);
            setBackupCodes(null);
            toast.success('2FA disabled');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to disable 2FA');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`w-full ${isArtistProfile ? '' : 'px-4 md:px-8 pt-6 md:pt-12 lg:pt-16 pb-44'} animate-pulse`}>
                <div className="rounded-4xl border border-white/5 overflow-hidden mb-8 bg-surface-container-low">
                    <div className="h-36 sm:h-44 lg:h-56 bg-white/5" />
                    <div className="px-5 sm:px-7 lg:px-8 pb-6 sm:pb-8 -mt-14 sm:-mt-16 relative z-10 flex flex-col xl:flex-row xl:items-end gap-6 xl:gap-8">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6 flex-1">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-[1.75rem] bg-white/10 shrink-0 border-4 border-surface-container-high" />
                            <div className="flex-1 space-y-3 pb-2">
                                <div className="h-8 w-1/2 md:w-1/3 bg-white/10 rounded-xl" />
                                <div className="h-4 w-3/4 md:w-1/2 bg-white/10 rounded" />
                                <div className="h-3 w-1/4 md:w-1/6 bg-white/10 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary w-full">
            <style
                dangerouslySetInnerHTML={{
                    __html: `.material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .glass-card {
                        background: rgba(28, 32, 39, 0.4);
                        backdrop-filter: blur(16px);
                    }
                    .no-scrollbar::-webkit-scrollbar { display: none; }`,
                }}
            />

            <main className={`w-full ${isArtistProfile ? '' : 'px-4 md:px-8 pt-6 md:pt-12 lg:pt-16 pb-44'}`}>
                {!isArtistProfile ? (
                    <section className="lg:mb-5 mb-3 flex items-center justify-between lg:justify-start gap-3 w-full">
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tighter">Profile</h1>
                        <a href="/notifications" className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors bg-surface-container-high rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-2xl">notifications</span>
                        </a>
                    </section>
                ) : null}

                <section className="glass-card rounded-4xl border border-white/5 overflow-hidden mb-4 lg:mb-8">
                    <div className="relative h-36 sm:h-44 lg:h-56">
                        <img
                            alt="Profile cover"
                            className="absolute inset-0 w-full h-full object-cover"
                            src={profile?.bannerImage || DEFAULT_BANNER}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/25 to-transparent" />
                    </div>

                    <div className="px-5 sm:px-7 lg:px-8 pb-6 sm:pb-8 -mt-14 sm:-mt-16 relative z-10">
                        <div className="flex flex-col xl:flex-row xl:items-end gap-6 xl:gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6 flex-1 min-w-0">
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-3 bg-primary/10 blur-2xl rounded-4xl" />
                                    <img
                                        alt="User profile avatar"
                                        className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-[1.75rem] object-cover shadow-2xl border-4 border-surface-container-high"
                                        src={profile?.avatar || DEFAULT_AVATAR}
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {profile?.isArtistPro ? (
                                            <span className="px-3 py-1 bg-surface-container-highest text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                                                Artist Pro
                                            </span>
                                        ) : null}
                                        {profile?.isVerified ? (
                                            <span className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                                Verified Creator
                                            </span>
                                        ) : null}
                                        <span className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                            {profile?.role ?? 'user'}
                                        </span>
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black font-headline tracking-tighter text-on-surface leading-none">
                                        {profile?.fullName || 'Unnamed User'}
                                    </h2>
                                    <p className="text-slate-400 max-w-2xl mt-3 text-sm sm:text-base leading-relaxed">
                                        {profile?.bio || 'No bio yet. Click Edit Profile to add one.'}
                                    </p>
                                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                        @{profile?.username || 'username'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={onEditClick}
                                    className="flex-1 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold text-sm sm:text-base px-4 py-2 md:px-6 md:py-3 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-sm shadow-primary/20 whitespace-nowrap"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => void shareProfile()}
                                    className="flex-1 glass-card hover:bg-surface-container-high/60 text-on-surface font-bold text-sm sm:text-base px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center justify-center gap-1.5 md:gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xs sm:text-base">share</span>
                                    Share
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl bg-black/20 border border-white/5 px-4 py-4 sm:px-5 sm:py-5"
                                >
                                    <p className={`text-2xl sm:text-3xl font-bold font-headline ${stat.accent}`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-2">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {isEditing ? (
                    <section className="glass-card rounded-4xl border border-white/5 p-5 sm:p-6 mb-8">
                        <h3 className="text-xl font-bold font-headline mb-4">Edit Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="text-sm text-slate-300">
                                Full name
                                <input
                                    value={form.fullName ?? ''}
                                    onChange={(event) => onFormChange('fullName', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60"
                                />
                            </label>
                            <label className="text-sm text-slate-300">
                                Username
                                <input
                                    value={form.username ?? ''}
                                    onChange={(event) => onFormChange('username', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60"
                                />
                            </label>
                            <label className="text-sm text-slate-300 md:col-span-2">
                                Bio
                                <textarea
                                    rows={4}
                                    value={form.bio ?? ''}
                                    onChange={(event) => onFormChange('bio', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60"
                                />
                            </label>
                            <label className="text-sm text-slate-300">
                                Avatar URL
                                <input
                                    value={form.avatar ?? ''}
                                    onChange={(event) => onFormChange('avatar', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60"
                                />
                            </label>
                            <label className="text-sm text-slate-300">
                                Banner URL
                                <input
                                    value={form.bannerImage ?? ''}
                                    onChange={(event) => onFormChange('bannerImage', event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60"
                                />
                            </label>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                disabled={saving}
                                onClick={() => void saveProfile()}
                                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                disabled={saving}
                                onClick={() => setIsEditing(false)}
                                className="rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-on-surface disabled:opacity-60"
                            >
                                Cancel
                            </button>
                        </div>
                    </section>
                ) : null}

                <section className="grid grid-cols-1 gap-8"> 
                    <div className="lg:space-y-8 space-y-4 min-w-0">
                        {/* Settings */}
                        <div className="glass-card rounded-[1.75rem] border border-white/5 p-4 sm:p-6 lg:p-7">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 md:gap-3 mb-3 lg:mb-6">
                                <h3 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Settings</h3>
                                <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Protected</span>
                            </div>
                            <div className="space-y-4">
                                {/* change password */}
                                <div className="group cursor-pointer flex flex-col gap-4 p-4 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-high transition-colors">
                                    <div onClick={() => setIsChangingPassword(!isChangingPassword)} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container shrink-0">
                                                <span className="material-symbols-outlined">key</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm md:text-base text-on-surface">Change Password</p>
                                                <p className="text-[10px] md:text-xs text-slate-500">
                                                    {profile?.googleId ? 'You are signed in through Google' : 'Update your login password securely.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {isChangingPassword && !profile?.googleId && (
                                        <div className="mt-2 space-y-4 border-t border-white/5 pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                    Current Password
                                                    <input
                                                        type="password"
                                                        value={passwordForm.currentPassword}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60"
                                                        placeholder="••••••••"
                                                    />
                                                </label>
                                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                    New Password
                                                    <input
                                                        type="password"
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60"
                                                        placeholder="••••••••"
                                                    />
                                                </label>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setIsChangingPassword(false)}
                                                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-on-surface transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    disabled={passwordSaving}
                                                    onClick={() => void handleChangePassword()}
                                                    className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-on-primary disabled:opacity-60 shadow-lg shadow-primary/20"
                                                >
                                                    {passwordSaving ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* two factor authentication */}
                                <div className="group flex flex-col gap-4 p-4 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-high transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary shrink-0">
                                                <span className="material-symbols-outlined">phonelink_lock</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm md:text-base text-on-surface">Two-Factor Authentication</p>
                                                <p className="text-[10px] md:text-xs text-slate-500">
                                                    {profile?.twoFactorEnabled ? 'Your account is protected with a second layer.' : 'Add an extra layer of security to your account.'}
                                                </p>
                                            </div>
                                        </div>
                                        {profile?.twoFactorEnabled ? (
                                            <button
                                                onClick={() => void handleDisable2FA()}
                                                className="px-4 py-2 text-xs font-bold text-error hover:bg-error/10 rounded-full transition-colors"
                                            >
                                                Disable
                                            </button>
                                        ) : (
                                            <button
                                                disabled={twoFactorLoading}
                                                onClick={() => isEnabling2FA ? setIsEnabling2FA(false) : void handleRequestEnable2FA()}
                                                className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-on-surface hover:border-primary/40 hover:text-primary transition-colors"
                                            >
                                                {isEnabling2FA ? 'Cancel' : 'Enable'}
                                            </button>
                                        )}
                                    </div>

                                    {isEnabling2FA && !profile?.twoFactorEnabled && (
                                        <div className="mt-2 space-y-4 border-t border-white/5 pt-4">
                                            <div className="max-w-xs">
                                                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                    Verification Code
                                                    <input
                                                        type="text"
                                                        value={twoFactorOTP}
                                                        onChange={(e) => setTwoFactorOTP(e.target.value.toUpperCase())}
                                                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-on-surface outline-none focus:border-primary/60 text-center tracking-[0.5em] font-bold"
                                                        placeholder="000000"
                                                        maxLength={6}
                                                    />
                                                </label>
                                            </div>
                                            <button
                                                disabled={twoFactorLoading || twoFactorOTP.length < 6}
                                                onClick={() => void handleVerifyEnable2FA()}
                                                className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-on-primary disabled:opacity-60 shadow-lg shadow-primary/20"
                                            >
                                                {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
                                            </button>
                                        </div>
                                    )}

                                    {backupCodes && backupCodes.length > 0 && (
                                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                                            <p className="text-sm font-bold text-primary mb-2">Save your backup codes!</p>
                                            <p className="text-xs text-slate-400 mb-4">Use these if you lose access to your email. Each code can be used once.</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {backupCodes.map(code => (
                                                    <code key={code} className="bg-black/40 p-2 rounded text-center text-xs font-mono select-all">
                                                        {code}
                                                    </code>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const text = `Dhuno Backup Codes:\n\n${backupCodes.join('\n')}`;
                                                    navigator.clipboard.writeText(text);
                                                    toast.success('Backup codes copied');
                                                }}
                                                className="mt-4 w-full py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                            >
                                                Copy all codes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* danger zone */}
                        <div className="glass-card rounded-[1.75rem] border border-[#ffb8bb]/20 p-4 sm:p-6 lg:p-7">
                            <h3 className="text-xl sm:text-2xl font-bold font-headline tracking-tight text-[#ffb8bb]">Danger Zone</h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Final account actions are available here.
                            </p> 

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => void handleLogout()}
                                    className="w-full sm:w-auto rounded-full border border-orange-400/40 bg-orange-600/25 px-5 py-3 text-sm font-bold text-orange-200 hover:bg-orange-600/35 transition-colors"
                                >
                                    Logout
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleDeleteAccount()}
                                    className="w-full sm:w-auto rounded-full border border-[#ffb8bb]/30 bg-red-600/25 px-5 py-3 text-sm font-bold text-[#ffb8bb] hover:bg-red-600/35 transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
