import { useInfiniteQuery, useQuery, useMutation, useQueryClient, QueryKey, type QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { STOCK_VIEW_KEYS } from '@/services/warehouses';
import {
  getSuppliers,
  getSuppliersSummary,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierProducts,
  getProductTransactions,
  getSupplierInvoices,
  getSupplierInvoiceById,
  createSupplierInvoice,
  updateSupplierInvoice,
  deleteSupplierInvoice,
  approveSupplierInvoice,
  closeSupplierInvoice,
  reverseSupplierInvoice,
  editOpenSupplierInvoice,
  getReturnStock,
  getSupplierInvoiceHistory,
  ReturnStockRequestBody,
  GetSuppliersParams,
  GetSupplierInvoicesParams,
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateSupplierInvoiceDto,
  UpdateSupplierInvoiceDto,
  ApproveSupplierInvoiceDto,
  OpenInvoiceEditDto,
} from '@/lib/api/suppliers';

export const useSuppliersQuery = (params?: GetSuppliersParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, params] as QueryKey,
    queryFn: () => getSuppliers(params),
    staleTime: 30 * 1000,
  });
};

export const useSuppliersSummaryQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, 'summary'] as QueryKey,
    queryFn: getSuppliersSummary,
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useSupplierByIdQuery = (id: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_DETAIL, id] as QueryKey,
    queryFn: () => getSupplierById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useSupplierProductsQuery = (supplierId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_PRODUCTS, supplierId] as QueryKey,
    queryFn: () => getSupplierProducts(supplierId!),
    enabled: !!supplierId,
    staleTime: 30 * 1000,
  });
};

export const useProductTransactionsQuery = (
  supplierId: number | undefined,
  productId: number | undefined
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_PRODUCT_TRANSACTIONS, supplierId, productId] as QueryKey,
    queryFn: () => getProductTransactions(supplierId!, productId!),
    enabled: !!supplierId && !!productId,
    staleTime: 30 * 1000,
  });
};

export const useSupplierInvoicesQuery = (params?: GetSupplierInvoicesParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_INVOICES, params] as QueryKey,
    queryFn: () => getSupplierInvoices(params),
    staleTime: 30 * 1000,
  });
};

export const useSupplierInvoiceByIdQuery = (id: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, id] as QueryKey,
    queryFn: () => getSupplierInvoiceById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

export const useReturnStockQuery = (body: ReturnStockRequestBody, enabled: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIER_RETURN_STOCK, body] as QueryKey,
    queryFn: () => getReturnStock(body),
    enabled,
    staleTime: 0,
  });
};

export const SUPPLIER_INVOICE_HISTORY_PAGE_SIZE = 50;

export const supplierInvoiceHistoryKey = (invoiceId: number) =>
  [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, invoiceId, 'history'] as const;

export const useSupplierInvoiceHistoryQuery = (invoiceId: number | undefined, enabled = true) => {
  return useInfiniteQuery({
    queryKey: supplierInvoiceHistoryKey(invoiceId!),
    queryFn: ({ pageParam }) =>
      getSupplierInvoiceHistory(invoiceId!, {
        cursor: pageParam,
        limit: SUPPLIER_INVOICE_HISTORY_PAGE_SIZE,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && !!invoiceId,
    staleTime: 0,
  });
};

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierDto) => createSupplier(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] });
    },
  });
};

export const useUpdateSupplierMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSupplierDto) => updateSupplier(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_DETAIL, id] });
    },
  });
};

export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] });
    },
  });
};

const SUPPLIER_FIGURE_KEYS: QueryKey[] = [
  [QUERY_KEYS.SUPPLIERS],
  [QUERY_KEYS.SUPPLIER_DETAIL],
  [QUERY_KEYS.SUPPLIER_PRODUCTS],
  [QUERY_KEYS.SUPPLIER_PRODUCT_TRANSACTIONS],
];

const invalidateSupplierFigures = (
  queryClient: QueryClient,
  extraKeys: QueryKey[] = [],
) => invalidateAndWait(queryClient, [...SUPPLIER_FIGURE_KEYS, ...extraKeys]);

export const useCreateSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierInvoiceDto) => createSupplierInvoice(body),
    onSuccess: () =>
      invalidateAndWait(queryClient, [
        [QUERY_KEYS.SUPPLIER_INVOICES],
        [QUERY_KEYS.SUPPLIERS],
        [QUERY_KEYS.SUPPLIER_DETAIL],
        [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL],
      ]),
  });
};

export const useUpdateSupplierInvoiceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSupplierInvoiceDto) => updateSupplierInvoice(id, body),
    onSuccess: () =>
      invalidateSupplierFigures(queryClient, [
        [QUERY_KEYS.SUPPLIER_INVOICES],
        [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, id],
      ]),
  });
};

export const useDeleteSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSupplierInvoice(id),
    onSuccess: (_data, id) =>
      invalidateSupplierFigures(queryClient, [
        [QUERY_KEYS.SUPPLIER_INVOICES],
        [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, id],
      ]),
  });
};

export const useApproveSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ApproveSupplierInvoiceDto }) =>
      approveSupplierInvoice(id, body),
    onSuccess: (_data, variables) =>
      invalidateSupplierFigures(queryClient, [
        [QUERY_KEYS.SUPPLIER_INVOICES],
        [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, variables.id],
        // Approval records INBOUND stock movements into the chosen warehouse.
        ...STOCK_VIEW_KEYS,
      ]),
  });
};

export const useCloseSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => closeSupplierInvoice(id),
    onSuccess: (_data, id) =>
      invalidateSupplierFigures(queryClient, [
        [QUERY_KEYS.SUPPLIER_INVOICES],
        [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, id],
      ]),
  });
};

export const useReverseSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reverseSupplierInvoice(id),
    onSuccess: () =>
      invalidateSupplierFigures(queryClient, [
        [QUERY_KEYS.SUPPLIER_INVOICES],
        [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL],
      ]),
  });
};

export const useEditOpenSupplierInvoiceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OpenInvoiceEditDto) => editOpenSupplierInvoice(id, body),
    onSuccess: () =>
      invalidateSupplierFigures(queryClient, [
        [QUERY_KEYS.SUPPLIER_INVOICES],
        [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, id],
        ...STOCK_VIEW_KEYS,
      ]),
  });
};
