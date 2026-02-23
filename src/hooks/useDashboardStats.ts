import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseISO } from 'date-fns';

export interface DashboardStats {
    totalRevenue: number;
    revenueTrend: number;
    activeBookings: number;
    bookingsTrend: number;
    conversionRate: number;
    conversionTrend: number;
}

export interface ChartData {
    name: string;
    revenue: number;
}

export interface Activity {
    id: string;
    client: string;
    type: string;
    document: string;
    timestamp: Date;
}

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        revenueTrend: 0,
        activeBookings: 0,
        bookingsTrend: 0,
        conversionRate: 0,
        conversionTrend: 0,
    });
    const [revenueData, setRevenueData] = useState<ChartData[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [userName, setUserName] = useState<string>('Admin');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);

                // Fetch current user profile
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();

                    if (profile?.full_name) {
                        setUserName(profile.full_name);
                    }
                }

                // Fetch all documents. For a production app this should be optimized
                // typically with RPC calls, database views, or explicit start/end date ranges.
                const { data: documents, error: supabaseError } = await supabase
                    .from('documents')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (supabaseError) throw supabaseError;

                if (!documents || documents.length === 0) {
                    // Provide empty states
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    setRevenueData(months.map(m => ({ name: m, revenue: 0 })));
                    setRecentActivity([]);
                    return;
                }

                // Calculate Revenue
                const revenueDocs = documents.filter(d =>
                    (d.type === 'Invoice' || d.type === 'Voucher') &&
                    (d.status === 'paid' || d.status === 'confirmed')
                );
                const totalRevenue = revenueDocs.reduce((sum, doc) => sum + Number(doc.amount), 0);

                // Calculate Active Bookings
                const activeBookings = documents.filter(d =>
                    d.type === 'Voucher' && d.status === 'confirmed'
                ).length;

                // Calculate Conversion Rate
                const totalQuotations = documents.filter(d => d.type === 'Quotation').length;
                const convertedQuotations = documents.filter(d => d.type !== 'Quotation').length;
                const conversionRate = totalQuotations > 0 ? (convertedQuotations / totalQuotations) * 100 : 0;

                // Calculate Revenue Chart Data (Current Year)
                const currentYear = new Date().getFullYear();
                const monthlyRevenue = new Array(12).fill(0);

                revenueDocs.forEach(doc => {
                    const dateStr = doc.issue_date || doc.created_at;
                    if (dateStr) {
                        const date = parseISO(dateStr);
                        if (date.getFullYear() === currentYear) {
                            monthlyRevenue[date.getMonth()] += Number(doc.amount);
                        }
                    }
                });

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const formattedChartData = months.map((month, index) => ({
                    name: month,
                    revenue: monthlyRevenue[index]
                }));

                // Format Recent Activity (Last 5)
                const formattedActivity = documents.slice(0, 5).map(doc => {
                    let activityType = 'document_created';
                    if (doc.type === 'Voucher' && doc.status === 'confirmed') activityType = 'booking_confirmed';
                    if (doc.type === 'Invoice') activityType = 'invoice_sent';

                    return {
                        id: doc.id,
                        client: doc.client_name,
                        type: activityType,
                        document: `${doc.type} ${doc.reference}`,
                        timestamp: parseISO(doc.created_at)
                    };
                });

                setStats({
                    totalRevenue,
                    revenueTrend: 0, // In a real app, compare with previous period
                    activeBookings,
                    bookingsTrend: 0,
                    conversionRate: Math.round(conversionRate * 10) / 10,
                    conversionTrend: 0,
                });

                setRevenueData(formattedChartData);
                setRecentActivity(formattedActivity);

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return { stats, revenueData, recentActivity, userName, loading, error };
};
