import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: string | null;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    isAdmin: false,
    signOut: async () => { },
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const lastUserId = useRef<string | null>(null);

    const fetchRole = async (userId: string, forceLoading = false) => {
        if (forceLoading) setLoading(true);
        try {
            const rolePromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            // Increase timeout to 15 seconds to handle cold starts or slow networks
            let timeoutId: ReturnType<typeof setTimeout>;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('fetchRole timeout')), 15000);
            });

            const { data, error } = await Promise.race([rolePromise, timeoutPromise]) as any;
            clearTimeout(timeoutId!);

            if (error) throw error;
            if (data?.role) {
                setRole(data.role);
            } else {
                setRole(prev => prev || 'staff');
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setRole(prev => prev || 'staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setSession(session);
            setUser(currentUser);

            if (currentUser) {
                lastUserId.current = currentUser.id;
                fetchRole(currentUser.id, true);
            } else {
                setLoading(false);
            }
        }).catch(() => {
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const newUser = session?.user ?? null;

                // Compare with previous user to avoid loops or redundant fetches
                const userIdChanged = newUser?.id !== lastUserId.current;

                setSession(session);
                setUser(newUser);

                if (event === 'SIGNED_OUT') {
                    lastUserId.current = null;
                    setRole(null);
                    setLoading(false);
                    return;
                }

                if (newUser && (userIdChanged || event === 'USER_UPDATED')) {
                    lastUserId.current = newUser.id;
                    // Only show global loading if we don't have a role yet (initial sign in)
                    // Subsequent refreshes (tab focus) happen in the background
                    await fetchRole(newUser.id, userIdChanged);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []); // No dependencies to avoid subscription loops

    const value = {
        session,
        user,
        role,
        isAdmin: role === 'admin',
        signOut: async () => {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setRole(null);
        },
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
