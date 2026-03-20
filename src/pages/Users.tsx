import { useState } from 'react';
import { Plus, Mail, X, Loader2, Pencil, Check, Link as LinkIcon, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../hooks/useUsers';
import type { UserProfile } from '../hooks/useUsers';

export function Users() {
    const [isInviting, setIsInviting] = useState(false);
    const [inviteStep, setInviteStep] = useState<1 | 2>(1);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('staff');
    const [generatedLink, setGeneratedLink] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const navigate = useNavigate();
    const { users, loading, inviteUser } = useUsers();

    const admins = users.filter(u => u.role.toLowerCase() === 'admin');
    const staff = users.filter(u => u.role.toLowerCase() !== 'admin');

    const handleInvite = async () => {
        if (!inviteEmail) return;
        setIsSaving(true);
        try {
            const invitation = await inviteUser(inviteEmail, inviteRole);
            const signupUrl = `${window.location.origin}/register?email=${encodeURIComponent(inviteEmail)}`;
            setGeneratedLink(signupUrl);
            setInviteStep(2);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const resetInvite = () => {
        setIsInviting(false);
        setInviteStep(1);
        setInviteEmail('');
        setInviteRole('staff');
        setGeneratedLink('');
        setLinkCopied(false);
    };

    const handleCopyGeneratedLink = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
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
                        <tr
                            key={user.id}
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        >
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
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
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {user.status === 'pending' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyLink(user);
                                            }}
                                            className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${copiedId === user.id ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-100 text-slate-400 hover:text-brand-600'}`}
                                            title="Copy Signup Link"
                                        >
                                            {copiedId === user.id ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                                            {copiedId === user.id && <span className="text-[10px] font-bold uppercase">Copied</span>}
                                        </button>
                                    )}
                                    <Pencil className="w-4 h-4 text-slate-300" />
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

            {/* Invite Modal */}
            {isInviting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={resetInvite}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 ease-out overflow-hidden">
                        
                        {/* Gradient Header with Icon */}
                        <div className="relative h-48 bg-gradient-to-b from-brand-50/50 to-white flex flex-col items-center justify-center pt-8">
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={resetInvite}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* 3D-ish Design Elements from the screenshot */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-10 left-10 w-32 h-32 border border-brand-200/50 rounded-full" />
                                <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-100/30 rounded-full blur-3xl" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-200/50 to-transparent" />
                                <div className="absolute top-1/2 left-0 w-full h-full">
                                     <svg className="w-full h-full opacity-[0.15]" viewBox="0 0 400 200">
                                         <path d="M0,100 Q100,20 200,100 T400,100" fill="none" stroke="#5438FF" strokeWidth="1" strokeDasharray="4 4" />
                                         <path d="M0,80 Q100,0 200,80 T400,80" fill="none" stroke="#5438FF" strokeWidth="0.5" />
                                     </svg>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-4 bg-white/50 rounded-3xl blur shadow-inner" />
                                <img 
                                    src="/team_invite_icon.png" 
                                    className="relative w-24 h-24 object-contain drop-shadow-xl"
                                    alt="Invite" 
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-10 pb-10 flex flex-col items-center text-center">
                            {inviteStep === 1 ? (
                                <>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Invite Your Team</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                        Invite your team using the invite code below or enter their email to send them an invite.
                                    </p>

                                    {/* Link Display (Step 1 placeholder style like in image) */}
                                    <div className="w-full bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl flex items-center justify-between p-2 mb-8 group transition-all hover:border-emerald-200">
                                        <div className="px-4 py-2 overflow-hidden">
                                            <p className="text-[#10B981] font-mono text-sm truncate">
                                                ****************************************
                                            </p>
                                        </div>
                                        <button disabled className="bg-white text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-100 flex items-center gap-2 cursor-not-allowed">
                                            <Copy className="w-4 h-4" /> Copy link
                                        </button>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="w-full space-y-6 text-left">
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-slate-700 ml-1">Select Role</label>
                                            <div className="relative group">
                                                <select
                                                    value={inviteRole}
                                                    onChange={e => setInviteRole(e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-slate-900 font-semibold shadow-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="staff">Staff (Account User)</option>
                                                    <option value="admin">Admin (Full Access)</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[13px] font-bold text-slate-700 ml-1">Email Address</label>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="email"
                                                        value={inviteEmail}
                                                        onChange={e => setInviteEmail(e.target.value)}
                                                        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-semibold text-slate-900 placeholder:text-slate-300 shadow-sm"
                                                        placeholder="Enter your team members email"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleInvite}
                                                    disabled={isSaving || !inviteEmail}
                                                    className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                                                >
                                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                                                    Invite
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Invitation Sent!</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
                                        The invitation has been created. Please <span className="text-brand-600 font-bold">copy the link below</span> and send it directly to your team member.
                                    </p>

                                    {/* Link Display (Step 2 - Actual Link) */}
                                    <div className="w-full bg-[#F0FDF4] border border-emerald-400 rounded-2xl flex items-center justify-between p-2 mb-10 group transition-all animate-in slide-in-from-bottom-2">
                                        <div className="px-4 py-2 overflow-hidden flex-1 text-left">
                                            <p className="text-[#10B981] font-mono text-sm truncate">
                                                {generatedLink}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={handleCopyGeneratedLink}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${linkCopied ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-300'}`}
                                        >
                                            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {linkCopied ? 'Copied!' : 'Copy link'}
                                        </button>
                                    </div>

                                    <div className="w-full bg-slate-50 p-6 rounded-[24px] border border-slate-100 text-left mb-8">
                                        <h4 className="text-[13px] font-bold text-slate-900 mb-2 uppercase tracking-tight">Instructions:</h4>
                                        <p className="text-[13px] text-slate-600 leading-relaxed">
                                            Copy the unique link generated above and share it with your colleague. They will need to use this specific link to create their account and automatically join your agency.
                                        </p>
                                    </div>

                                    <button
                                        onClick={resetInvite}
                                        className="w-full py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100/50 hover:bg-slate-100 rounded-2xl"
                                    >
                                        Close and return to team list
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
