import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AgencySettings {
    id: string;
    legal_name: string;
    support_email: string;
    phone: string;
    address: string;
    tax_id: string;
    primary_color: string;
    logo_url: string;
    default_footer_note: string;
    default_terms: string;
}

export function useSettings() {
    const [settings, setSettings] = useState<AgencySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error: supabaseError } = await supabase
                .from('agency_settings')
                .select('*')
                .limit(1)
                .single();

            if (supabaseError) {
                // If no row exists yet, don't treat it as a critical error, just return null.
                // The DB migration inserted one row, but just in case.
                if (supabaseError.code === 'PGRST116') {
                    setSettings(null);
                } else {
                    throw supabaseError;
                }
            } else {
                setSettings(data);
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (updates: Partial<AgencySettings>) => {
        try {
            if (!settings?.id) {
                // If no settings exist yet, insert
                const { data, error } = await supabase
                    .from('agency_settings')
                    .insert([updates])
                    .select()
                    .single();
                if (error) throw error;
                setSettings(data);
                return { data, error: null };
            } else {
                // Update existing
                const { data, error } = await supabase
                    .from('agency_settings')
                    .update({ ...updates, updated_at: new Date().toISOString() })
                    .eq('id', settings.id)
                    .select()
                    .single();
                if (error) throw error;
                setSettings(data);
                return { data, error: null };
            }
        } catch (err: any) {
            console.error('Error updating settings:', err);
            return { data: null, error: err.message };
        }
    };

    return { settings, loading, error, updateSettings, refetch: fetchSettings };
}
