import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface PropertyPerformance {
    id: string;
    name: string;
    location: string;
    type: string;
    totalRevenue: number;
    count: number;
    avgRate: number;
    bookings: number;
}

export interface PropertyDashboardData {
    bestPerforming: { name: string; revenue: number };
    totalBookings: number;
    avgRevPerProperty: number;
    properties: PropertyPerformance[];
    typeDistribution: { name: string; value: number }[];
    locationDistribution: { name: string; revenue: number }[];
}

export const fetchPropertyStats = async (): Promise<PropertyDashboardData> => {
    // Fetch properties and documents in parallel
    const [propResponse, docResponse] = await Promise.all([
        supabase.from('properties').select('id, name, location, property_type'),
        supabase.from('documents').select('amount, metadata, currency, exchange_rate, type, status, issue_date, created_at')
    ]);

    if (propResponse.error) throw propResponse.error;
    if (docResponse.error) throw docResponse.error;

    const masterProperties = propResponse.data || [];
    const documents = docResponse.data || [];

    const propertyMap: Record<string, PropertyPerformance> = {};
    
    // 1. Initialize from master properties using lowercase keys for matching
    masterProperties.forEach(p => {
        const normalizedName = (p.name || '').toLowerCase().trim();
        propertyMap[normalizedName] = {
            id: p.id,
            name: p.name,
            location: p.location || 'Unknown',
            type: p.property_type || 'Hotel',
            totalRevenue: 0,
            count: 0,
            avgRate: 0,
            bookings: 0
        };
    });

    // 2. Aggregate from documents
    documents.forEach(doc => {
        const meta = doc.metadata || {};
        const propName = meta.unitName || meta.hotelName || meta.propertyName || 
                        meta.unit_name || meta.hotel_name || meta.property_name || 
                        meta.property || meta.unit || meta.hotel || 'Miscellaneous';

        const rawAmount = Number(doc.amount) || 0;
        const exchangeRate = Number(doc.exchange_rate) || 1;
        const internalPrice = Number(meta.internalPrice || 0);
        
        // Determine normalized revenue based on document type
        const amountInKSH = (doc.type === 'Booking' || doc.type === 'Booking Voucher')
            ? internalPrice 
            : (doc.currency?.toUpperCase() === 'USD' ? rawAmount * exchangeRate : rawAmount);

        const status = (doc.status || '').toLowerCase().trim();
        const type = (doc.type || '').toLowerCase().trim();
        
        // Dashboard Logic: Broaden allowed types and statuses
        const isBookingVoucher = type === 'booking voucher' || type === 'booking';
        const isConfirmed = isBookingVoucher
            ? ['confirmed', 'paid', 'approved', 'active', 'completed', 'pending', 'partial'].includes(status)
            : ['confirmed', 'paid', 'approved', 'active', 'completed'].includes(status);
        
        const isRelevantDoc = ['voucher', 'booking voucher', 'booking', 'invoice', 'receipt'].includes(type);
        const isRevenue = isConfirmed && isRelevantDoc;

        const normalizedName = propName.toLowerCase().trim();
        if (!propertyMap[normalizedName]) {
            propertyMap[normalizedName] = {
                id: 'misc',
                name: propName,
                location: 'Unknown',
                type: 'Miscellaneous',
                totalRevenue: 0,
                count: 0,
                avgRate: 0,
                bookings: 0
            };
        }

        if (isRevenue) {
            propertyMap[normalizedName].totalRevenue += amountInKSH;
        }

        if (isRelevantDoc) {
            propertyMap[normalizedName].bookings += 1;
            propertyMap[normalizedName].count += 1;
        }
    });

    const performanceList = Object.values(propertyMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // 3. Distribution Metrics
    const typeMap: Record<string, number> = {};
    const locMap: Record<string, number> = {};

    performanceList.forEach(p => {
        typeMap[p.type] = (typeMap[p.type] || 0) + p.totalRevenue;
        locMap[p.location] = (locMap[p.location] || 0) + p.totalRevenue;
    });

    const typeDistribution = Object.entries(typeMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Fallback: If all revenue is 0, use booking count for type distribution visibility
    const finalTypeDist = typeDistribution.some(t => t.value > 0) 
        ? typeDistribution 
        : Object.entries(typeMap).map(([name]) => ({ 
            name, 
            value: performanceList.filter(p => p.type === name).reduce((sum, p) => sum + p.bookings, 0) || 1
          })).filter(t => t.value > 0);

    const locationDistribution = Object.entries(locMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    // Fallback: If all revenue is 0, use booking count for regional distribution visibility
    const finalLocDist = locationDistribution.some(l => l.revenue > 0)
        ? locationDistribution
        : Object.entries(locMap).map(([name]) => ({
            name,
            revenue: performanceList.filter(p => p.location === name).reduce((sum, p) => sum + p.bookings, 0) || 1
          })).sort((a, b) => b.revenue - a.revenue);

    const activeProperties = performanceList.filter(p => p.totalRevenue > 0);
    const totalRevenueAll = performanceList.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalBookingsAll = performanceList.reduce((sum, p) => sum + p.bookings, 0);

    return {
        bestPerforming: { 
            name: performanceList[0]?.name || 'N/A', 
            revenue: performanceList[0]?.totalRevenue || 0 
        },
        totalBookings: totalBookingsAll,
        avgRevPerProperty: activeProperties.length > 0 ? Math.round(totalRevenueAll / activeProperties.length) : 0,
        properties: performanceList,
        typeDistribution: finalTypeDist,
        locationDistribution: finalLocDist.slice(0, 10)
    };
};

export const usePropertyStats = () => {
    return useQuery({
        queryKey: ['propertyStats'],
        queryFn: fetchPropertyStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
