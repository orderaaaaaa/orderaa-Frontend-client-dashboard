import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { useI18n } from '@/i18n/I18nProvider';
import {
  adjustStockBatch,
  getProductStock,
  getStockTimelinePage,
} from '@/lib/api/productStock';
import type {
  AdjustStockBatchDto,
  StockTimelineQueryParams,
  WarehouseSummaryCard,
} from '@/lib/api/warehouses';
import {
  invalidateStockViews,
  useWarehouseSummaryQuery,
  type WarehouseOption,
} from '@/services/warehouses';

export const useProductStockQuery = (productId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_STOCK, productId] as QueryKey,
    queryFn: () => getProductStock(productId as number),
    enabled: productId !== null,
    placeholderData: (previous) => previous,
  });

export const useStockTimelineQuery = (
  params: StockTimelineQueryParams | null,
  options?: { enabled?: boolean }
) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.STOCK_TIMELINE, params] as QueryKey,
    queryFn: ({ pageParam }) =>
      getStockTimelinePage({ ...(params as StockTimelineQueryParams), cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor === null ? undefined : String(lastPage.nextCursor),
    enabled: params !== null && (options?.enabled ?? true),
  });

export const useAdjustStockBatchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdjustStockBatchDto) => adjustStockBatch(body),
    onSuccess: () => invalidateStockViews(queryClient),
  });
};

export const useStockWarehouseOptions = (options?: { enabled?: boolean }) => {
  const { t } = useI18n();
  const summaryQuery = useWarehouseSummaryQuery({ enabled: options?.enabled ?? true });
  const cards = useMemo<WarehouseSummaryCard[]>(() => summaryQuery.data ?? [], [summaryQuery.data]);

  const flattened = useMemo<{ card: WarehouseSummaryCard; isChild: boolean }[]>(() => {
    const rows: { card: WarehouseSummaryCard; isChild: boolean }[] = [];
    const ids = new Set(cards.map((card) => card.id));
    const seen = new Set<number>();
    const push = (card: WarehouseSummaryCard, isChild: boolean) => {
      if (seen.has(card.id)) return;
      seen.add(card.id);
      rows.push({ card, isChild });
    };
    cards
      .filter((card) => card.parentWarehouseId === null || !ids.has(card.parentWarehouseId))
      .forEach((root) => {
        push(root, false);
        cards
          .filter((card) => card.parentWarehouseId === root.id)
          .forEach((child) => push(child, true));
      });
    cards.forEach((card) => push(card, card.parentWarehouseId !== null));
    return rows;
  }, [cards]);

  const label = (card: WarehouseSummaryCard, isChild: boolean) =>
    isChild ? `— ${card.name}` : card.name;

  const optionsList = useMemo<WarehouseOption[]>(
    () =>
      flattened.map(({ card, isChild }) => ({
        key: String(card.id),
        value: label(card, isChild),
      })),
    [flattened]
  );

  const pickerOptions = useMemo<WarehouseOption[]>(
    () =>
      flattened.map(({ card, isChild }) => {
        const name = label(card, isChild);
        return card.isActive
          ? { key: String(card.id), value: name }
          : {
              key: String(card.id),
              value: `${name}${t('stockRules.warehouseInactiveSuffix')}`,
              disabled: true,
            };
      }),
    [flattened, t]
  );

  return {
    options: optionsList,
    pickerOptions,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
  };
};
