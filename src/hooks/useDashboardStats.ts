import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { parseISO, subDays, startOfDay, isWithinInterval, format, eachDayOfInterval, startOfYear, endOfYear, subYears } from 'date-fns';
import { useQueryState } from './useQueryState';

export type TimeRange = 'week' | 'month' | 'year';

export interface DashboardStats {
    totalRevenue: number;
    totalProfit: number;
    revenueTrend: number;
    profitTrend: number;
    activeBookings: number;
    bookingsTrend: number;
    conversionRate: number;
    conversionTrend: number;
    topProperties: Array<{ name: string; amount: number; count: number }>;
    topClients: Array<{ name: string; amount: number; count: number }>;
    leadSources: Array<{ name: string; amount: number; count: number }>;
}

export interface ChartData {
    name: string;
    revenue: number;
    count: number;
}

export interface Activity {
    id: string;
    client: string;
    type: string;
    document: string;
    timestamp: Date;
}

const fetchDashboardStats = async (timeRange: TimeRange) => {
    // Fetch data in parallel
    const [userResponse, documentsResponse] = await Promise.all([
        supabase.auth.getUser(),
        supabase
            .from('documents')
            .select('id, type, status, amount, client_name, reference, issue_date, created_at, metadata, line_items, currency, exchange_rate')
            .order('created_at', { ascending: false })
            .limit(1000)
    ]);
    
    const user = userResponse.data.user;
    const documents = documentsResponse.data;
    const supabaseError = documentsResponse.error;

    let userName = 'Admin';
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        if (profile?.full_name) {
            userName = profile.full_name;
        }
    }

    if (supabaseError) throw supabaseError;
    if (!documents) throw new Error('No documents found');

    // --- 1. DEFINE TIME INTERVALS ---
    const now = new Date();
    let interval: { start: Date; end: Date };
    let prevInterval: { start: Date; end: Date };
    let bucketFormat: string;
    let buckets: string[] = [];

    if (timeRange === 'week') {
        interval = { start: startOfDay(subDays(now, 6)), end: now };
        prevInterval = { start: startOfDay(subDays(now, 13)), end: startOfDay(subDays(now, 7)) };
        bucketFormat = 'EEE'; 
        buckets = eachDayOfInterval(interval).map(d => format(d, bucketFormat));
    } else if (timeRange === 'month') {
        interval = { start: startOfDay(subDays(now, 29)), end: now };
        prevInterval = { start: startOfDay(subDays(now, 59)), end: startOfDay(subDays(now, 30)) };
        bucketFormat = 'MMM dd';
        buckets = eachDayOfInterval(interval).map(d => format(d, bucketFormat));
    } else {
        interval = { start: startOfYear(now), end: endOfYear(now) };
        prevInterval = { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
        bucketFormat = 'MMM';
        buckets = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    // --- 2. AGGREGATIONS ---
    let totalRevenue = 0;
    let totalProfit = 0;
    let activeBookings = 0;

    let prevRevenue = 0;
    let prevProfit = 0;
    let prevActiveBookings = 0;

    let totalVouchers = 0;
    let confirmedVouchers = 0;
    
    const bucketData: Record<string, { revenue: number, count: number }> = {};
    buckets.forEach(b => bucketData[b] = { revenue: 0, count: 0 });

    const propertyMap: Record<string, { amount: number, count: number }> = {};
    const clientMap: Record<string, { amount: number, count: number }> = {};
    const leadSourceMap: Record<string, { amount: number, count: number }> = {};

    documents.forEach(doc => {
        const isBooking = doc.type === 'Booking' || doc.type === 'Booking Voucher';
        if (!isBooking) return;

        const internalPrice = Number(doc.metadata?.internalPrice || 0);
        const dateStr = doc.issue_date || doc.created_at;
        const docDate = parseISO(dateStr);
        
        const isRevenue = ['confirmed', 'paid', 'pending', 'partial'].includes(doc.status?.toLowerCase());
        const isActive = (doc.status !== 'cancelled' && doc.status !== 'rejected');

        if (isWithinInterval(docDate, interval)) {
            if (isRevenue) {
                totalRevenue += internalPrice;
                totalProfit += 0;
            }
            if (isActive) activeBookings++;
            totalVouchers++;
            if (doc.status === 'confirmed') confirmedVouchers++;

            const bKey = format(docDate, bucketFormat);
            if (bucketData[bKey]) {
                if (isRevenue) bucketData[bKey].revenue += internalPrice;
                if (isActive) bucketData[bKey].count += 1;
            }

            const propName = doc.metadata?.unitName || doc.metadata?.hotelName || doc.metadata?.propertyName || 'Miscellaneous';
            if (!propertyMap[propName]) propertyMap[propName] = { amount: 0, count: 0 };
            propertyMap[propName].amount += internalPrice;
            propertyMap[propName].count += 1;

            const clientName = doc.client_name || 'Anonymous';
            if (!clientMap[clientName]) clientMap[clientName] = { amount: 0, count: 0 };
            clientMap[clientName].amount += internalPrice;
            clientMap[clientName].count += 1;

            const leadSource = doc.metadata?.leadSource || 'Unknown';
            if (!leadSourceMap[leadSource]) leadSourceMap[leadSource] = { amount: 0, count: 0 };
            leadSourceMap[leadSource].amount += internalPrice;
            leadSourceMap[leadSource].count += 1;
        } 
        else if (isWithinInterval(docDate, prevInterval)) {
            if (isRevenue) {
                prevRevenue += internalPrice;
                prevProfit += 0;
            }
            if (isActive) prevActiveBookings++;
        }
    });

    const formattedChartData = buckets.map(b => ({
        name: b,
        revenue: Math.round(bucketData[b].revenue),
        count: bucketData[b].count
    }));

    const topProperties = Object.entries(propertyMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const topClients = Object.entries(clientMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const topLeadSources = Object.entries(leadSourceMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

    const formattedActivity = documents.slice(0, 10).map(doc => ({
        id: doc.id,
        client: doc.client_name || 'Prospect',
        type: doc.type === 'Quotation' ? 'quotation_created' : 
              (doc.type === 'Voucher' || doc.type === 'Booking Voucher') && doc.status === 'confirmed' ? 'booking_confirmed' : 
              doc.type === 'Invoice' ? 'invoice_sent' : 'document_created',
        document: `${doc.type} ${doc.reference || ''}`,
        timestamp: parseISO(doc.created_at)
    }));

    const calcTrend = (cur: number, prev: number) => {
        if (prev === 0) return cur > 0 ? 100 : 0;
        return Math.round(((cur - prev) / prev) * 100);
    };

    const conversionRate = totalVouchers > 0 ? (confirmedVouchers / totalVouchers) * 100 : 0;

    return {
        stats: {
            totalRevenue: Math.round(totalRevenue),
            totalProfit: Math.round(totalProfit),
            revenueTrend: calcTrend(totalRevenue, prevRevenue),
            profitTrend: calcTrend(totalProfit, prevProfit),
            activeBookings,
            bookingsTrend: calcTrend(activeBookings, prevActiveBookings),
            conversionRate: Math.round(conversionRate * 10) / 10,
            conversionTrend: 0,
            topProperties,
            topClients,
            leadSources: topLeadSources
        } as DashboardStats,
        revenueData: formattedChartData,
        recentActivity: formattedActivity,
        userName
    };
};

export const useDashboardStats = () => {
    const [timeRange, setTimeRange] = useQueryState<TimeRange>('range', 'year');

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['dashboard', timeRange],
        queryFn: () => fetchDashboardStats(timeRange),
    });

    return {
        stats: data?.stats,
        revenueData: data?.revenueData,
        recentActivity: data?.recentActivity,
        userName: data?.userName,
        loading: isLoading,
        isFetching,
        error: error ? (error as Error).message : null,
        timeRange,
        setTimeRange
    };
};
