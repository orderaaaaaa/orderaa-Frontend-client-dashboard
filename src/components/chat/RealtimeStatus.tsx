'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { CarrierChatConnectionState } from '@/lib/realtime/carrierChatSocket';
import {
  CHAT_LAST_SYNC_PREFIX,
  CHAT_LIVE_LABEL,
  CHAT_OFFLINE_LABEL,
  CHAT_RECONNECTING_LABEL,
  CHAT_REFRESH_LABEL,
} from '@/app/dashboard/shipping-providers/components/followupNotesConstants';
import { getTimeAgo } from '@/utils/timeAgo';

interface RealtimeStatusProps {
  state: CarrierChatConnectionState;
  lastSyncedAt: string | null;
  onRefresh?: () => void;
}

const DOT_CLASS: Record<CarrierChatConnectionState, string> = {
  connected: 'bg-success',
  reconnecting: 'bg-warning',
  offline: 'bg-destructive',
};

const LABEL: Record<CarrierChatConnectionState, string> = {
  connected: CHAT_LIVE_LABEL,
  reconnecting: CHAT_RECONNECTING_LABEL,
  offline: CHAT_OFFLINE_LABEL,
};

const RELATIVE_TIME_REFRESH_MS = 15_000;

export function RealtimeStatus({ state, lastSyncedAt, onRefresh }: RealtimeStatusProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((tick) => tick + 1), RELATIVE_TIME_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const syncedAgo = lastSyncedAt ? getTimeAgo(lastSyncedAt) : '';

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', DOT_CLASS[state])} />
      <span role="status">{LABEL[state]}</span>
      {state === 'connected' && syncedAgo !== '' && (
        <span aria-hidden="true" className="text-muted-foreground">
          · {CHAT_LAST_SYNC_PREFIX} · {syncedAgo}
        </span>
      )}
      {state === 'offline' && onRefresh && (
        <>
          <span aria-hidden="true" className="text-muted-foreground">—</span>
          <button
            type="button"
            onClick={onRefresh}
            className="font-medium text-primary-text underline-offset-2 hover:underline"
          >
            {CHAT_REFRESH_LABEL}
          </button>
        </>
      )}
    </div>
  );
}
