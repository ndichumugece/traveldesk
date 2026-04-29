import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { parseISO, subDays, isAfter } from 'date-fns';

export interface ClientStats {
    totalRevenue: number;
    count: number;
    name: string;
    email: string;
    phone?: string;
    lastBookingDate: Date | null;
    status: 'Frequent' | 'Regular' | 'New';
}

export interface ClientDashboardData {
    topGuest: { name: string; count: number };
    avgRevenue: number;
    activeBookers: number;
    topByBookings: { name: string; count: number }[];
    topByRevenue: { name: string; amount: number }[];
    clientDirectory: ClientStats[];
}

const fetchClientStats = async () => {
    // Fetch all documents with necessary fields
    const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('amount, type, status, client_name, client_email, created_at, issue_date, metadata, exchange_rate, currency')
        .order('created_at', { ascending: false });

    if (docError) throw docError;
    if (!documents) return null;

    const clientMap: Record<string, ClientStats> = {};
    const ninetyDaysAgo = subDays(new Date(), 90);
    const uniqueClientsActive = new Set<string>();

    documents.forEach(doc => {
        const email = doc.client_email || 'unknown@example.com';
        const name = doc.client_name || 'Anonymous';
        const exchangeRate = Number(doc.exchange_rate) || 1;
        
        const internalPrice = Number(doc.metadata?.internalPrice || 0);
        const rawAmount = Number(doc.amount) || 0;
        
        const amountInKSH = (doc.type === 'Booking' || doc.type === 'Booking Voucher')
            ? internalPrice 
            : (doc.currency === 'USD' ? rawAmount * exchangeRate : rawAmount);

        const docDate = parseISO(doc.issue_date || doc.created_at);

        if (!clientMap[email]) {
            clientMap[email] = {
                name,
                email,
                totalRevenue: 0,
                count: 0,
                phone: doc.metadata?.clientPhone || '',
                lastBookingDate: docDate,
                status: 'New'
            };
        }

        const isBookingVoucher = doc.type === 'Booking' || doc.type === 'Booking Voucher';
        const isSale = isBookingVoucher 
            ? ['confirmed', 'paid', 'pending', 'partial'].includes(doc.status?.toLowerCase())
            : (doc.status === 'confirmed' || doc.status === 'paid');

        if (isSale) {
            clientMap[email].totalRevenue += amountInKSH;
        }

        if (isBookingVoucher) {
            clientMap[email].count += 1;
            if (isAfter(docDate, ninetyDaysAgo)) {
                uniqueClientsActive.add(email);
            }
        }

        if (!clientMap[email].lastBookingDate || isAfter(docDate, clientMap[email].lastBookingDate)) {
            clientMap[email].lastBookingDate = docDate;
        }
    });

    const directory = Object.values(clientMap).map(client => ({
        ...client,
        status: client.count > 3 ? 'Frequent' : client.count > 1 ? 'Regular' : 'New'
    })) as ClientStats[];

    const topByBookings = [...directory]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(c => ({ name: c.name, count: c.count }));

    const topByRevenue = [...directory]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)
        .map(c => ({ name: c.name, amount: Math.round(c.totalRevenue) }));

    const totalClients = directory.length;
    const totalRevenueAll = directory.reduce((sum, c) => sum + c.totalRevenue, 0);

    return {
        topGuest: topByBookings[0] || { name: 'N/A', count: 0 },
        avgRevenue: totalClients > 0 ? Math.round(totalRevenueAll / totalClients) : 0,
        activeBookers: uniqueClientsActive.size,
        topByBookings,
        topByRevenue,
        clientDirectory: directory.sort((a, b) => b.totalRevenue - a.totalRevenue)
    } as ClientDashboardData;
};

export const useClientStats = () => {
    return useQuery({
        queryKey: ['client-stats'],
        queryFn: fetchClientStats,
    });
};

