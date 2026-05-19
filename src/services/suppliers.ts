import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  getSuppliers,
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
  GetSuppliersParams,
  GetSupplierInvoicesParams,
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateSupplierInvoiceDto,
  UpdateSupplierInvoiceDto,
  ApproveSupplierInvoiceDto,
} from '@/lib/api/suppliers';

export const useSuppliersQuery = (params?: GetSuppliersParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPLIERS, params] as QueryKey,
    queryFn: () => getSuppliers(params),
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

export const useCreateSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSupplierInvoiceDto) => createSupplierInvoice(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_INVOICES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_DETAIL] });
    },
  });
};

export const useUpdateSupplierInvoiceMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSupplierInvoiceDto) => updateSupplierInvoice(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_INVOICES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, id] });
    },
  });
};

export const useDeleteSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSupplierInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_INVOICES] });
    },
  });
};

export const useApproveSupplierInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ApproveSupplierInvoiceDto }) =>
      approveSupplierInvoice(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_INVOICES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, variables.id] });
    },
  });
};
