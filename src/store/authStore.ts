import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//* Comment ot change this if named username
interface User {
  id: number;
  phoneNumber?: string;
  sub: number;
  name: string;
  email?: string;
  role: string;
  merchantId?: number;
  employeeId?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
