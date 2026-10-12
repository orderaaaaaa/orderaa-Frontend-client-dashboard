'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { bootstrapSession, subscribeAuthBroadcast } from '@/lib/api/refresh';

export default function AuthBootstrap() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const started = useRef(false);

  useEffect(() => subscribeAuthBroadcast(), []);

  useEffect(() => {
    if (!hasHydrated || started.current) return;
    started.current = true;
    void bootstrapSession().finally(() => {
      useAuthStore.getState().setBootstrapSettled(true);
    });
  }, [hasHydrated]);

  return null;
}
