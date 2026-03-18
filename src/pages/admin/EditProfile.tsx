import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, ArrowLeft, Save, User, Mail, Shield, Calendar, Clock, Trash2 } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    last_active?: string;
}

export function EditProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteUserProfile } = useUsers();

    // Form state
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        if (id) {
            fetchUser(id);
        }
    }, [id]);

    const fetchUser = async (userId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            setUser(data);
            setFullName(data.full_name || '');
            setRole(data.role || 'staff');
        } catch (err: any) {
            console.error('Error fetching user:', err);
            setError(err.message || 'Failed to load user profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    role: role,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setSuccess(true);
            // Optionally redirect after a delay
            // setTimeout(() => navigate('/users'), 2000);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update user profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        setError(null);

        try {
            await deleteUserProfile(id);
            navigate('/users');
        } catch (err: any) {
            console.error('Error deleting user:', err);
            setError(err.message || 'Failed to delete user profile.');
            setShowDeleteConfirm(false);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-[#5438FF]" />
            </div>
        );
    }

    if (!user && !loading) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
                    <h2 className="text-xl font-bold mb-2">User Not Found</h2>
                    <p className="mb-6">The user profile you are trying to edit does not exist.</p>
                    <button
                        onClick={() => navigate('/users')}
                        className="inline-flex items-center gap-2 text-red-700 font-semibold hover:underline"
                    >
                        <ArrowLeft size={16} />
                        Back to Team Members
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-20 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/users')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Profile</h1>
                        <p className="text-slate-500 mt-1">Update user details and permissions.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Avatar & Info Summary */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl font-bold text-[#5438FF] mb-4 shadow-inner">
                            {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || <User size={40} />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 break-words w-full">{user?.full_name || 'Unnamed User'}</h2>
                        <p className="text-slate-500 text-sm mb-6 break-all">{user?.email}</p>

                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full mb-6 p-3 rounded-xl border border-red-100 bg-red-50/50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                        >
                            <Trash2 size={14} />
                            Delete Account
                        </button>

                        <div className="w-full space-y-4 pt-6 border-t border-slate-100 text-left">
                            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-xl">
                                <Shield size={16} className="text-[#5438FF]" />
                                <span className="font-semibold capitalize">{user?.role}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 px-1">
                                <Calendar size={16} className="shrink-0" />
                                <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            {user?.last_active && (
                                <div className="flex items-center gap-3 text-sm text-slate-500 px-1">
                                    <Clock size={16} className="shrink-0" />
                                    <span>Active {user.last_active}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Edit Form */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 text-sm font-medium">
                                Profile updated successfully!
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#5438FF] transition-colors" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5438FF]/10 focus:border-[#5438FF] transition-all font-semibold text-slate-900 shadow-sm"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                    <div className="relative opacity-60">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-500 cursor-not-allowed shadow-sm"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 ml-1">Email address cannot be changed from this portal.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                                    <div className="relative">
                                        <select
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5438FF]/10 focus:border-[#5438FF] transition-all text-slate-900 font-semibold shadow-sm appearance-none cursor-pointer"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                                        >
                                            <option value="staff">Staff (Account User)</option>
                                            <option value="admin">Admin (Full Access)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-[#5438FF] hover:bg-[#462EE5] text-white px-8 py-3 rounded-2xl transition-all shadow-lg shadow-[#5438FF]/20 active:scale-95 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-8 text-center">
                            <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete User Profile?</h3>
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Are you sure you want to delete <span className="font-bold text-slate-900">{user?.full_name}</span>? 
                                This action will remove their access and all associated profile data. This cannot be undone.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Deleting Profile...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            Yes, Delete Profile
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
