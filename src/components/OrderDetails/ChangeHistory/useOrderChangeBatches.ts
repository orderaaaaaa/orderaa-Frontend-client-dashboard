import { useMemo } from 'react';
import { useOrderChangeHistory } from '@/services/orderChangeHistory';
import type { Order } from '@/types/orders';
import { getApiErrorStatus } from '@/utils/apiError';

const HIDDEN_ERROR_STATUSES = new Set([403, 404]);

export function useOrderChangeBatches(order: Order, enabled: boolean) {
  const lineProductNames = useMemo(
    () =>
      new Map(
        (order.order_products ?? []).flatMap((line) =>
          line.products?.name ? [[line.id, line.products.name] as const] : []
        )
      ),
    [order.order_products]
  );

  const query = useOrderChangeHistory(order.id, enabled);

  const errorStatus = query.isError ? getApiErrorStatus(query.error) : undefined;
  const isUnavailable = errorStatus !== undefined && HIDDEN_ERROR_STATUSES.has(errorStatus);

  const batches = useMemo(
    () =>
      query.data
        ? [
            ...new Map(
              query.data.pages.flatMap((page) => page.data).map((batch) => [batch.id, batch])
            ).values(),
          ]
        : [],
    [query.data]
  );

  return {
    query,
    batches: isUnavailable ? [] : batches,
    lineProductNames,
    isUnavailable,
    isFailed: query.isError && !isUnavailable,
    isLoading: enabled && !query.data && !query.isError,
  };
}
