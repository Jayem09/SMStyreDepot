import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cartStore';

export interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    role?: 'user' | 'admin';
    created_at?: string;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
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
            logout: () => {
                // Clear the cart when logging out
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
        }),
        {
            name: 'auth-storage',
        }
    )
);
