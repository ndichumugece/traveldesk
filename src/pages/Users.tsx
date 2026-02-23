import { useState } from 'react';
import { Plus, Search, Shield, User, MoreHorizontal, Mail, X, Loader2 } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';

export function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('staff');
    const { users, loading, inviteUser } = useUsers();

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInvite = async () => {
        try {
            await inviteUser(inviteEmail, inviteRole);
            setIsInviting(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team Management</h1>
                    <p className="text-slate-500 mt-1">Manage team members and role-based access.</p>
                </div>
                <button
                    onClick={() => setIsInviting(true)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Invite User
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-sm text-slate-500">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                {user.role === 'Admin' ? <Shield className="w-4 h-4 text-brand-600" /> : <User className="w-4 h-4 text-slate-400" />}
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                {user.status === 'active' ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500">
                                            {user.lastActive}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isInviting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
                            <button onClick={() => setIsInviting(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        placeholder="colleague@agency.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={e => setInviteRole(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 font-medium"
                                >
                                    <option value="staff">Staff (Limited Access)</option>
                                    <option value="admin">Admin (Full Access)</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Staff can create documents and manage bookings. Admins can manage properties and users.</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsInviting(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInvite}
                                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
