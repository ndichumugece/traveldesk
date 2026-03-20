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

            // Fetch documents with profile info
            const { data, error } = await supabase
                .from('documents')
                .select('amount, type, status, created_by, profiles(full_name, email)')
                .or('type.eq.Invoice,type.eq.Voucher')
                .or('status.eq.paid,status.eq.confirmed');

            if (error) throw error;

            if (!data) {
                setSalesData([]);
                return;
            }

            // Aggregate by user
            const aggregation: Record<string, UserSales> = {};

            data.forEach((doc: any) => {
                const userId = doc.created_by;
                if (!userId) return;

                const profile = Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles;
                const userName = profile?.full_name || 'Unknown User';
                const userEmail = profile?.email || '';

                if (!aggregation[userId]) {
                    aggregation[userId] = {
                        userId,
                        userName,
                        userEmail,
                        totalSales: 0,
                        documentCount: 0
                    };
                }

                aggregation[userId].totalSales += Number(doc.amount) || 0;
                aggregation[userId].documentCount += 1;
            });

            // Convert to array and sort
            const sortedData = Object.values(aggregation).sort((a, b) => b.totalSales - a.totalSales);
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
