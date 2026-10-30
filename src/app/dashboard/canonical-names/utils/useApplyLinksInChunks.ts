import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import type { ApplyResult } from '@/components/entity-manager/types';
import { runChunks } from '@/components/entity-manager/runChunks';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  invalidateDomainQueries,
  isLocationDomain,
  useApplyLinks,
} from '@/services/canonicalNames';
import type {
  ApplyLinksRequest,
  CanonicalName,
  CanonicalNameDomain,
  LinkItem,
} from '@/types/canonicalNames';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  isRowNotFoundError,
  locationLinkErrorMessage,
  skippedAliasesMessage,
} from './linkFeedback';

export interface LinkPartialState {
  saved: number;
  total: number;
  failed: number;
  reason: string;
  items: LinkItem[];
}

export const useApplyLinksInChunks = (domain: CanonicalNameDomain) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useApplyLinks(domain);
  const [applying, setApplying] = useState(false);
  const [partial, setPartial] = useState<LinkPartialState | null>(null);

  const applyLinks = async (
    payload: ApplyLinksRequest,
    onLinked?: () => void,
  ): Promise<ApplyResult> => {
    setApplying(true);
    setPartial(null);
    try {
      const run = await runChunks(payload.items, async (items) => {
        const response = await mutateAsync({ items });
        return response.data;
      });

      if (run.ok || run.saved > 0) {
        await invalidateDomainQueries(queryClient, domain);
      }

      if (!run.ok) {
        const location = isLocationDomain(domain);
        if (location && isRowNotFoundError(run.error)) {
          await invalidateDomainQueries(queryClient, domain);
        }
        const reason = location
          ? locationLinkErrorMessage(run.error)
          : getApiErrorMessage(run.error, 'تعذر تنفيذ الربط');
        if (run.saved > 0) {
          setPartial({
            saved: run.saved,
            total: run.total,
            failed: run.failed,
            reason,
            items: payload.items.slice(run.saved),
          });
        } else {
          toast.error(reason);
        }
        return {
          saved: run.saved,
          total: run.total,
          failed: run.failed,
          reason,
        };
      }

      const results = run.results.flat();
      const rowsLinked = results.reduce((sum, row) => sum + row.rowsLinked, 0);
      if (rowsLinked > 0) {
        toast.success(`تم ربط ${rowsLinked} عنصر`);
      } else {
        toast.success('تم تحديث الربط');
      }

      if (isLocationDomain(domain)) {
        const names = queryClient
          .getQueriesData<CanonicalName[]>({
            queryKey: [QUERY_KEYS.CANONICAL_NAMES, domain],
          })
          .flatMap(([, data]) => data ?? []);
        const skipped = skippedAliasesMessage(results, names);
        if (skipped) toast.info(skipped);
      }

      onLinked?.();
      return { saved: run.saved, total: run.total, failed: 0, reason: null };
    } finally {
      setApplying(false);
    }
  };

  const retryPartial = () => {
    if (!partial) return;
    void applyLinks({ items: partial.items });
  };

  return { applyLinks, applying, partial, retryPartial };
};
