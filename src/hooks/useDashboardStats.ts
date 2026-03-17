import { useState, useEffect, useMemo } from 'react';
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
    const [documents, setDocuments] = useState<any[]>([]);
    const [userName, setUserName] = useState<string>('Admin');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);

                // Fetch current user profile and documents in parallel
                const [userResponse, documentsResponse] = await Promise.all([
                    supabase.auth.getUser(),
                    supabase
                        .from('documents')
                        .select('id, type, status, amount, client_name, reference, issue_date, created_at')
                        .order('created_at', { ascending: false })
                ]);
                
                const user = userResponse.data.user;
                const docs = documentsResponse.data || [];
                const supabaseError = documentsResponse.error;

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

                if (supabaseError) throw supabaseError;
                setDocuments(docs);

            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const { stats, revenueData, recentActivity } = useMemo(() => {
        if (!documents || documents.length === 0) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
                stats: { totalRevenue: 0, revenueTrend: 0, activeBookings: 0, bookingsTrend: 0, conversionRate: 0, conversionTrend: 0 },
                revenueData: months.map(m => ({ name: m, revenue: 0 })),
                recentActivity: []
            };
        }

        const revenueDocs = documents.filter(d =>
            (d.type === 'Invoice' || d.type === 'Voucher') &&
            (d.status === 'paid' || d.status === 'confirmed')
        );
        const totalRevenue = revenueDocs.reduce((sum, doc) => sum + Number(doc.amount), 0);
        const activeBookings = documents.filter(d => d.type === 'Voucher' && d.status === 'confirmed').length;
        const totalQuotations = documents.filter(d => d.type === 'Quotation').length;
        const convertedQuotations = documents.filter(d => d.type !== 'Quotation').length;
        const conversionRate = totalQuotations > 0 ? (convertedQuotations / totalQuotations) * 100 : 0;

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

        return {
            stats: {
                totalRevenue,
                revenueTrend: 0,
                activeBookings,
                bookingsTrend: 0,
                conversionRate: Math.round(conversionRate * 10) / 10,
                conversionTrend: 0,
            },
            revenueData: formattedChartData,
            recentActivity: formattedActivity
        };
    }, [documents]);

    return { stats, revenueData, recentActivity, userName, loading, error };
};
