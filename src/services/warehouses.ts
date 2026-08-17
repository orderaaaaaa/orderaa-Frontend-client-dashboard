import { useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { WarehouseApiItem } from '@/lib/api/warehouses';
import type { OrderStatus } from '@/types/orders';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStock,
  getStockWorkflows,
  createStockWorkflow,
  updateStockWorkflow,
  deleteStockWorkflow,
  getStockMovements,
  adjustStock,
  transferStock,
  getOrderStockAvailability,
  getProductVariantAvailability,
  GetWarehousesParams,
  GetWarehouseStockParams,
  GetStockWorkflowsParams,
  GetStockMovementsParams,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateStockWorkflowDto,
  UpdateStockWorkflowDto,
  AdjustStockDto,
  TransferStockDto,
} from '@/lib/api/warehouses';

const STALE_TIME = 30 * 1000;

// ---------------------------------------------------------------------------
// Warehouses
// ---------------------------------------------------------------------------

export const useWarehousesQuery = (params?: GetWarehousesParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES, params] as QueryKey,
    queryFn: () => getWarehouses(params),
    placeholderData: (previous) => previous,
    staleTime: STALE_TIME,
  });
};

export const useWarehouseQuery = (id: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSE_DETAIL, id] as QueryKey,
    queryFn: () => getWarehouseById(id!),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
};

export const useWarehouseStockQuery = (
  id: number | undefined,
  params?: GetWarehouseStockParams
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSE_STOCK, id, params] as QueryKey,
    queryFn: () => getWarehouseStock(id!, params),
    enabled: !!id,
    placeholderData: (previous) => previous,
    staleTime: STALE_TIME,
  });
};

export const useCreateWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWarehouseDto) => createWarehouse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSES] });
    },
  });
};

export const useUpdateWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateWarehouseDto }) =>
      updateWarehouse(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSES] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WAREHOUSE_DETAIL, variables.id],
      });
    },
  });
};

export const useDeleteWarehouseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE_DETAIL] });
    },
  });
};

// ---------------------------------------------------------------------------
// Stock workflow rules
// ---------------------------------------------------------------------------

export const useStockWorkflowsQuery = (params?: GetStockWorkflowsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_WORKFLOWS, params] as QueryKey,
    queryFn: () => getStockWorkflows(params),
    staleTime: STALE_TIME,
  });
};

export const useCreateStockWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStockWorkflowDto) => createStockWorkflow(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_WORKFLOWS] });
    },
  });
};

export const useUpdateStockWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateStockWorkflowDto }) =>
      updateStockWorkflow(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_WORKFLOWS] });
    },
  });
};

export const useDeleteStockWorkflowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStockWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_WORKFLOWS] });
    },
  });
};

// ---------------------------------------------------------------------------
// Stock movements
// ---------------------------------------------------------------------------

export const useStockMovementsQuery = (params?: GetStockMovementsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_MOVEMENTS, params] as QueryKey,
    queryFn: () => getStockMovements(params),
    placeholderData: (previous) => previous,
    staleTime: STALE_TIME,
  });
};

/** Stock writes touch warehouse stock, the ledger and every product-stock view. */
const invalidateStockViews = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WAREHOUSE_STOCK] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_MOVEMENTS] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_PRODUCTS] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_ANALYSIS] });
};

export const useAdjustStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdjustStockDto) => adjustStock(body),
    onSuccess: () => invalidateStockViews(queryClient),
  });
};

export const useTransferStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TransferStockDto) => transferStock(body),
    onSuccess: () => invalidateStockViews(queryClient),
  });
};

// ---------------------------------------------------------------------------
// Shared warehouse picker options
// ---------------------------------------------------------------------------

export interface WarehouseOption {
  key: string;
  value: string;
}

/**
 * Flattens the merchant's warehouse tree into SearchableSelect options.
 *
 * `GET /warehouses` returns every warehouse as a top-level row AND nests
 * children under their parent, so a child is present twice in the payload —
 * dedupe by id while keeping children rendered under their parent.
 */
export const useWarehouseOptions = () => {
  // Pickers need the full tree; 1000 comfortably covers any real merchant.
  const { data, isLoading, isError } = useWarehousesQuery({ limit: 1000 });

  const warehouses = useMemo<WarehouseApiItem[]>(() => data?.data ?? [], [data]);

  const options = useMemo<WarehouseOption[]>(() => {
    const flattened: WarehouseOption[] = [];
    const seen = new Set<number>();

    const push = (warehouse: WarehouseApiItem, isChild: boolean) => {
      if (seen.has(warehouse.id)) return;
      seen.add(warehouse.id);
      flattened.push({
        key: String(warehouse.id),
        value: isChild ? `— ${warehouse.name}` : warehouse.name,
      });
    };

    warehouses
      .filter((warehouse) => warehouse.parentWarehouseId === null)
      .forEach((root) => {
        push(root, false);
        (root.children ?? []).forEach((child) => push(child, true));
      });

    // Children whose parent is outside the current page still need an option.
    warehouses.forEach((warehouse) =>
      push(warehouse, warehouse.parentWarehouseId !== null)
    );

    return flattened;
  }, [warehouses]);

  const rootOptions = useMemo<WarehouseOption[]>(
    () =>
      warehouses
        .filter((warehouse) => warehouse.parentWarehouseId === null)
        .map((warehouse) => ({
          key: String(warehouse.id),
          value: warehouse.name,
        })),
    [warehouses]
  );

  const defaultWarehouseId = useMemo<number | undefined>(
    () => warehouses.find((warehouse) => warehouse.isDefault)?.id,
    [warehouses]
  );

  return {
    warehouses,
    options,
    rootOptions,
    defaultWarehouseId,
    isLoading,
    isError,
  };
};

// ---------------------------------------------------------------------------
// T27 — stock availability
// ---------------------------------------------------------------------------

/**
 * Availability for every line of an order against a pending status change.
 *
 * `staleTime: 0` deliberately: stock moves constantly, and a cached figure is
 * exactly the thing this feature exists to avoid showing an agent.
 */
export const useOrderStockAvailabilityQuery = (
  orderId: number | undefined,
  targetStatus?: OrderStatus
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.ORDER_STOCK_AVAILABILITY,
      orderId,
      targetStatus ?? null,
    ] as QueryKey,
    queryFn: () => getOrderStockAvailability(orderId as number, targetStatus),
    enabled: typeof orderId === 'number',
    staleTime: 0,
  });
};

export const useProductVariantAvailabilityQuery = (
  productId: number | undefined,
  orderId: number | undefined,
  targetStatus?: OrderStatus
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.PRODUCT_VARIANT_AVAILABILITY,
      productId,
      orderId,
      targetStatus ?? null,
    ] as QueryKey,
    queryFn: () =>
      getProductVariantAvailability(
        productId as number,
        orderId as number,
        targetStatus
      ),
    enabled: typeof productId === 'number' && typeof orderId === 'number',
    staleTime: 0,
  });
};
