import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore';
import { supabase } from '../config/supabaseClient';
import { Provider } from '@supabase/supabase-js';

export interface User {
    id: number | string;
    email: string;
    name: string;
    phone?: string;
    role?: 'user' | 'admin';
    created_at?: string;
    avatar_url?: string;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    signInWithSocial: (provider: Provider) => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            login: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isAdmin: user.role === 'admin',
                });
            },
            logout: async () => {
                const { error } = await supabase.auth.signOut();
                if (error) console.error('Error signing out from Supabase:', error);
                
                useCartStore.getState().clearCart();

                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isAdmin: false,
                });
            },
            updateUser: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                }));
            },
            signInWithSocial: async (provider) => {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo: `${window.location.origin}/login`,
                    }
                });
                if (error) throw error;
            },
            checkSession: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const user = session.user;
                    set({
                        user: {
                            id: user.id,
                            email: user.email || '',
                            name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
                            avatar_url: user.user_metadata.avatar_url,
                            role: 'user', 
                        },
                        token: session.access_token,
                        isAuthenticated: true,
                        isAdmin: false, 
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
