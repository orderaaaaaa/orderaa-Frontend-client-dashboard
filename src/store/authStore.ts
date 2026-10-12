import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EmployeeRoleRef } from '@/lib/api/authorization';
import { isUnexpired } from '@/lib/api/accessToken';

/**
 * Mirrors the merchant branch of `GET /auth/me`
 * (`orderaa-backend/src/auth/auth.controller.ts` → `me()`): the spread `users`
 * row plus merchant/employee context, and — since ABAC — the caller's assigned
 * roles and the flat list of permission codes derived from them.
 */
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
  /** Roles assigned to the signed-in employee. */
  roles?: EmployeeRoleRef[];
  /**
   * Permission codes granted by those roles (e.g. `roles:read`,
   * `orders:setStatus:CONFIRMED`). Undefined only for sessions persisted
   * before ABAC shipped — see `hasPermissionCode` in `@/lib/permissions`.
   */
  permissions?: string[];
  permissionsVersion?: number;
}

export type { User };

interface AuthState {
  token: string | null;
  legacyAccessToken: string | null;
  user: User | null;
  hasHydrated: boolean;
  bootstrapSettled: boolean;
  isLoggingOut: boolean;
  setToken: (token: string) => void;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  dropLegacyToken: () => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  setBootstrapSettled: (state: boolean) => void;
  setIsLoggingOut: (state: boolean) => void;
}

interface PersistedAuthState {
  user: User | null;
  legacyAccessToken: string | null;
}

interface LegacyPersistedAuthState {
  token?: string | null;
  user?: User | null;
}

const AUTH_STORAGE_VERSION = 1;

function migrateAuthStorage(persisted: unknown, version: number): PersistedAuthState {
  const state = (persisted ?? {}) as LegacyPersistedAuthState & Partial<PersistedAuthState>;
  if (version >= AUTH_STORAGE_VERSION) {
    return { user: state.user ?? null, legacyAccessToken: state.legacyAccessToken ?? null };
  }
  const token = typeof state.token === 'string' ? state.token : null;
  return {
    user: state.user ?? null,
    legacyAccessToken: token !== null && isUnexpired(token) ? token : null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      legacyAccessToken: null,
      user: null,
      hasHydrated: false,
      bootstrapSettled: false,
      isLoggingOut: false,
      setToken: (token) => set({ token, isLoggingOut: false }),
      setSession: (token, user) =>
        set({ token, user, legacyAccessToken: null, isLoggingOut: false }),
      setUser: (user) => set({ user }),
      dropLegacyToken: () =>
        set((state) =>
          state.legacyAccessToken === null
            ? state
            : {
                legacyAccessToken: null,
                token: state.token === state.legacyAccessToken ? null : state.token,
              },
        ),
      logout: () =>
        set({ token: null, legacyAccessToken: null, user: null, isLoggingOut: true }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setBootstrapSettled: (state) => set({ bootstrapSettled: state }),
      setIsLoggingOut: (state) => set({ isLoggingOut: state }),
    }),
    {
      name: 'auth-storage',
      version: AUTH_STORAGE_VERSION,
      migrate: migrateAuthStorage,
      partialize: (state): PersistedAuthState => ({
        user: state.user,
        legacyAccessToken: state.legacyAccessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const legacy = state.legacyAccessToken;
          if (legacy !== null && isUnexpired(legacy)) {
            if (state.token === null) state.setToken(legacy);
          } else if (legacy !== null) {
            state.dropLegacyToken();
          }
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function isLegacyAccessToken(token: string | null): boolean {
  if (token === null) return false;
  return useAuthStore.getState().legacyAccessToken === token;
}
