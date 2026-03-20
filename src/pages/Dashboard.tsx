import { DollarSign, Calendar, TrendingUp, Loader2, Zap, ArrowRight, Star } from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { UserSalesLeaderboard } from '../components/dashboard/UserSalesLeaderboard';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAuth } from '../lib/AuthContext';

export function Dashboard() {
    const { stats, revenueData, recentActivity, userName, loading } = useDashboardStats();
    const { isAdmin } = useAuth();

    const firstName = userName?.split(' ')[0] || 'Member';

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 sm:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -u-1/4 w-1/2 h-full bg-gradient-to-l from-brand-600/20 to-transparent blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 mb-6">
                            <Star className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-widest">Platform Insights</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
                            Welcome back, {firstName}
                        </h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Your agency is performing exceptionally well this month. Here's a quick look at your growth and latest records.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-white/5">
                                Generate Monthly Report
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-all active:scale-95 border border-slate-700/50">
                                View Recent Bookings
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="w-64 h-64 relative">
                            <div className="absolute inset-0 bg-brand-500 rounded-full blur-[80px] opacity-20" />
                            <div className="relative w-full h-full bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-[48px] shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-700 group cursor-default">
                                <Zap className="w-24 h-24 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <MetricCard
                    title="Total Revenue"
                    value={`KSH ${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    iconColor="brand"
                    trend={{ value: stats.revenueTrend || 12.5, isPositive: true }}
                />
                <MetricCard
                    title="Active Bookings"
                    value={stats.activeBookings.toString()}
                    icon={Calendar}
                    iconColor="emerald"
                    trend={{ value: stats.bookingsTrend || 4.2, isPositive: true }}
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${stats.conversionRate}%`}
                    icon={TrendingUp}
                    iconColor="amber"
                    trend={{ value: stats.conversionTrend || 1.1, isPositive: false }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <RevenueChart data={revenueData} />
                </div>
                <div className="lg:col-span-4 h-full">
                    <RecentActivity activities={recentActivity} className="h-full" />
                </div>
            </div>

            {/* Leaderboard Section */}
            {isAdmin && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Performance</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <UserSalesLeaderboard />
                </div>
            )}
        </div>
    );
}
