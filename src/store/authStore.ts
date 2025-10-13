import { create } from 'zustand';
import { setToken, removeToken, getToken } from '@/lib/api/auth';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | any;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getToken(),
  isAuthenticated: !!getToken(),

  login: async (email, password) => {
    const res = (await api.post('/auth/login', { email, password })) as any;
    const token = res.data.access_token;

    setToken(token);
    set({ token, isAuthenticated: true });
    await useAuthStore.getState().fetchProfile();
  },

  logout: () => {
    removeToken();
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const res = await api.get('/auth/profile');
      set({ user: res.data });
    } catch {
      removeToken();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
