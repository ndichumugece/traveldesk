import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Users,
    LogOut,
    ChevronDown,
    ChevronUp,
    FolderOpen,
    PanelLeftClose,
    PanelLeftOpen,
    X,
    Settings2,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';
import { useState } from 'react';

type NavItem = {
    name: string;
    href?: string;
    icon: any;
    subItems?: { name: string; href: string; icon?: any }[];
};

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Properties', href: '/properties', icon: Building2 },
    {
        name: 'Bookings',
        icon: FolderOpen,
        subItems: [
            { name: 'Invoices', href: '/invoices', icon: FileText },
            { name: 'Confirmation Voucher', href: '/invoices?type=confirmation', icon: FileText },
            { name: 'Booking Voucher', href: '/invoices?type=booking', icon: FileText },
            { name: 'Quotation Voucher', href: '/invoices?type=quotation', icon: FileText },
        ]
    },
    {
        name: 'Configuration',
        icon: Settings2,
        subItems: [
            { name: 'Transport', href: '/transport' },
            { name: 'Activities', href: '/activities' },
        ]
    },
    { name: 'Users', href: '/users', icon: Users },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

function SidebarContent({
    collapsed,
    onToggle,
    onMobileClose,
    isMobile = false,
}: {
    collapsed: boolean;
    onToggle: () => void;
    onMobileClose: () => void;
    isMobile?: boolean;
}) {
    const { user, signOut } = useAuth();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        'Bookings': true,
        'Configuration': true,
    });

    const toggleMenu = (name: string) => {
        if (collapsed && !isMobile) return;
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // On mobile sidebar, treat as always expanded
    const isCollapsed = isMobile ? false : collapsed;

    const handleNavClick = () => {
        if (isMobile) onMobileClose();
    };

    return (
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-slate-200/60 select-none">
            {/* Logo / Header */}
            <div className={cn('flex items-center p-4 h-[72px]', isCollapsed ? 'justify-center' : 'px-5 justify-between')}>
                {!isCollapsed && (
                    <img src="/traveldesk-logo.png" alt="TravelDesk Logo" className="h-10 w-auto mix-blend-multiply" />
                )}
                {isMobile ? (
                    <button onClick={onMobileClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-auto">
                        <X size={18} />
                    </button>
                ) : (
                    <button onClick={onToggle}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto overflow-x-hidden">
                {navigation.map((item) => {
                    const isOpen = openMenus[item.name];
                    return item.subItems ? (
                        <div key={item.name} className="flex flex-col gap-1">
                            <button
                                onClick={() => toggleMenu(item.name)}
                                title={isCollapsed ? item.name : undefined}
                                className={cn(
                                    'flex items-center w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out group',
                                    'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                    isCollapsed ? 'justify-center' : 'justify-between'
                                )}>
                                <div className={cn('flex items-center', isCollapsed ? '' : 'gap-3')}>
                                    <item.icon className={cn('h-5 w-5 shrink-0', isOpen && !isCollapsed ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600')} />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </div>
                                {!isCollapsed && (
                                    isOpen
                                        ? <ChevronUp className="h-4 w-4 text-slate-400" />
                                        : <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>

                            {isOpen && !isCollapsed && (
                                <div className="flex flex-col mt-1 mb-1" style={{ borderLeft: '2px solid #cbd5e1', marginLeft: '34px' }}>
                                    {item.subItems.map((subItem) => (
                                        <div key={subItem.name} className="flex items-center">
                                            <div style={{ width: '16px', height: '2px', background: '#cbd5e1', flexShrink: 0 }} />
                                            <NavLink
                                                to={subItem.href}
                                                onClick={handleNavClick}
                                                className={({ isActive }) =>
                                                    cn(
                                                        'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ease-in-out',
                                                        isActive ? 'text-brand-700 font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                                    )
                                                }>
                                                {subItem.name}
                                            </NavLink>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <NavLink
                            key={item.name}
                            to={item.href!}
                            end={item.href === '/'}
                            onClick={handleNavClick}
                            title={isCollapsed ? item.name : undefined}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out',
                                    isCollapsed ? 'justify-center' : 'gap-3',
                                    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )
                            }>
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && item.name}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User / Sign-out */}
            <div className={cn('mt-auto p-3 border-t border-slate-200/60 bg-slate-50/50', isCollapsed ? 'flex flex-col items-center gap-2' : '')}>
                {!isCollapsed ? (
                    <>
                        <Link to="/settings" onClick={handleNavClick} className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl hover:bg-slate-100/80 transition-colors group cursor-pointer">
                            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 shrink-0 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                                    {user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate" title={user?.email || ''}>
                                    {user?.email || 'user@agency.com'}
                                </p>
                            </div>
                        </Link>
                        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors">
                            <LogOut size={18} />
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/settings" title="Settings" className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 hover:bg-brand-100 hover:text-brand-700 transition-colors">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </Link>
                        <button onClick={signOut} title="Sign out" className="flex items-center justify-center p-2 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors">
                            <LogOut size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    return (
        <>
            {/* ── Desktop sidebar ─────────────────────────────── */}
            <div
                className={cn(
                    'hidden lg:flex flex-col min-h-screen shrink-0 transition-all duration-300 ease-in-out',
                    collapsed ? 'w-16' : 'w-64'
                )}>
                <SidebarContent collapsed={collapsed} onToggle={onToggle} onMobileClose={onMobileClose} />
            </div>

            {/* ── Mobile overlay backdrop ──────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* ── Mobile slide-in drawer ───────────────────────── */}
            <div className={cn(
                'fixed inset-y-0 left-0 z-50 w-72 flex flex-col shadow-2xl lg:hidden transition-transform duration-300 ease-in-out',
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <SidebarContent collapsed={false} onToggle={onToggle} onMobileClose={onMobileClose} isMobile />
            </div>
        </>
    );
}
