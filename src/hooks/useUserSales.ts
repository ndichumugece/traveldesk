import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserSales {
    userId: string;
    userName: string;
    userEmail: string;
    totalSales: number;
    documentCount: number;
}

export const useUserSales = () => {
    const [salesData, setSalesData] = useState<UserSales[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSalesData = async () => {
        try {
            setLoading(true);

            // 1. Fetch all profiles in the same agency to ensure everyone is listed
            // (RLS handles agency filtering)
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .eq('status', 'active');

            if (profileError) throw profileError;

            // 2. Fetch all documents to calculate sales and volume
            // Include metadata to access internalPrice
            const { data: documents, error: docError } = await supabase
                .from('documents')
                .select('amount, type, status, created_by, currency, exchange_rate, created_at, metadata')
                .order('created_at', { ascending: false });

            if (docError) throw docError;

            // Prepare aggregation map initialized with all profiles
            const aggregation: Record<string, UserSales> = {};
            profiles?.forEach(profile => {
                aggregation[profile.id] = {
                    userId: profile.id,
                    userName: profile.full_name || 'Anonymous Agent',
                    userEmail: profile.email || '',
                    totalSales: 0,
                    documentCount: 0
                };
            });

            // Aggregate data only from documents
            documents?.forEach((doc: any) => {
                const userId = doc.created_by;
                if (!userId || !aggregation[userId]) return;

                // User Sales now strictly track Booking Vouchers and use internalPrice
                if (doc.type === 'Booking' || doc.type === 'Booking Voucher') {
                    // Include Pending, Partial, Paid, and Confirmed in the agent's performance view
                    const isValidSale = ['confirmed', 'paid', 'pending', 'partial'].includes(doc.status?.toLowerCase());
                    const internalPrice = Number(doc.metadata?.internalPrice || 0);

                    if (isValidSale) {
                        aggregation[userId].totalSales += internalPrice;
                    }
                    
                    // documentCount tracks total booking vouchers created
                    aggregation[userId].documentCount += 1;
                }
            });

            // Convert to array and sort by revenue (primary) then count (secondary)
            const sortedData = Object.values(aggregation).sort((a, b) => {
                if (b.totalSales !== a.totalSales) return b.totalSales - a.totalSales;
                return b.documentCount - a.documentCount;
            });
            
            setSalesData(sortedData);

        } catch (err: any) {
            console.error('Error fetching user sales data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    return { salesData, loading, error, refetch: fetchSalesData };
};
