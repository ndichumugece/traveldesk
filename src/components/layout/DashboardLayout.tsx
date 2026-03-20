import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close the mobile drawer automatically on every navigation
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(prev => !prev)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Mobile top bar — only visible on small screens */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Open menu">
                        <Menu className="w-5 h-5" />
                    </button>
                    <img src="/traveldesk-logo.png" alt="TravelDesk" className="h-8 w-auto mix-blend-multiply" />
                </header>

                <main className="flex-1 overflow-y-auto w-full transition-all duration-300 page-transition">
                    <div className="h-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
