import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Inclusion {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    icon_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export const useInclusions = () => {
    const [inclusions, setInclusions] = useState<Inclusion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInclusions();
    }, []);

    const fetchInclusions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inclusions')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setInclusions(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addInclusion = async (inclusion: Omit<Inclusion, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('inclusions')
                .insert([inclusion])
                .select()
                .single();

            if (error) throw error;
            setInclusions([...inclusions, data].sort((a, b) => a.name.localeCompare(b.name)));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateInclusion = async (id: string, updates: Partial<Inclusion>) => {
        try {
            const { data, error } = await supabase
                .from('inclusions')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setInclusions(inclusions.map(i => i.id === id ? data : i).sort((a, b) => a.name.localeCompare(b.name)));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteInclusion = async (id: string) => {
        try {
            const { error } = await supabase
                .from('inclusions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setInclusions(inclusions.filter(i => i.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return {
        inclusions,
        loading,
        error,
        refetch: fetchInclusions,
        addInclusion,
        updateInclusion,
        deleteInclusion
    };
};
