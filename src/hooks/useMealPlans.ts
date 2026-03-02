import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MealPlan {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export function useMealPlans() {
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMealPlans = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('meal_plans')
                .select('*')
                .order('name');

            if (error) throw error;
            setMealPlans(data || []);
        } catch (err: any) {
            console.error('Error fetching meal plans:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMealPlans();

        // Subscription for real-time updates
        const subscription = supabase
            .channel('meal_plans_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_plans' }, () => {
                fetchMealPlans();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const addMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('meal_plans')
                .insert([mealPlan])
                .select()
                .single();
            if (error) throw error;
            setMealPlans(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    const updateMealPlan = async (id: string, updates: Partial<MealPlan>) => {
        try {
            const { data, error } = await supabase
                .from('meal_plans')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            setMealPlans(prev => prev.map(m => m.id === id ? data : m).sort((a, b) => a.name.localeCompare(b.name)));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    const deleteMealPlan = async (id: string) => {
        try {
            const { error } = await supabase
                .from('meal_plans')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setMealPlans(prev => prev.filter(m => m.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return {
        mealPlans,
        loading,
        error,
        addMealPlan,
        updateMealPlan,
        deleteMealPlan,
        refresh: fetchMealPlans
    };
}
