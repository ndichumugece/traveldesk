import { Search, Bell, Plus, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function TopBar() {
    const { user, signOut, isAdmin } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <header className="h-20 glass border-b border-slate-200/50 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search for bookings, clients, or reports..."
                    className="w-full bg-slate-100/50 border-0 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all outline-none"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>
                
                <div className="w-px h-6 bg-slate-200 mx-2" />

                <button className="hidden sm:flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all shadow-lg shadow-brand-600/20">
                    <Plus className="w-4 h-4" />
                    New Booking
                </button>

                {/* Profile */}
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-1.5 pl-1.5 pr-3 rounded-2xl hover:bg-slate-100/80 transition-all group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">
                                {user?.email?.split('@')[0] || 'Member'}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                {isAdmin ? 'Administrator' : 'Staff'}
                            </p>
                        </div>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-premium border border-slate-200/50 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Current User</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                                </div>
                                
                                <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Account Settings
                                </Link>
                                
                                <button 
                                    onClick={signOut}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
