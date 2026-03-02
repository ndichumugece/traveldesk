import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Exclusion {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    icon_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export const useExclusions = () => {
    const [exclusions, setExclusions] = useState<Exclusion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExclusions();
    }, []);

    const fetchExclusions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('exclusions')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setExclusions(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addExclusion = async (exclusion: Omit<Exclusion, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('exclusions')
                .insert([exclusion])
                .select()
                .single();

            if (error) throw error;
            setExclusions([...exclusions, data].sort((a, b) => a.name.localeCompare(b.name)));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateExclusion = async (id: string, updates: Partial<Exclusion>) => {
        try {
            const { data, error } = await supabase
                .from('exclusions')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setExclusions(exclusions.map(e => e.id === id ? data : e).sort((a, b) => a.name.localeCompare(b.name)));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteExclusion = async (id: string) => {
        try {
            const { error } = await supabase
                .from('exclusions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setExclusions(exclusions.filter(e => e.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return {
        exclusions,
        loading,
        error,
        refetch: fetchExclusions,
        addExclusion,
        updateExclusion,
        deleteExclusion
    };
};
