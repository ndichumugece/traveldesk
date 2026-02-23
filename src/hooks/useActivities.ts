import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Activity {
    id: string;
    name: string;
    description: string;
    location: string;
    price: number;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

export const useActivities = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setActivities(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addActivity = async (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .insert([activity])
                .select()
                .single();

            if (error) throw error;
            setActivities([data, ...activities]);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateActivity = async (id: string, updates: Partial<Activity>) => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setActivities(activities.map(a => a.id === id ? data : a));
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteActivity = async (id: string) => {
        try {
            const { error } = await supabase
                .from('activities')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setActivities(activities.filter(a => a.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return {
        activities,
        loading,
        error,
        refetch: fetchActivities,
        addActivity,
        updateActivity,
        deleteActivity
    };
};
