import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastActive: string;
}

export function useUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error: supabaseError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (supabaseError) throw supabaseError;

            if (data) {
                const formattedUsers = data.map(profile => ({
                    id: profile.id,
                    name: profile.full_name || 'Unknown User',
                    email: profile.email || '',
                    role: profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Staff',
                    status: profile.status || 'pending',
                    lastActive: profile.updated_at ? formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true }) : 'Never'
                }));
                setUsers(formattedUsers);
            }
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const inviteUser = async (_email: string, _role: string) => {
        // In a real application, you would use a Supabase Edge Function or 
        // a secure backend route to call the Supabase Admin API to generate an invite link.
        // For security reasons, the standard client library cannot invite users directly 
        // without an active session or an admin key.
        // 
        // Example Edge Function pseudocode:
        // const result = await supabase.functions.invoke('invite-user', { body: { email, role } });

        throw new Error("Inviting users requires a Supabase Edge Function with Admin privileges.");
    };

    return { users, loading, error, refetch: fetchUsers, inviteUser };
}
