import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Transport {
    id: string;
    name: string;
    vehicle_type: string;
    price_per_way: number;
    capacity: number;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

export const useTransports = () => {
    const [transports, setTransports] = useState<Transport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTransports();
    }, []);

    const fetchTransports = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransports(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTransport = async (transport: Omit<Transport, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('transports')
                .insert([transport])
                .select()
                .single();

            if (error) throw error;
            setTransports([data, ...transports]);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateTransport = async (id: string, updates: Partial<Transport>) => {
        try {
            const { data, error } = await supabase
                .from('transports')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setTransports(transports.map(t => t.id === id ? data : t));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteTransport = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transports')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTransports(transports.filter(t => t.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return {
        transports,
        loading,
        error,
        refetch: fetchTransports,
        addTransport,
        updateTransport,
        deleteTransport
    };
};
