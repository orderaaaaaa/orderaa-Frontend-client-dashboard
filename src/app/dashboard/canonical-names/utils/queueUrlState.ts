import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const QUEUE_STATES = ['all', 'unlinked', 'partial', 'mixed', 'linked'] as const;

export type QueueStateParam = (typeof QUEUE_STATES)[number];

export const DEFAULT_QUEUE_STATE: QueueStateParam = 'unlinked';

export interface QueueUrlState {
  state: QueueStateParam;
  scope: number | null;
  search: string;
}

export function parseQueueUrlState(params: URLSearchParams): QueueUrlState {
  const rawState = params.get('state');
  const state = QUEUE_STATES.find((value) => value === rawState) ?? DEFAULT_QUEUE_STATE;
  const rawScope = params.get('scope');
  const scopeNumber = rawScope === null ? Number.NaN : Number(rawScope);
  const scope = Number.isInteger(scopeNumber) && scopeNumber > 0 ? scopeNumber : null;
  const search = params.get('search') ?? '';
  return { state, scope, search };
}

export function writeQueueUrlState(
  params: URLSearchParams,
  next: Partial<QueueUrlState>,
): URLSearchParams {
  const merged = new URLSearchParams(params.toString());
  if (next.state !== undefined) merged.set('state', next.state);
  if (next.scope !== undefined) {
    if (next.scope === null) merged.delete('scope');
    else merged.set('scope', String(next.scope));
  }
  if (next.search !== undefined) {
    if (next.search === '') merged.delete('search');
    else merged.set('search', next.search);
  }
  return merged;
}

export function useQueueUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = useMemo(() => parseQueueUrlState(new URLSearchParams(searchParams.toString())), [searchParams]);

  const update = useCallback(
    (next: Partial<QueueUrlState>) => {
      const query = writeQueueUrlState(new URLSearchParams(searchParams.toString()), next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { ...current, update };
}
