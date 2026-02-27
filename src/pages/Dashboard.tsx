import { DollarSign, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { useDashboardStats } from '../hooks/useDashboardStats';

export function Dashboard() {
    const { stats, revenueData, recentActivity, userName, loading } = useDashboardStats();

    const firstName = userName?.split(' ')[0] || 'Admin';

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#5438FF]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
                <p className="text-slate-500 mt-1">Here is the overview of your agency's performance today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`KSH ${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend={{ value: stats.revenueTrend || 12.5, isPositive: true }}
                />
                <MetricCard
                    title="Active Bookings"
                    value={stats.activeBookings.toString()}
                    icon={Calendar}
                    trend={{ value: stats.bookingsTrend || 4.2, isPositive: true }}
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${stats.conversionRate}%`}
                    icon={TrendingUp}
                    trend={{ value: stats.conversionTrend || 1.1, isPositive: false }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart data={revenueData} />
                </div>
                <div className="lg:col-span-1">
                    <RecentActivity activities={recentActivity} />
                </div>
            </div>
        </div>
    );
}
