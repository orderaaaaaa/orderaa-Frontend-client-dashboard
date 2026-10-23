import { useQuery, type QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getCountSheet, type CountSheetParams } from '@/lib/api/stockCount';

export const useCountSheetQuery = (params: CountSheetParams | null) =>
  useQuery({
    queryKey: [QUERY_KEYS.STOCK_COUNT_SHEET, params] as QueryKey,
    queryFn: () => getCountSheet(params as CountSheetParams),
    enabled: params !== null,
    placeholderData: (previous) => previous,
  });
