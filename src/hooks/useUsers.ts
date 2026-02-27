import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    dateAdded: string;
    lastActive: string;
}

export function useUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Fetch actual profiles
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profileError) throw profileError;

            // Fetch pending invitations
            const { data: invitations, error: invitationError } = await supabase
                .from('user_invitations')
                .select('*')
                .eq('status', 'pending');

            if (invitationError) throw invitationError;

            const formattedUsers: UserProfile[] = [];

            // Add profiles
            if (profiles) {
                formattedUsers.push(...profiles.map(profile => ({
                    id: profile.id,
                    name: profile.full_name || 'Unknown User',
                    email: profile.email || '',
                    role: profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Staff',
                    status: profile.status || 'active',
                    dateAdded: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
                    lastActive: profile.updated_at ? formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true }) : 'Never'
                })));
            }

            // Add pending invitations (only if email doesn't have a profile yet)
            if (invitations) {
                const existingEmails = new Set(formattedUsers.map(u => u.email.toLowerCase()));
                invitations.forEach(inv => {
                    if (!existingEmails.has(inv.email.toLowerCase())) {
                        formattedUsers.push({
                            id: inv.id,
                            name: 'Pending Invite',
                            email: inv.email,
                            role: inv.role.charAt(0).toUpperCase() + inv.role.slice(1),
                            status: 'pending',
                            dateAdded: new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            lastActive: 'Never'
                        });
                    }
                });
            }

            setUsers(formattedUsers);
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

    const inviteUser = async (email: string, role: string) => {
        const { data: userData } = await supabase.auth.getUser();

        const { error: inviteError } = await supabase
            .from('user_invitations')
            .upsert({
                email,
                role,
                status: 'pending',
                invited_by: userData.user?.id
            }, { onConflict: 'email' });

        if (inviteError) throw inviteError;

        await fetchUsers();
    };

    const cancelInvite = async (id: string) => {
        const { error: cancelError } = await supabase
            .from('user_invitations')
            .delete()
            .eq('id', id);

        if (cancelError) throw cancelError;
        await fetchUsers();
    };

    const updateUserRole = async (id: string, newRole: string) => {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: newRole.toLowerCase() })
            .eq('id', id);

        if (updateError) throw updateError;
        await fetchUsers();
    };

    const deleteUserProfile = async (id: string) => {
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
        await fetchUsers();
    };

    return { users, loading, error, refetch: fetchUsers, inviteUser, cancelInvite, updateUserRole, deleteUserProfile };
}
