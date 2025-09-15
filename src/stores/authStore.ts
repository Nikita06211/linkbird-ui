import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false, // Start with false since we'll check persisted data first
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
      // Initialize from persisted data
      initialize: () => {
        const state = get();
        if (state.user && state.isAuthenticated) {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If we have persisted user data, we're not loading
          state.isLoading = false;
        }
      },
    }
  )
);
