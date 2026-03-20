import { NavLink } from 'react-router-dom';
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
    Car,
    Ticket,
    CheckCircle2,
    XCircle,
    Utensils,
    Layers,
    LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';
import { useState } from 'react';

type NavItem = {
    name: string;
    href?: string;
    icon: any;
    subItems?: { name: string; href: string; icon?: any }[];
    adminOnly?: boolean;
    badge?: string;
};

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: true },
    { name: 'Properties', href: '/properties', icon: Building2 },
    {
        name: 'Reports & Folders',
        icon: FolderOpen,
        subItems: [
            { name: 'Invoices', href: '/invoice', icon: FileText },
            { name: 'Confirmation Voucher', href: '/confirmation-voucher', icon: FileText },
            { name: 'Booking Voucher', href: '/booking-voucher', icon: FileText },
            { name: 'Quotations', href: '/quotation', icon: FileText },
        ]
    },
    {
        name: 'Infrastructure',
        icon: Layers,
        subItems: [
            { name: 'Transport', href: '/transport', icon: Car },
            { name: 'Activities', href: '/activities', icon: Ticket },
            { name: 'Inclusions', href: '/inclusions', icon: CheckCircle2 },
            { name: 'Exclusions', href: '/exclusions', icon: XCircle },
            { name: 'Meal Plans', href: '/meal-plans', icon: Utensils },
        ]
    },
    { name: 'User Management', href: '/users', icon: Users, adminOnly: true, badge: 'Admin' },
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
    const { signOut, isAdmin } = useAuth();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        'Reports & Folders': true,
        'Infrastructure': false,
    });

    const toggleMenu = (name: string) => {
        if (collapsed && !isMobile) return;
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const isCollapsed = isMobile ? false : collapsed;
    const handleNavClick = () => { if (isMobile) onMobileClose(); };
    const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200/50 select-none overflow-hidden">
            {/* Header / Brand */}
            <div className={cn('flex items-center px-6 h-20 shrink-0 border-b border-slate-50', isCollapsed ? 'justify-center' : 'justify-between')}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                            <Layers className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-800">TravelDesk</span>
                    </div>
                )}
                {isMobile ? (
                    <button onClick={onMobileClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all shrink-0 ml-auto">
                        <X size={20} />
                    </button>
                ) : (
                    <button onClick={onToggle} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all shrink-0">
                        {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {!isCollapsed && (
                    <p className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
                )}
                {filteredNavigation.map((item) => {
                    const isOpen = openMenus[item.name];
                    return item.subItems ? (
                        <div key={item.name} className="flex flex-col gap-1 mb-1">
                            <button
                                onClick={() => toggleMenu(item.name)}
                                className={cn(
                                    'flex items-center w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all group relative',
                                    isOpen && !isCollapsed ? 'text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                    isCollapsed ? 'justify-center' : 'justify-between'
                                )}>
                                <div className={cn('flex items-center', isCollapsed ? '' : 'gap-3')}>
                                    <item.icon className={cn('h-5 w-5 shrink-0 transition-colors', isOpen && !isCollapsed ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600')} />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </div>
                                {!isCollapsed && (
                                    isOpen ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />
                                )}
                            </button>

                            {isOpen && !isCollapsed && (
                                <div className="flex flex-col ml-9 mt-1 pr-2 gap-0.5 border-l-2 border-slate-100">
                                    {item.subItems.map((subItem) => (
                                        <NavLink
                                            key={subItem.name}
                                            to={subItem.href}
                                            onClick={handleNavClick}
                                            className={({ isActive }: { isActive: boolean }) =>
                                                cn(
                                                    'flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                                                    isActive 
                                                        ? 'text-brand-700 bg-brand-50/50 -ml-[2px] border-l-2 border-brand-600' 
                                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                                                )
                                            }>
                                            {subItem.icon && <subItem.icon size={14} className="opacity-70" />}
                                            {subItem.name}
                                        </NavLink>
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
                            className={({ isActive }: { isActive: boolean }) =>
                                cn(
                                    'flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all group relative',
                                    isCollapsed ? 'justify-center' : 'gap-3',
                                    isActive 
                                        ? 'bg-brand-50/50 text-brand-600 shadow-sm ring-1 ring-brand-100/50' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )
                            }>
                            <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600')} />
                            {!isCollapsed && (
                                <>
                                    <span className="flex-1">{item.name}</span>
                                    {item.badge && (
                                        <span className="px-1.5 py-0.5 rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-100/50 uppercase tracking-tighter">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto p-4 space-y-1 bg-slate-50/30">
                <button className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 rounded-2xl hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all group')}>
                    <LifeBuoy size={18} className="group-hover:text-brand-500" />
                    {!isCollapsed && <span>Help Center</span>}
                </button>
                <button onClick={signOut} className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all group')}>
                    <LogOut size={18} />
                    {!isCollapsed && <span>Log Out</span>}
                </button>
            </div>
        </div>
    );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    return (
        <>
            <div
                className={cn(
                    'hidden lg:flex flex-col min-h-screen shrink-0 transition-all duration-500 ease-in-out z-40',
                    collapsed ? 'w-[88px]' : 'w-[280px]'
                )}>
                <SidebarContent collapsed={collapsed} onToggle={onToggle} onMobileClose={onMobileClose} />
            </div>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300" onClick={onMobileClose} />
            )}

            <div className={cn(
                'fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col shadow-2xl lg:hidden transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <SidebarContent collapsed={false} onToggle={onToggle} onMobileClose={onMobileClose} isMobile />
            </div>
        </>
    );
}
