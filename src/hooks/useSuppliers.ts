import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Supplier {
    id: string;
    agency_id: string;
    name: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    description?: string;
    status: 'active' | 'inactive';
    created_at: string;
}

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data, error: supabaseError } = await supabase
                .from('suppliers')
                .select('*')
                .order('name', { ascending: true });

            if (supabaseError) throw supabaseError;
            setSuppliers(data || []);
        } catch (err: any) {
            console.error('Error fetching suppliers:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addSupplier = async (supplierData: Partial<Supplier>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get agency_id for the current user
            const { data: profile } = await supabase
                .from('profiles')
                .select('agency_id')
                .eq('id', user.id)
                .single();

            if (!profile?.agency_id) throw new Error('No agency associated with user');

            const { data, error } = await supabase
                .from('suppliers')
                .insert([{ ...supplierData, agency_id: profile.agency_id }])
                .select()
                .single();

            if (error) throw error;
            setSuppliers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .update(supplierData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setSuppliers(prev => prev.map(s => s.id === id ? data : s));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteSupplier = async (id: string) => {
        try {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSuppliers(prev => prev.filter(s => s.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return {
        suppliers,
        loading,
        error,
        refetch: fetchSuppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier
    };
}
