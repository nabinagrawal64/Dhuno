import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
    const { username: usernameParam } = useParams<{ username?: string }>();
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

    // Share Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Image Upload State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

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
                let loadedUser: UserProfile;
                if (usernameParam) {
                    const response = await authService.getProfileByUsername(usernameParam);
                    loadedUser = response.user;
                } else {
                    const response = await authService.getMe();
                    loadedUser = response.user;
                    if (loadedUser.username && !isArtistProfile) {
                        navigate(`/profile/${loadedUser.username}`, { replace: true });
                    }
                }

                setProfile(loadedUser);
                setForm({
                    fullName: loadedUser.fullName ?? '',
                    username: loadedUser.username ?? '',
                    bio: loadedUser.bio ?? '',
                    avatar: loadedUser.avatar ?? '',
                    bannerImage: loadedUser.bannerImage ?? '',
                });
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, [usernameParam, isArtistProfile, navigate]);

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
        [profile, isArtistProfile],
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
        setAvatarFile(null);
        setBannerFile(null);
        setAvatarPreview(null);
        setBannerPreview(null);
        setIsEditing(true);
    };

    const onFormChange = (field: keyof UpdateProfileData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
        e.target.value = '';
    };

    const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
        e.target.value = '';
    };

    const saveProfile = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            const formData = new FormData();
            if (form.fullName?.trim()) formData.append('fullName', form.fullName.trim());
            if (form.username?.trim()) formData.append('username', form.username.trim().toLowerCase());
            if (form.bio !== undefined) formData.append('bio', form.bio.trim());

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            } else if (form.avatar?.trim()) {
                formData.append('avatar', form.avatar.trim());
            }

            if (bannerFile) {
                formData.append('bannerImage', bannerFile);
            } else if (form.bannerImage?.trim()) {
                formData.append('bannerImage', form.bannerImage.trim());
            }

            const response = await authService.updateMe(formData);
            setProfile(response.user);
            setForm({
                fullName: response.user.fullName ?? '',
                username: response.user.username ?? '',
                bio: response.user.bio ?? '',
                avatar: response.user.avatar ?? '',
                bannerImage: response.user.bannerImage ?? '',
            });
            setAvatarFile(null);
            setBannerFile(null);
            setAvatarPreview(null);
            setBannerPreview(null);
            setIsEditing(false);
            toast.success('Profile updated & image uploaded to Cloudinary!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const shareProfile = async () => {
        const shareUrl = profile?.username
            ? `${window.location.origin}/profile/${profile.username}`
            : window.location.href;

        if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
            try {
                await navigator.share({
                    title: `${profile?.fullName || 'User'} on Dhuno`,
                    text: `Check out ${profile?.fullName || 'this profile'} on Dhuno!`,
                    url: shareUrl,
                });
                return;
            } catch {
                // Fallback to modal
            }
        }

        setIsShareModalOpen(true);
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
                    {/* Cover Banner Image with Direct Click-to-Upload */}
                    <label
                        htmlFor="banner-file-input"
                        className="relative block h-36 sm:h-44 lg:h-56 group cursor-pointer overflow-hidden"
                        title="Click to choose a new cover banner image"
                    >
                        <input
                            id="banner-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleBannerSelect}
                            className="hidden"
                        />
                        <img
                            alt="Profile cover"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            src={bannerPreview || profile?.bannerImage || DEFAULT_BANNER}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/25 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm pointer-events-none z-10">
                            <span className="material-symbols-outlined text-2xl">photo_camera</span>
                            <span>Change Cover Photo</span>
                        </div>
                    </label>

                    <div className="px-5 sm:px-7 lg:px-8 pb-6 sm:pb-8 -mt-14 sm:-mt-16 relative z-10">
                        <div className="flex flex-col xl:flex-row xl:items-end gap-6 xl:gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-6 flex-1 min-w-0">
                                {/* Profile Avatar with Direct Click-to-Upload */}
                                <label
                                    htmlFor="avatar-file-input"
                                    className="relative block shrink-0 group cursor-pointer"
                                    title="Click to choose a new profile avatar image"
                                >
                                    <input
                                        id="avatar-file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarSelect}
                                        className="hidden"
                                    />
                                    <div className="absolute -inset-3 bg-primary/10 blur-2xl rounded-4xl pointer-events-none" />
                                    <img
                                        alt="User profile avatar"
                                        className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-[1.75rem] object-cover shadow-2xl border-4 border-surface-container-high transition-transform duration-300 group-hover:scale-102"
                                        src={avatarPreview || profile?.avatar || DEFAULT_AVATAR}
                                    />
                                    <div className="absolute inset-0 rounded-[1.75rem] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white z-10 pointer-events-none">
                                        <span className="material-symbols-outlined text-3xl">photo_camera</span>
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1">Change</span>
                                    </div>
                                </label>

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

                {(avatarFile || bannerFile) && (
                    <div className="mb-6 p-4 rounded-3xl bg-linear-to-r from-primary/20 via-surface-container-high to-surface-container-high border border-primary/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-xl">cloud_upload</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">
                                    {avatarFile && bannerFile
                                        ? 'New profile & banner photos selected!'
                                        : avatarFile
                                            ? 'New profile photo selected!'
                                            : 'New banner photo selected!'}
                                </p>
                                <p className="text-xs text-slate-300">Save to upload directly and update your profile.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={saving}
                                onClick={() => void saveProfile()}
                                className="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/20"
                            >
                                {saving ? 'Saving...' : avatarFile && bannerFile ? 'Save Photos' : 'Save Photo'}
                            </button>
                            <button
                                disabled={saving}
                                onClick={() => {
                                    setAvatarFile(null);
                                    setBannerFile(null);
                                    setAvatarPreview(null);
                                    setBannerPreview(null);
                                }}
                                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all cursor-pointer"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                )}

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

            {/* Interactive Share Profile Modal */}
            {isShareModalOpen && (
                <div
                    className="fixed inset-0 z-110 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsShareModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-surface-container-high border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 relative text-on-surface"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-extrabold font-headline text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">share</span>
                                Share Profile
                            </h3>
                            <button
                                onClick={() => setIsShareModalOpen(false)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                aria-label="Close modal"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Profile Preview Card */}
                        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-black/20 border border-white/5">
                            <img
                                src={profile?.avatar || DEFAULT_AVATAR}
                                alt={profile?.fullName || 'User'}
                                className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0 shadow-md"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-white truncate text-base">{profile?.fullName || 'Unnamed User'}</p>
                                <p className="text-xs text-primary font-semibold truncate">@{profile?.username || 'user'}</p>
                            </div>
                        </div>

                        {/* Copy Link Input Section */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Link</label>
                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1.5">
                                <input
                                    type="text"
                                    readOnly
                                    value={profile?.username ? `${window.location.origin}/profile/${profile.username}` : window.location.href}
                                    className="flex-1 bg-transparent px-3 text-xs text-slate-300 outline-none truncate font-mono"
                                />
                                <button
                                    onClick={async () => {
                                        const shareUrl = profile?.username
                                            ? `${window.location.origin}/profile/${profile.username}`
                                            : window.location.href;
                                        await navigator.clipboard.writeText(shareUrl);
                                        setCopiedLink(true);
                                        toast.success('Profile link copied!');
                                        setTimeout(() => setCopiedLink(false), 2000);
                                    }}
                                    className="text-white p-2 font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {copiedLink ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Social Quick Share Grid */}
                        <div className="space-y-2 pt-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Share</p>
                            <div className="grid grid-cols-4 gap-3">
                                <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${profile?.fullName || 'this profile'} on Dhuno: ${window.location.origin}/profile/${profile?.username || ''}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 transition-all hover:scale-105 cursor-pointer group"
                                >
                                    <svg className="w-6 h-6 fill-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                                    </svg>
                                    <span className="text-[10px] font-bold text-slate-300">WhatsApp</span>
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${profile?.fullName || 'this profile'} on Dhuno!`)}&url=${encodeURIComponent(`${window.location.origin}/profile/${profile?.username || ''}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/40 transition-all hover:scale-105 cursor-pointer group"
                                >
                                    <svg className="w-5 h-5 fill-sky-400 group-hover:scale-110 transition-transform mt-0.5" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    <span className="text-[10px] font-bold text-slate-300">X (Twitter)</span>
                                </a>
                                <a
                                    href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/profile/${profile?.username || ''}`)}&text=${encodeURIComponent(`Check out ${profile?.fullName || 'this profile'} on Dhuno!`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/40 transition-all hover:scale-105 cursor-pointer group"
                                >
                                    <svg className="w-5 h-5 fill-blue-400 group-hover:scale-110 transition-transform mt-0.5" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                    <span className="text-[10px] font-bold text-slate-300">Telegram</span>
                                </a>
                                <a
                                    href={`mailto:?subject=${encodeURIComponent(`Check out ${profile?.fullName || 'this profile'} on Dhuno`)}&body=${encodeURIComponent(`Hey, check out ${profile?.fullName || 'this profile'} on Dhuno: ${window.location.origin}/profile/${profile?.username || ''}`)}`}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 transition-all hover:scale-105 cursor-pointer group"
                                >
                                    <svg className="w-5 h-5 fill-primary group-hover:scale-110 transition-transform mt-0.5" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                    <span className="text-[10px] font-bold text-slate-300">Email</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
