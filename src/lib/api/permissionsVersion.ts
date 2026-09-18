import type { AxiosInstance } from 'axios';
import { useAuthStore, type User } from '@/store/authStore';

const REFRESH_COOLDOWN_MS = 2000;

let inFlight: Promise<void> | null = null;
let lastFinishedAt = 0;

export function refreshPermissions(client: AxiosInstance): Promise<void> {
  if (inFlight) return inFlight;
  if (Date.now() - lastFinishedAt < REFRESH_COOLDOWN_MS) return Promise.resolve();

  const run = client
    .get<User>('/auth/me')
    .then(({ data }) => {
      useAuthStore.getState().setUser(data);
    })
    .catch(() => {})
    .finally(() => {
      lastFinishedAt = Date.now();
      inFlight = null;
    });

  inFlight = run;
  return run;
}

export function syncPermissionsVersion(
  client: AxiosInstance,
  headerValue: string | undefined,
): void {
  if (headerValue === undefined) return;

  const value = parseInt(headerValue, 10);
  if (Number.isNaN(value)) return;

  const { token, user } = useAuthStore.getState();
  if (!token || !user) return;
  if (user.permissionsVersion === value) return;

  refreshPermissions(client);
}
