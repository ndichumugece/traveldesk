import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { 
    User, 
    Mail, 
    Camera, 
    Lock, 
    Save, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Eye,
    EyeOff,
    Shield,
    Smartphone,
    Monitor,
    LogOut,
    ChevronRight,
    Activity,
    CreditCard,
    Bell,
    ExternalLink,
    MapPin,
    Clock,
    X,
    Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={cn(
            "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300 border",
            type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
        )}>
            {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
            <p className="font-bold text-sm tracking-tight">{message}</p>
            <button onClick={onClose} className="ml-4 p-1 rounded-lg hover:bg-black/5 transition-colors">
                <X className="w-4 h-4 opacity-50" />
            </button>
        </div>
    );
};

const SuccessBadge = ({ message }: { message: string }) => (
    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {message}
    </div>
);

// --- Page ---

export function UserProfile() {
    const { user, profile, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Profile State
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [initialName, setInitialName] = useState('');
    
    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [currentDevice, setCurrentDevice] = useState<string>('Detecting...');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dynamic Profile Completion Calculation
    const completionPercentage = useMemo(() => {
        let score = 0;
        if (fullName) score += 33.3;
        if (avatarUrl) score += 33.3;
        if (user?.email) score += 33.4;
        return Math.min(Math.round(score), 100);
    }, [fullName, avatarUrl, user?.email]);

    // Real Last Login from Metadata
    const lastLoginText = useMemo(() => {
        if (!user?.last_sign_in_at) return 'First session';
        try {
            return formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    }, [user?.last_sign_in_at]);

    // Password Strength Logic
    const passwordStrength = useMemo(() => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length >= 8) score += 25;
        if (/[A-Z]/.test(newPassword)) score += 25;
        if (/[0-9]/.test(newPassword)) score += 25;
        if (/[^A-Za-z0-9]/.test(newPassword)) score += 25;
        return score;
    }, [newPassword]);

    const isDirty = fullName !== initialName;

    useEffect(() => {
        if (user) {
            fetchProfile();
            checkMfaStatus();
        }

        // Detect current browser/OS
        const ua = navigator.userAgent;
        let browser = "Web Browser";
        let os = "Device";
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        
        if (ua.includes("Windows")) os = "Windows";
        else if (ua.includes("Mac")) os = "macOS";
        else if (ua.includes("iPhone")) os = "iOS";
        setCurrentDevice(`${browser} on ${os}`);
    }, [user]);

    const checkMfaStatus = async () => {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;
            const activeFactor = data?.all?.find(f => f.status === 'verified');
            setMfaEnabled(!!activeFactor);
        } catch (err) {
            console.error('Error checking MFA status:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            if (data) {
                setFullName(data.full_name || '');
                setInitialName(data.full_name || '');
                setAvatarUrl(data.avatar_url || '');
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

            if (updateError) throw updateError;
            await refreshProfile();
            setInitialName(fullName);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to update profile', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setToast({ message: 'Passwords do not match', type: 'error' });
            return;
        }

        setIsUpdatingPassword(true);

        try {
            const { error: pwError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (pwError) throw pwError;

            setToast({ message: 'Password changed successfully', type: 'success' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to update password', type: 'error' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleLogoutAll = async () => {
        try {
            const { error } = await supabase.auth.signOut({ scope: 'global' });
            if (error) throw error;
            setToast({ message: 'Signed out from all devices.', type: 'success' });
            // Redirect will happen via AuthContext listener
        } catch (err: any) {
            setToast({ message: err.message || 'Logout failed', type: 'error' });
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file || !user) return;

            setIsUploading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl })
                .eq('id', user.id);

            await refreshProfile();
            setAvatarUrl(data.publicUrl);
            setToast({ message: 'Profile photo updated', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Error uploading photo', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">User settings</h1>
                    <p className="text-slate-500 mt-2 font-medium text-base">Manage your account preferences and security.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div 
                            className="h-full bg-brand-500 transition-all duration-1000 ease-out" 
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {completionPercentage}% Complete
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* --- Left Column: Summary Card --- */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center relative group">
                        <div className="absolute top-6 right-6">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                user?.id ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                            )}>
                                Active
                            </span>
                        </div>

                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-40 w-40 rounded-full bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-black text-brand-600">
                                        {fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                                <Camera className="w-8 h-8 mb-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />

                        <div className="mt-8 w-full">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{fullName || user?.email?.split('@')[0]}</h3>
                            <p className="text-slate-400 font-medium truncate px-4">{user?.email}</p>
                        </div>

                        <div className="w-full mt-10 pt-10 border-t border-slate-50 space-y-8">
                            <div className="flex flex-col items-center px-2">
                                <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Account type</span>
                                </div>
                                <span className="text-xs font-bold text-brand-600">Premium Admin</span>
                            </div>
                            <div className="flex flex-col items-center px-2">
                                <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Last login</span>
                                </div>
                                <span className="text-xs font-bold text-slate-600">{lastLoginText}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Navigation Sidebar (Mobile will stack this) */}
                    <nav className="flex flex-col gap-2">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={cn(
                                "flex items-center justify-between p-5 rounded-[1.5rem] font-bold tracking-tight transition-all active:scale-95 group",
                                activeTab === 'profile' ? "bg-brand-600 text-white shadow-xl shadow-brand-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}>
                            <div className="flex items-center gap-4">
                                <User className={cn("w-5 h-5", activeTab === 'profile' ? "text-white" : "text-brand-600")} />
                                Personal Profile
                            </div>
                            <ChevronRight className={cn("w-4 h-4", activeTab === 'profile' ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                        </button>
                        <button 
                            onClick={() => setActiveTab('security')}
                            className={cn(
                                "flex items-center justify-between p-5 rounded-[1.5rem] font-bold tracking-tight transition-all active:scale-95 group",
                                activeTab === 'security' ? "bg-brand-600 text-white shadow-xl shadow-brand-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}>
                            <div className="flex items-center gap-4">
                                <Lock className={cn("w-5 h-5", activeTab === 'security' ? "text-white" : "text-brand-600")} />
                                Security Settings
                            </div>
                            <ChevronRight className={cn("w-4 h-4", activeTab === 'security' ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                        </button>
                    </nav>
                </div>

                {/* --- Right Column: Dynamic Content --- */}
                <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    
                    {/* --- Profile Tab --- */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <User className="w-24 h-24 text-slate-50/50 -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                                </div>
                                
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Identity</h2>
                                            <p className="text-slate-400 font-medium mt-2">This information is visible to your agency team.</p>
                                        </div>
                                        {isDirty && (
                                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                Unsaved changes
                                            </span>
                                        )}
                                    </div>

                                    <form onSubmit={handleSaveProfile} className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Full Name</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        placeholder="Enter your full name"
                                                        className="w-full px-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-8 focus:ring-brand-500/5 transition-all font-medium text-slate-900 text-base shadow-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 opacity-60">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        value={user?.email || ''}
                                                        disabled
                                                        className="w-full pl-14 pr-6 py-3.5 bg-slate-100 border-none rounded-2xl font-medium text-slate-500 cursor-not-allowed shadow-inner text-base"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-300 font-medium px-1">Contact system admin to change email.</p>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <Activity className="w-5 h-5 shrink-0" />
                                                <p className="text-xs font-medium">Changes are instantly applied across all agency reports.</p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={saving || !isDirty}
                                                className={cn(
                                                    "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-base transition-all active:scale-95",
                                                    isDirty && !saving 
                                                        ? "bg-brand-600 text-white shadow-xl shadow-brand-200 hover:bg-brand-700" 
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                )}
                                            >
                                                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            
                            {/* Additional Mock Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white border border-slate-200 rounded-[2.2rem] p-8 shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-300 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Notifications</h4>
                                            <p className="text-xs font-medium text-slate-400 mt-1">Managed alerted events</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                </div>
                                <div className="bg-white border border-slate-200 rounded-[2.2rem] p-8 shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-300 transition-all opacity-50">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Billing & Plan</h4>
                                            <p className="text-xs font-medium text-slate-400 mt-1">Upgrade your features</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">Soon</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Security Tab --- */}
                    {activeTab === 'security' && (
                        <div className="space-y-8">
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security Settings</h2>
                                        <p className="text-slate-400 font-medium mt-2">Update passwords and manage your active access.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {mfaEnabled && <SuccessBadge message="MFA Protected" />}
                                    </div>
                                </div>

                                <form onSubmit={handlePasswordUpdate} className="space-y-10">
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">New Password</label>
                                                    {newPassword && (
                                                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                                            {passwordStrength < 50 ? 'Weak' : passwordStrength < 100 ? 'Secure' : 'Perfect'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Min. 8 characters"
                                                        className="w-full px-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-8 focus:ring-brand-500/5 transition-all font-medium text-slate-900 text-base shadow-sm"
                                                        required
                                                        minLength={8}
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 px-1">
                                                    {[1, 2, 3, 4].map((step) => (
                                                        <div 
                                                            key={step}
                                                            className={cn(
                                                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                                                passwordStrength >= step * 25 
                                                                    ? (step <= 2 ? "bg-amber-400" : "bg-brand-500") 
                                                                    : "bg-slate-100"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Identity</label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Repeat new password"
                                                    className="w-full px-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-8 focus:ring-brand-500/5 transition-all font-medium text-slate-900 text-base shadow-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Strength Checklist</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                                                    <div className={cn("w-2 h-2 rounded-full", newPassword.length >= 8 ? "bg-brand-500" : "bg-slate-200")} />
                                                    <span className={newPassword.length >= 8 ? "text-slate-900" : "text-slate-300"}>8+ Characters</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                                                    <div className={cn("w-2 h-2 rounded-full", /[A-Z]/.test(newPassword) ? "bg-brand-500" : "bg-slate-200")} />
                                                    <span className={/[A-Z]/.test(newPassword) ? "text-slate-900" : "text-slate-300"}>Uppercase Letter</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                                                    <div className={cn("w-2 h-2 rounded-full", /[0-9]/.test(newPassword) ? "bg-brand-500" : "bg-slate-200")} />
                                                    <span className={/[0-9]/.test(newPassword) ? "text-slate-900" : "text-slate-300"}>One Number</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                                                    <div className={cn("w-2 h-2 rounded-full", /[^A-Za-z0-9]/.test(newPassword) ? "bg-brand-500" : "bg-slate-200")} />
                                                    <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-slate-900" : "text-slate-300"}>Special Symbol</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Smartphone className="w-5 h-5 shrink-0" />
                                            <p className="text-xs font-medium truncate max-w-[250px]">Updates require re-login on external devices.</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isUpdatingPassword || !newPassword}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-lg shadow-slate-200",
                                                newPassword && !isUpdatingPassword 
                                                    ? "bg-slate-900 text-white hover:bg-black" 
                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            )}
                                        >
                                            {isUpdatingPassword && <Loader2 className="w-6 h-6 animate-spin mr-2" />}
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Two-Factor Authentication UI */}
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex items-center justify-between group">
                                <div className="flex gap-8 items-start">
                                    <div className="max-w-md">
                                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Two-Factor Auth</h3>
                                        <p className="text-slate-400 font-medium mt-1 text-xs">
                                            Add an extra layer of security to your account.
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setMfaEnabled(!mfaEnabled)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95",
                                        mfaEnabled 
                                            ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100" 
                                            : "bg-brand-600 text-white shadow-lg shadow-brand-100 hover:bg-brand-700"
                                    )}
                                >
                                    {mfaEnabled ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                            
                            {/* Sessions Card */}
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Sessions</h3>
                                    <button 
                                        onClick={handleLogoutAll}
                                        className="text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
                                    >
                                        Log out all devices
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[1.8rem] border border-slate-50">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-brand-600 shadow-sm">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-900 leading-none">{currentDevice}</span>
                                                    <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[9px] font-bold uppercase rounded-full">Current</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium mt-2">
                                                    <MapPin className="w-3 h-3" />
                                                    Identity Verified • Kenya
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 border border-dashed border-slate-100 rounded-[1.8rem] flex items-center justify-center bg-slate-50/30">
                                        <p className="text-[10px] text-slate-400 font-medium italic">
                                            Other encrypted sessions are hidden. Use "Log out all" to clear globally.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-3 text-slate-300 uppercase tracking-[0.2em] font-bold text-[9px] px-2">
                                    <AlertCircle className="w-3 h-3" />
                                    Sessions are cleared automatically after 30 days of inactivity.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
