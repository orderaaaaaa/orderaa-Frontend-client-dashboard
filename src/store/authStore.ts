import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  entityId?: number;
  entityType?: string;
  phoneNumber?: string;
  name: string;
  email?: string;
  role: string;
  merchantId?: number;
  employeeId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  otp?: string | null;
  otpExpiresAt?: string | null;
  accessLevel?: string;
  department?: string;
  governorate?: string | null;
  city?: string | null;
}

export type { User };

interface AuthState {
  token: string | null;
  user: User | null;
  hasHydrated: boolean;
  isLoggingOut: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  setIsLoggingOut: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      isLoggingOut: false,
      setToken: (token) => set({ token, isLoggingOut: false }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null, isLoggingOut: true }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setIsLoggingOut: (state) => set({ isLoggingOut: state }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
