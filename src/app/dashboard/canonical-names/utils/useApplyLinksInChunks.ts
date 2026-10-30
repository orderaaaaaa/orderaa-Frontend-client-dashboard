import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
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
} from '@/types/canonicalNames';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  isRowNotFoundError,
  locationLinkErrorMessage,
  skippedAliasesMessage,
} from './linkFeedback';

export const useApplyLinksInChunks = (domain: CanonicalNameDomain) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useApplyLinks(domain);
  const [applying, setApplying] = useState(false);

  const applyLinks = async (
    payload: ApplyLinksRequest,
    onLinked?: () => void,
  ) => {
    setApplying(true);
    try {
      const run = await runChunks(payload.items, async (items) => {
        const response = await mutateAsync({ items });
        return response.data;
      });

      if (run.error === null || run.saved > 0) {
        await invalidateDomainQueries(queryClient, domain);
      }

      if (run.error !== null) {
        if (!isLocationDomain(domain)) {
          toast.error(getApiErrorMessage(run.error, 'تعذر تنفيذ الربط'));
          return;
        }
        if (isRowNotFoundError(run.error)) {
          await invalidateDomainQueries(queryClient, domain);
        }
        toast.error(locationLinkErrorMessage(run.error));
        return;
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
    } finally {
      setApplying(false);
    }
  };

  return { applyLinks, applying };
};
