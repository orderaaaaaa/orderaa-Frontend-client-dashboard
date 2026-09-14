import {
  useMutation,
  useQuery,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  createVirtualWarehouse,
  deleteVirtualWarehouse,
  getVirtualWarehouseById,
  getVirtualWarehousePresets,
  getVirtualWarehouses,
  getVirtualWarehouseSummary,
  previewVirtualWarehouse,
  updateVirtualWarehouse,
} from '@/lib/api/virtualWarehouses';
import type {
  CreateVirtualWarehouseDto,
  GetVirtualWarehousesParams,
  PreviewVirtualWarehouseDto,
  UpdateVirtualWarehouseDto,
} from '@/lib/api/virtualWarehouses';

const STALE_TIME = 30 * 1000;

interface QueryToggle {
  enabled?: boolean;
}

export const useVirtualWarehousesQuery = (
  params?: GetVirtualWarehousesParams,
  options?: QueryToggle
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VIRTUAL_WAREHOUSES, params ?? {}] as QueryKey,
    queryFn: () => getVirtualWarehouses(params),
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });
};

export const useVirtualWarehouseQuery = (
  id: number | undefined,
  options?: QueryToggle
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VIRTUAL_WAREHOUSES, 'detail', id] as QueryKey,
    queryFn: () => getVirtualWarehouseById(id as number),
    enabled: typeof id === 'number' && (options?.enabled ?? true),
    staleTime: STALE_TIME,
  });
};

export const useVirtualWarehouseSummaryQuery = (options?: QueryToggle) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VIRTUAL_WAREHOUSE_SUMMARY] as QueryKey,
    queryFn: getVirtualWarehouseSummary,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });
};

export const useVirtualWarehousePresetsQuery = (options?: QueryToggle) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VIRTUAL_WAREHOUSES, 'presets'] as QueryKey,
    queryFn: getVirtualWarehousePresets,
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
  });
};

export const useVirtualWarehousePreviewQuery = (
  body: PreviewVirtualWarehouseDto | null
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VIRTUAL_WAREHOUSES, 'preview', body] as QueryKey,
    queryFn: () => previewVirtualWarehouse(body as PreviewVirtualWarehouseDto),
    enabled: body !== null,
    staleTime: 0,
    retry: false,
  });
};

const invalidateVirtualWarehouses = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VIRTUAL_WAREHOUSES] });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.VIRTUAL_WAREHOUSE_SUMMARY],
  });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_PRODUCTS] });
};

export const useCreateVirtualWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateVirtualWarehouseDto) =>
      createVirtualWarehouse(body),
    onSuccess: () => invalidateVirtualWarehouses(queryClient),
  });
};

export const useUpdateVirtualWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateVirtualWarehouseDto }) =>
      updateVirtualWarehouse(id, body),
    onSuccess: () => invalidateVirtualWarehouses(queryClient),
  });
};

export const useDeleteVirtualWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVirtualWarehouse(id),
    onSuccess: () => invalidateVirtualWarehouses(queryClient),
  });
};
