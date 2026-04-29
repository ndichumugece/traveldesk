import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseISO, format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

export interface AgentPerformance {
    userId: string;
    name: string;
    email: string;
    totalRevenue: number;
    bookings: number;
    totalDocuments: number;
    conversionRate: number;
    avgDealSize: number;
    contribution: number;
}

export interface MonthlyGrowth {
    month: string;
    revenue: number;
}

export interface SalesDashboardData {
    totalTeamRevenue: number;
    topPerformer: { name: string; revenue: number };
    avgSaleValue: number;
    teamConversionRate: number;
    agents: AgentPerformance[];
    monthlyGrowth: MonthlyGrowth[];
}

export const useDetailedUserStats = () => {
    const [data, setData] = useState<SalesDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch agents and documents
            const [agentsResponse, docsResponse] = await Promise.all([
                supabase.from('profiles').select('id, full_name, email').eq('status', 'active'),
                supabase.from('documents').select('amount, type, status, created_by, currency, exchange_rate, created_at, issue_date, metadata')
            ]);

            if (agentsResponse.error) throw agentsResponse.error;
            if (docsResponse.error) throw docsResponse.error;

            const agentsList = agentsResponse.data || [];
            const documents = docsResponse.data || [];

            // 1. Initial State for Agents
            const agentMap: Record<string, AgentPerformance> = {};
            agentsList.forEach(a => {
                agentMap[a.id] = {
                    userId: a.id,
                    name: a.full_name || 'Anonymous Agent',
                    email: a.email || '',
                    totalRevenue: 0,
                    bookings: 0,
                    totalDocuments: 0,
                    conversionRate: 0,
                    avgDealSize: 0,
                    contribution: 0
                };
            });

            // 2. Initial State for Monthly Growth (Current Year)
            const now = new Date();
            const yearInterval = { start: startOfYear(now), end: endOfYear(now) };
            const months = eachMonthOfInterval(yearInterval);
            const monthlyGrowthMap: Record<string, number> = {};
            months.forEach(m => monthlyGrowthMap[format(m, 'MMM')] = 0);

            let totalAgencyRevenue = 0;
            let totalAgencyBookings = 0;
            let totalAgencyDocs = 0;

            // 3. Aggregate
            documents.forEach(doc => {
                const userId = doc.created_by;
                const exchangeRate = Number(doc.exchange_rate) || 1;
                
                // Dashboard Logic: Use internalPrice for Booking Vouchers
                const internalPrice = Number(doc.metadata?.internalPrice || 0);
                const rawAmount = Number(doc.amount) || 0;
                
                // Determine normalized revenue based on document type
                const amountInKSH = (doc.type === 'Booking' || doc.type === 'Booking Voucher')
                    ? internalPrice 
                    : (doc.currency === 'USD' ? rawAmount * exchangeRate : rawAmount);

                // Define what counts as a sale/booking based on our broader dashboard definition
                const isBookingVoucher = doc.type === 'Booking' || doc.type === 'Booking Voucher';
                const isSale = isBookingVoucher 
                    ? ['confirmed', 'paid', 'pending', 'partial'].includes(doc.status?.toLowerCase())
                    : (doc.status === 'paid' || doc.status === 'confirmed');

                const docDate = parseISO(doc.created_at);

                if (agentMap[userId]) {
                    agentMap[userId].totalDocuments += 1;
                    if (isSale) {
                        agentMap[userId].totalRevenue += amountInKSH;
                        agentMap[userId].bookings += 1;
                        totalAgencyRevenue += amountInKSH;
                        totalAgencyBookings += 1;
                    }
                }

                // Monthly Trends (Confirmed/Active Sales Only)
                if (isSale && docDate >= yearInterval.start && docDate <= yearInterval.end) {
                    const mKey = format(docDate, 'MMM');
                    if (monthlyGrowthMap[mKey] !== undefined) {
                        monthlyGrowthMap[mKey] += amountInKSH;
                    }
                }
                
                totalAgencyDocs += 1;
            });

            // 4. Finalize Agent Stats
            const agents = Object.values(agentMap).map(a => ({
                ...a,
                conversionRate: a.totalDocuments > 0 ? (a.bookings / a.totalDocuments) * 100 : 0,
                avgDealSize: a.bookings > 0 ? Math.round(a.totalRevenue / a.bookings) : 0,
                contribution: totalAgencyRevenue > 0 ? (a.totalRevenue / totalAgencyRevenue) * 100 : 0
            })).sort((a, b) => b.totalRevenue - a.totalRevenue);

            // 5. Finalize Growth Data
            const monthlyGrowth = Object.entries(monthlyGrowthMap).map(([month, revenue]) => ({
                month,
                revenue: Math.round(revenue)
            }));

            setData({
                totalTeamRevenue: Math.round(totalAgencyRevenue),
                topPerformer: { 
                    name: agents[0]?.name || 'N/A', 
                    revenue: agents[0]?.totalRevenue || 0 
                },
                avgSaleValue: totalAgencyBookings > 0 ? Math.round(totalAgencyRevenue / totalAgencyBookings) : 0,
                teamConversionRate: totalAgencyDocs > 0 ? (totalAgencyBookings / totalAgencyDocs) * 100 : 0,
                agents,
                monthlyGrowth
            });

        } catch (err: any) {
            console.error('Error in useDetailedUserStats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};
