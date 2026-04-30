import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Users,
    LogOut,
    ChevronDown,
    FolderOpen,
    PanelLeftClose,
    PanelLeftOpen,
    X,
    Settings2,
    Car,
    Ticket,
    CheckCircle2,
    XCircle,
    Utensils,
    Calendar,
    Banknote,
    FileSpreadsheet,
    Wallet,
    Receipt,
    ArrowDownToLine,
    ArrowUpFromLine,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type NavItem = {
    name: string;
    href?: string;
    icon: any;
    subItems?: { name: string; href: string; icon?: any }[];
    adminOnly?: boolean;
};

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: true },
    {
        name: 'Bookings',
        icon: FolderOpen,
        subItems: [
            { name: 'Invoices', href: '/invoice', icon: FileText },
            { name: 'Confirmation Voucher', href: '/confirmation-voucher', icon: FileText },
            { name: 'Booking Voucher', href: '/booking-voucher', icon: FileText },
            { name: 'Quotations', href: '/quotation', icon: FileText },
        ]
    },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    {
        name: 'Finance',
        icon: Banknote,
        subItems: [
            { name: 'Overview', href: '/finance', icon: FileSpreadsheet },
            { name: 'Invoices', href: '/finance/invoices', icon: Receipt },
            { name: 'Payments', href: '/finance/payments', icon: ArrowDownToLine },
            { name: 'Expenses', href: '/finance/expenses', icon: ArrowUpFromLine },
            { name: 'Accounts', href: '/finance/accounts', icon: Wallet },
            { name: 'Reports', href: '/finance/reports', icon: FileText },
        ]
    },
    {
        name: 'Configuration',
        icon: Settings2,
        subItems: [
            { name: 'Properties', href: '/properties', icon: Building2 },
            { name: 'Transport', href: '/transport', icon: Car },
            { name: 'Activities', href: '/activities', icon: Ticket },
            { name: 'Inclusions', href: '/inclusions', icon: CheckCircle2 },
            { name: 'Exclusions', href: '/exclusions', icon: XCircle },
            { name: 'Meal Plans', href: '/meal-plans', icon: Utensils },
        ]
    },
    { name: 'Users', href: '/users', icon: Users, adminOnly: true },
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
    const { user, signOut, isAdmin, profile } = useAuth();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        'Bookings': true,
        'Finance': true,
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

    const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

    return (
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-slate-200/60 select-none">
            {/* Logo / Header */}
            <div className={cn('flex items-center p-4 h-[72px]', isCollapsed ? 'justify-center' : 'px-5 justify-between')}>
                {!isCollapsed && (
                    <img src="/traveldesk-logo.png" alt="TourOffice Logo" className="h-10 w-auto mix-blend-multiply" />
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
                {filteredNavigation.map((item) => {
                    const isOpen = openMenus[item.name];
                    return item.subItems ? (
                        <div key={item.name} className="flex flex-col gap-1">
                            <motion.button
                                onClick={() => toggleMenu(item.name)}
                                title={isCollapsed ? item.name : undefined}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    'flex items-center w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out group relative',
                                    'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                    isCollapsed ? 'justify-center' : 'justify-between'
                                )}>
                                <div className={cn('flex items-center', isCollapsed ? '' : 'gap-3')}>
                                    <item.icon className={cn('h-5 w-5 shrink-0 transition-colors', isOpen && !isCollapsed ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600')} />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </div>
                                {!isCollapsed && (
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                    </motion.div>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {isOpen && !isCollapsed && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col mt-1 mb-1 overflow-hidden" 
                                        style={{ borderLeft: '2px solid #cbd5e1', marginLeft: '34px' }}
                                    >
                                        {item.subItems.map((subItem) => (
                                            <div key={subItem.name} className="flex items-center">
                                                <div style={{ width: '16px', height: '2px', background: '#cbd5e1', flexShrink: 0 }} />
                                                <NavLink
                                                    to={subItem.href}
                                                    onClick={handleNavClick}
                                                    className={({ isActive }) =>
                                                        cn(
                                                            'flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ease-in-out relative',
                                                            isActive ? 'text-brand-700 font-semibold bg-brand-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                                        )
                                                    }>
                                                    {subItem.icon && <subItem.icon size={14} className="shrink-0" />}
                                                    {subItem.name}
                                                </NavLink>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-in-out relative group',
                                    isCollapsed ? 'justify-center' : 'gap-3',
                                    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )
                            }>
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn('h-5 w-5 shrink-0 transition-colors', isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600')} />
                                    {!isCollapsed && item.name}
                                    {isActive && !isCollapsed && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute left-0 w-1 h-6 bg-brand-600 rounded-r-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User / Sign-out */}
            <div className={cn('mt-auto p-3 border-t border-slate-200/60 bg-slate-50/50', isCollapsed ? 'flex flex-col items-center gap-2' : '')}>
                {!isCollapsed ? (
                    <>
                        <NavLink 
                            to="/profile" 
                            onClick={handleNavClick}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-2 py-2 mb-2 rounded-xl transition-colors group cursor-pointer",
                                isActive ? "bg-brand-50" : "hover:bg-slate-100/80"
                            )}
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className={cn(
                                    "text-sm font-semibold truncate transition-colors",
                                    "text-slate-900 group-hover:text-brand-600"
                                )}>
                                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate" title={user?.email || ''}>
                                    {user?.email || 'user@agency.com'}
                                </p>
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/settings" 
                            onClick={handleNavClick}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 ease-in-out mb-1 group",
                                isActive 
                                    ? "bg-brand-50 text-brand-600 shadow-sm" 
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <Settings2 size={18} className={cn("shrink-0", "text-slate-400 group-hover:text-slate-600")} />
                            Settings
                        </NavLink>

                        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors">
                            <LogOut size={18} className="shrink-0" />
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink 
                            to="/profile" 
                            title="Profile"
                            className={({ isActive }) => cn(
                                "w-9 h-9 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold overflow-hidden transition-all",
                                isActive ? "ring-2 ring-brand-500" : "bg-slate-200 text-slate-500 hover:bg-brand-100 hover:text-brand-700"
                            )}
                        >
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                            )}
                        </NavLink>
                        <NavLink 
                            to="/settings" 
                            title="Settings"
                            className={({ isActive }) => cn(
                                "p-2 rounded-xl transition-colors mb-1",
                                isActive ? "bg-brand-50 text-brand-600" : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <Settings2 size={18} />
                        </NavLink>
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
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={onMobileClose}
                    />
                )}
            </AnimatePresence>

            {/* ── Mobile slide-in drawer ───────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col shadow-2xl lg:hidden"
                    >
                        <SidebarContent collapsed={false} onToggle={onToggle} onMobileClose={onMobileClose} isMobile />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
