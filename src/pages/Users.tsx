import { useState } from 'react';
import { Plus, Mail, X, Loader2, Trash2, Pencil, Link, Check } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import type { UserProfile } from '../hooks/useUsers';

export function Users() {
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('staff');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { users, loading, inviteUser, cancelInvite, updateUserRole, deleteUserProfile } = useUsers();

    const admins = users.filter(u => u.role.toLowerCase() === 'admin');
    const staff = users.filter(u => u.role.toLowerCase() !== 'admin');

    const handleInvite = async () => {
        try {
            await inviteUser(inviteEmail, inviteRole);
            setIsInviting(false);
            setInviteEmail('');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleRoleToggle = async (user: UserProfile) => {
        const newRole = user.role.toLowerCase() === 'admin' ? 'staff' : 'admin';
        if (confirm(`Change ${user.name}'s role to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}?`)) {
            try {
                await updateUserRole(user.id, newRole);
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            try {
                await deleteUserProfile(user.id);
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const handleCopyLink = async (user: UserProfile) => {
        const signupUrl = `${window.location.origin}/register?email=${encodeURIComponent(user.email)}`;
        try {
            await navigator.clipboard.writeText(signupUrl);
            setCopiedId(user.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const UserTable = ({ usersList }: { usersList: UserProfile[] }) => (
        <div className="w-full">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-tight">Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-tight">Date added</th>
                        <th className="py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-tight">Last active</th>
                        <th className="py-3 px-4 w-20"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {usersList.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden shrink-0 ${user.status === 'pending' ? 'bg-slate-50 border-dashed' : 'bg-slate-100'}`}>
                                        {user.status === 'pending' ? <Mail className="w-5 h-5 text-slate-400" /> : user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold transition-colors ${user.status === 'pending' ? 'text-slate-500 italic' : 'text-slate-900 group-hover:text-brand-600'}`}>
                                                {user.name}
                                            </span>
                                            {user.status === 'pending' && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500">{user.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                                {user.dateAdded}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                                {user.lastActive}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {user.status === 'pending' && (
                                        <button
                                            onClick={() => handleCopyLink(user)}
                                            className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${copiedId === user.id ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-100 text-slate-400 hover:text-brand-600'}`}
                                            title="Copy Signup Link"
                                        >
                                            {copiedId === user.id ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                                            {copiedId === user.id && <span className="text-[10px] font-bold uppercase">Copied</span>}
                                        </button>
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (user.status === 'pending') {
                                                if (confirm(`Cancel invitation for ${user.email}?`)) {
                                                    await cancelInvite(user.id);
                                                }
                                            } else {
                                                await handleRoleToggle(user);
                                            }
                                        }}
                                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                                        title={user.status === 'pending' ? 'Cancel Invitation' : 'Edit Role'}
                                    >
                                        {user.status === 'pending' ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user)}
                                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* ── Page Header ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Team members</h1>
                    <p className="text-slate-500 mt-1.5 text-lg">Manage your team members and their account permissions here.</p>
                </div>
                <button
                    onClick={() => setIsInviting(true)}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all border border-slate-200 shadow-sm active:scale-95 font-semibold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add team member
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Admin Users Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-3">
                            <h3 className="text-base font-bold text-slate-900">Admin users</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                Admins have exclusive access to the Dashboard, Team Management, and Settings pages.
                            </p>
                        </div>
                        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[100px]">
                            {admins.length > 0 ? (
                                <UserTable usersList={admins} />
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-sm italic">No admins found</div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-200" />

                    {/* Staff / Account Users Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-3">
                            <h3 className="text-base font-bold text-slate-900">Account users</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                Account users have access to the Bookings, Properties, and Configurations sections.
                            </p>
                        </div>
                        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[100px]">
                            {staff.length > 0 ? (
                                <UserTable usersList={staff} />
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-sm italic">No account users found</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Sidebar */}
            {isInviting && (
                <div className="fixed inset-0 z-50 flex overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-300"
                        onClick={() => setIsInviting(false)}
                    />

                    {/* Sidebar */}
                    <div className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out border-l border-slate-100 h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Invite Team Member</h3>
                                <p className="text-slate-500 text-sm mt-1">Send an invitation to join your team.</p>
                            </div>
                            <button
                                onClick={() => setIsInviting(false)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm"
                                        placeholder="colleague@agency.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                                <div className="relative">
                                    <select
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-slate-900 font-semibold shadow-sm appearance-none cursor-pointer"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                                    >
                                        <option value="staff">Staff (Account User)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsInviting(false)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInvite}
                                className="px-8 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl transition-all shadow-lg hover:shadow-brand-500/25 active:scale-95 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

