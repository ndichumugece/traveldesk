import { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
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

    const fetchRole = async (userId: string) => {
        try {
            const rolePromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            // Short timeout for role fetch to avoid blocking UI features
            let timeoutId: ReturnType<typeof setTimeout>;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('fetchRole timeout')), 10000);
            });

            const { data, error } = await Promise.race([rolePromise, timeoutPromise]) as any;
            clearTimeout(timeoutId!);

            if (error) throw error;
            if (data?.role) {
                setRole(data.role);
            } else {
                setRole(prev => prev || 'staff');
            }
        } catch (error: any) {
            if (error?.message === 'fetchRole timeout') {
                console.warn('User role fetch timed out, falling back to staff.');
            } else {
                console.error('Error fetching user role:', error);
            }
            setRole(prev => prev || 'staff');
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
                fetchRole(currentUser.id);
            }
            
            // App is officially "loaded" once we know if there is a session or not
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const newUser = session?.user ?? null;
                const userIdChanged = newUser?.id !== lastUserId.current;

                setSession(session);
                setUser(newUser);

                if (event === 'SIGNED_OUT') {
                    lastUserId.current = null;
                    setRole(null);
                    setLoading(false);
                    return;
                }

                if (newUser && (userIdChanged || event === 'USER_UPDATED' || event === 'SIGNED_IN')) {
                    lastUserId.current = newUser.id;
                    // Background fetch, don't await so we don't block the UI
                    fetchRole(newUser.id);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
    }, []);

    const value = useMemo(() => ({
        session,
        user,
        role,
        isAdmin: role === 'admin',
        signOut,
        loading,
    }), [session, user, role, loading, signOut]);

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
