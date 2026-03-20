import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-dashboard-gradient overflow-hidden relative selection:bg-brand-100 selection:text-brand-900">
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(prev => !prev)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Mobile top bar */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0 z-20">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                        aria-label="Open menu">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                            <span className="text-xs font-bold">TD</span>
                        </div>
                        <span className="font-bold text-slate-900">TravelDesk</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                <TopBar />

                <main className="flex-1 overflow-y-auto w-full transition-all duration-300 custom-scrollbar relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none" />
                    
                    <div className="relative h-full px-6 py-8 lg:px-10 lg:py-10 max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
