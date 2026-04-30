import { DollarSign, Calendar, Loader2, Wallet } from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { BookingsChart } from '../components/dashboard/BookingsChart';
import { RankingCard } from '../components/dashboard/RankingCard';
import { UserSalesLeaderboard } from '../components/dashboard/UserSalesLeaderboard';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAuth } from '../lib/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';
import { containerVariants } from '../lib/animations';

export function Dashboard() {
    const { stats, revenueData, userName, loading, isFetching, timeRange, setTimeRange } = useDashboardStats();
    const { isAdmin } = useAuth();

    const firstName = userName?.split(' ')[0] || 'Admin';

    const shouldReduceMotion = useReducedMotion();

    if (loading && !stats) {
        return (
            <div className="h-full w-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const rangeLabel = timeRange === 'week' ? 'this week' : timeRange === 'month' ? 'the last 30 days' : 'this year';

    return (
        <motion.div 
            initial="initial"
            animate="animate"
            variants={shouldReduceMotion ? {} : containerVariants}
            className="space-y-8 pb-12 relative"
        >
            {isFetching && (
                <div className="absolute top-0 right-0 p-2 z-50">
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Updating...</span>
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Here's a breakdown of performance for <span className="text-brand-600 font-bold">{rangeLabel}</span>.</p>
                </div>

                {/* Time Range Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`relative px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                                timeRange === range
                                    ? 'text-brand-600'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {timeRange === range && (
                                <motion.div
                                    layoutId="active-range"
                                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{range}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard
                    variant="orange"
                    title={`${timeRange === 'year' ? 'Annual' : timeRange === 'week' ? 'Weekly' : 'Monthly'} Revenue`}
                    value={`KSH ${(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    trend={{ value: Math.abs(stats?.revenueTrend || 0), isPositive: (stats?.revenueTrend || 0) >= 0 }}
                    href="/invoice"
                />
                <MetricCard
                    variant="emerald"
                    title={`${timeRange === 'year' ? 'Annual' : timeRange === 'week' ? 'Weekly' : 'Monthly'} Profit`}
                    value={`KSH ${(stats?.totalProfit || 0).toLocaleString()}`}
                    icon={Wallet}
                    trend={{ value: Math.abs(stats?.profitTrend || 0), isPositive: (stats?.profitTrend || 0) >= 0 }}
                    href="/invoice"
                />
                <MetricCard
                    variant="indigo"
                    title="Active Bookings"
                    value={(stats?.activeBookings || 0).toString()}
                    icon={Calendar}
                    trend={{ value: Math.abs(stats?.bookingsTrend || 0), isPositive: (stats?.bookingsTrend || 0) >= 0 }}
                    href="/calendar"
                />
            </div>

            {/* Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={revenueData || []} range={timeRange} href="/invoice" />
                <BookingsChart data={revenueData || []} range={timeRange} href="/calendar" />
            </div>

            {/* Rankings Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RankingCard 
                    title={`Top Properties (${timeRange})`} 
                    items={stats?.topProperties?.slice(0, 3) || []} 
                    type="properties" 
                    href="/top-properties"
                />
                <RankingCard 
                    title={`Top Clients (${timeRange})`} 
                    items={stats?.topClients?.slice(0, 3) || []} 
                    type="clients" 
                    href="/clients"
                />
            </div>

            {/* Performance Row */}
            {isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <UserSalesLeaderboard />
                    <RankingCard 
                        title={`Lead Sources (${timeRange})`} 
                        items={stats?.leadSources?.slice(0, 3) || []} 
                        type="lead-sources" 
                        href="/lead-sources"
                    />
                </div>
            )}
            </motion.div>
    );
}
