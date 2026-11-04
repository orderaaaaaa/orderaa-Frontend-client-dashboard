'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ActorChip } from '@/components/audit/ActorChip';
import { employeeActor } from '@/components/audit/actors';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { getApiErrorMessage } from '@/utils/apiError';
import { reportReturnSubmitError, warnReturnBlocked } from '@/components/stock/returnStockToasts';
import { LiaSaveSolid, LiaCheckCircleSolid, LiaLockSolid } from 'react-icons/lia';
import PageLoading from '@/components/ui/page-loading';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import Input from '@/components/ui/Input';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { useReceiptStore } from '@/store/receiptStore';
import { useShallow } from 'zustand/react/shallow';
import {
  useSupplierInvoiceByIdQuery,
  useApproveSupplierInvoiceMutation,
  useReturnStockQuery,
} from '@/services/suppliers';
import {
  useStockWorkflowsQuery,
  useWarehouseOptions,
} from '@/services/warehouses';
import { useI18n } from '@/i18n/I18nProvider';
import ReceiptHeader from './ReceiptHeader';
import AddVariantsStep, { InvoiceProductRow } from './AddVariantsStep';
import { SelectedVariant } from '../types';
import { isEveryLineCounted } from '../../utils';
import { formatDate, formatStockNumber } from '@/utils/format';
import {
  INVOICE_LIFECYCLE,
  type ApproveSupplierInvoiceVariantDto,
  type ReturnStockLineRequest,
} from '@/lib/api/suppliers';
import { CloseInvoiceModal } from '@/components/purchases/CloseInvoiceModal';
import { variantLabelFromDetail, variantOptionIdsOf } from '@/components/purchases/variantCounts';
import {
  buildReturnStockCells,
  isReturnStockBlocking,
  ReturnStockLoadError,
  returnWarehouseNamesOf,
  type ReturnStockCell,
  type ReturnStockRequest,
} from '@/components/stock/ReturnSourceStock';
import { WAREHOUSES_PAGE_ENABLED } from '@/constants/warehouses';

type ReceivedLineRow = InvoiceProductRow & Record<string, unknown>;

interface ReceiptDetailContentProps {
  receiptId: string;
}

/** Mirrors the backend's INVOICE_QUANTITY_MISMATCH conflict payload. */
interface QuantityMismatch {
  invoiceProductId: number;
  productName: string | null;
  invoicedQuantity: number;
  countedTotal: number;
  difference: number;
}

const STALE_APPROVE_STATUSES = [400, 404, 409];

function positiveOptionIds(attributeOptionIds: number[]): number[] {
  return attributeOptionIds.filter((id) => id > 0);
}

function approvalLineKey(invoiceProductId: number, attributeOptionIds: number[]): string {
  const ids = positiveOptionIds(attributeOptionIds);
  if (ids.length === 0) return String(invoiceProductId);
  return `${invoiceProductId}:${[...ids].sort((a, b) => a - b).join('-')}`;
}

export function ReceiptDetailContent({ receiptId }: ReceiptDetailContentProps) {
  const { t } = useI18n();
  const router = useRouter();
  const numericId = Number(receiptId);
  const isValidId = Number.isFinite(numericId);

  const { data: apiReceipt, isLoading, isError } = useSupplierInvoiceByIdQuery(
    isValidId ? numericId : undefined,
  );

  const isPaidRow = apiReceipt?.type === 'PAID';

  useEffect(() => {
    if (isPaidRow) router.replace(`/dashboard/purchases/all-invoices/${receiptId}`);
  }, [isPaidRow, receiptId, router]);

  const { productVariants } = useReceiptStore(
    useShallow((s) => s.getReceiptState(receiptId)),
  );

  const setProductVariants = useReceiptStore((s) => s.setProductVariants);
  const clearReceipt = useReceiptStore((s) => s.clearReceipt);

  const approveMutation = useApproveSupplierInvoiceMutation();
  const queryClient = useQueryClient();
  const canApprove =
    useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_APPROVE) && apiReceipt?.type !== 'PAID';
  const canClose = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_CLOSE);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const isReturn = apiReceipt?.type === 'RETURN';

  const { pickerOptions: warehouseOptions } = useWarehouseOptions();
  /**
   * T30 — an OVERRIDE, not the destination.
   *
   * Empty is the normal case: the backend routes each line through the inbound
   * rules (variant scope, then product, then global), which is the only thing
   * that can route two lines of one receipt to two different warehouses. It
   * used to be seeded from the merchant's default-flagged warehouse — the flag
   * T30 replaces with those rules — and seeding a value here would silently force
   * every line into one warehouse, defeating the rules just configured.
   */
  const [warehouseId, setWarehouseId] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingMismatches, setPendingMismatches] = useState<
    QuantityMismatch[] | null
  >(null);

  /**
   * Whether a GLOBAL inbound destination exists at all.
   *
   * Unparameterised on purpose — the same query key the rules screen uses for
   * its global view, so this page reads from that cache instead of adding a
   * request of its own. The scoped rules come back in the same payload, hence
   * the explicit both-null filter: a product-scoped destination does not save
   * a receipt whose other lines have none.
   */
  const { data: stockWorkflows, isLoading: rulesLoading } =
    useStockWorkflowsQuery();

  const hasGlobalInboundRule = useMemo(
    () =>
      (stockWorkflows ?? []).some(
        (rule) =>
          rule.eventType === 'INBOUND' &&
          rule.productId === null &&
          rule.variantId === null
      ),
    [stockWorkflows]
  );

  const invoiceProducts: InvoiceProductRow[] = useMemo(
    () =>
      (apiReceipt?.products ?? []).map((p) => ({
        id: p.id,
        productId: p.productId,
        name: p.product.name,
        quantity: p.quantity,
      })),
    [apiReceipt],
  );

  const seededRef = useRef<string | null>(null);

  useEffect(() => {
    if (!apiReceipt) return;
    if (seededRef.current === receiptId) return;
    seededRef.current = receiptId;

    const seed: Record<number, SelectedVariant[]> = {};
    for (const p of apiReceipt.products) {
      const ids = p.attributeOptionIds ?? variantOptionIdsOf(p.variant);
      const labels = (p.variant?.options ?? []).map((o) => o.attribute_option.name);
      if (ids.length === 0) continue;
      seed[p.id] = [
        {
          attributeOptionIds: ids,
          attributeLabels: labels,
          quantity: '',
          variantId: p.variantId ?? undefined,
          variantName: variantLabelFromDetail(p.variant) ?? undefined,
        },
      ];
    }

    if (Object.keys(seed).length === 0) return;
    if (Object.keys(productVariants).length > 0) return;
    setProductVariants(receiptId, seed);
  }, [apiReceipt, receiptId, productVariants, setProductVariants]);

  const handleProductVariantsChange = useCallback(
    (variants: Record<number, SelectedVariant[]>) => {
      setProductVariants(receiptId, variants);
    },
    [receiptId, setProductVariants],
  );

  const countedFor = useCallback(
    (invoiceProductId: number) =>
      (productVariants[invoiceProductId] ?? []).reduce(
        (sum, v) => sum + (typeof v.quantity === 'number' ? v.quantity : 0),
        0,
      ),
    [productVariants],
  );

  const approvalStockLines = useMemo<ReturnStockLineRequest[]>(
    () =>
      invoiceProducts.flatMap((p) => {
        const real = (productVariants[p.id] ?? [])
          .map((v) => positiveOptionIds(v.attributeOptionIds))
          .filter((ids) => ids.length > 0);
        if (real.length === 0) return [{ key: approvalLineKey(p.id, []), productId: p.productId }];
        return real.map((ids) => ({
          key: approvalLineKey(p.id, ids),
          productId: p.productId,
          attributeOptionIds: ids,
        }));
      }),
    [invoiceProducts, productVariants],
  );

  const approvalRequested = useMemo(() => {
    const requested: Record<string, number> = {};
    for (const p of invoiceProducts) {
      const real = (productVariants[p.id] ?? []).filter(
        (v) => positiveOptionIds(v.attributeOptionIds).length > 0,
      );
      if (real.length === 0) {
        requested[approvalLineKey(p.id, [])] = countedFor(p.id);
      } else {
        for (const v of real) {
          requested[approvalLineKey(p.id, v.attributeOptionIds)] =
            typeof v.quantity === 'number' ? v.quantity : 0;
        }
      }
    }
    return requested;
  }, [invoiceProducts, productVariants, countedFor]);

  const approvalStockRequests = useMemo<ReturnStockRequest[]>(
    () =>
      approvalStockLines.map((line) => ({
        key: line.key,
        quantity: approvalRequested[line.key] ?? 0,
      })),
    [approvalStockLines, approvalRequested],
  );

  const returnStockQuery = useReturnStockQuery(
    { lines: approvalStockLines },
    isReturn && approvalStockLines.length > 0,
  );

  const approvalStockState = useMemo(
    () => buildReturnStockCells(approvalStockRequests, returnStockQuery.data?.lines),
    [approvalStockRequests, returnStockQuery.data],
  );
  const approvalStockCells = approvalStockState.cells;

  const approvalStockFor = useCallback(
    (row: InvoiceProductRow, variant: SelectedVariant | null) =>
      approvalStockCells[approvalLineKey(row.id, variant?.attributeOptionIds ?? [])],
    [approvalStockCells],
  );

  const returnStockBlocked = isReturn && isReturnStockBlocking(approvalStockState);
  const returnStockLoadFailed =
    isReturn &&
    (returnStockQuery.isError || (returnStockQuery.isSuccess && approvalStockState.incomplete));
  const returnWarehouseNames = returnWarehouseNamesOf(approvalStockCells);

  /** Products whose counted total differs from what the invoice says. */
  const mismatches: QuantityMismatch[] = useMemo(
    () =>
      invoiceProducts
        .map((p) => ({
          invoiceProductId: p.id,
          productName: p.name,
          invoicedQuantity: p.quantity,
          countedTotal: countedFor(p.id),
          difference: countedFor(p.id) - p.quantity,
        }))
        .filter((m) => m.difference !== 0),
    [invoiceProducts, countedFor],
  );

  const approve = useCallback(
    async (acknowledgeQuantityChange: boolean) => {
      if (!apiReceipt || apiReceipt.type === 'PAID') return;
      if (returnStockBlocked) {
        warnReturnBlocked();
        return;
      }
      if (!isEveryLineCounted(invoiceProducts.map((p) => p.id), productVariants)) return;

      const productsPayload = invoiceProducts.map((p) => {
        const variants = (productVariants[p.id] ?? [])
          .filter((v) => typeof v.quantity === 'number' && v.quantity > 0)
          .map((v) => {
            const variant: ApproveSupplierInvoiceVariantDto = {
              approvedCount: typeof v.quantity === 'number' ? v.quantity : 0,
              rejectedCount: 0,
            };
            if (v.attributeOptionIds.length > 0) {
              variant.attributeOptionIds = v.attributeOptionIds;
            }
            return variant;
          });
        return {
          invoiceProductId: p.id,
          variants: variants.length > 0 ? variants : [{ approvedCount: 0, rejectedCount: 0 }],
        };
      });

      try {
        await approveMutation.mutateAsync({
          id: apiReceipt.id,
          body: {
            products: productsPayload,
            // Omitted unless the user actually overrode it — sending a value
            // is what STOPS the backend from routing per line via the inbound
            // rules, so an empty pick must not become `Number('') === 0`.
            ...(warehouseId && !isReturn ? { warehouseId: Number(warehouseId) } : {}),
            // Sent only when the user has just confirmed. Never sticky.
            ...(acknowledgeQuantityChange
              ? { acknowledgeQuantityChange: true }
              : {}),
          },
        });
        toast.success(
          isReturn
            ? 'تم تأكيد تسليم المرتجع وخصم الكميات من المخزن'
            : 'تم تأكيد الإيصال بنجاح',
        );
        setPendingMismatches(null);
        clearReceipt(receiptId);
        router.push('/dashboard/inventory/receipts');
      } catch (err: unknown) {
        // The server enforces the same rule, so this is reachable even after
        // the local check — another tab may have changed the invoice. Branch
        // on the stable code, never on the translated message.
        const response = (
          err as {
            response?: {
              status?: number;
              data?: { code?: string; mismatches?: QuantityMismatch[] };
            };
          }
        )?.response;

        if (
          response?.status === 409 &&
          response.data?.code === 'INVOICE_QUANTITY_MISMATCH'
        ) {
          setPendingMismatches(response.data.mismatches ?? []);
          return;
        }

        if (isReturn && reportReturnSubmitError(err)) {
          setPendingMismatches(null);
          await invalidateAndWait(queryClient, [[QUERY_KEYS.SUPPLIER_RETURN_STOCK]]);
          return;
        }

        setPendingMismatches(null);
        toast.error(getApiErrorMessage(err, 'فشل تأكيد الإيصال، حاول مرة أخرى'));
        if (response?.status !== undefined && STALE_APPROVE_STATUSES.includes(response.status)) {
          toast.info('تم تحديث بيانات الفاتورة، راجع البنود وأعد التأكيد');
          await invalidateAndWait(queryClient, [
            [QUERY_KEYS.SUPPLIER_INVOICES],
            [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, numericId],
          ]);
        }
      }
    },
    [
      apiReceipt,
      isReturn,
      warehouseId,
      returnStockBlocked,
      invoiceProducts,
      productVariants,
      approveMutation,
      clearReceipt,
      receiptId,
      router,
      queryClient,
      numericId,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (!apiReceipt) return;
    if (!isEveryLineCounted(invoiceProducts.map((p) => p.id), productVariants)) return;
    if (returnStockBlocked) return;
    setIsConfirmOpen(true);
  }, [apiReceipt, invoiceProducts, productVariants, returnStockBlocked]);

  const totalApprovedPieces = useMemo(
    () => invoiceProducts.reduce((sum, p) => sum + countedFor(p.id), 0),
    [invoiceProducts, countedFor],
  );

  const selectedWarehouseLabel = useMemo(
    () => warehouseOptions.find((o) => o.key === warehouseId)?.value ?? null,
    [warehouseOptions, warehouseId],
  );

  const handleConfirmApprove = useCallback(async () => {
    setIsConfirmOpen(false);
    if (mismatches.length > 0) {
      setPendingMismatches(mismatches);
      return;
    }
    await approve(false);
  }, [mismatches, approve]);

  if (!isValidId) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <PageLoading message="جاري تحميل تفاصيل الاستلام..." />
      </div>
    );
  }

  if (isError || !apiReceipt) {
    notFound();
  }

  if (isPaidRow) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <PageLoading message="جاري تحميل تفاصيل الاستلام..." />
      </div>
    );
  }

  const isReceived = apiReceipt.isApproved;

  if (isReceived) {
    const receivedColumns: DataTableColumn<ReceivedLineRow>[] = [
      { key: 'name', header: 'المنتج' },
      { key: 'quantity', header: 'الكمية', render: (value) => formatStockNumber(value) },
    ];

    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="sm:px-8 py-3 flex flex-col gap-6">
          <ReceiptHeader
            invoiceNumber={apiReceipt.code}
            companyName={apiReceipt.supplier.name}
          />

          <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <LiaCheckCircleSolid className="text-primary" />
              <span className="font-semibold text-primary">
                {isReturn ? 'تم تسليم هذا المرتجع' : 'تم استلام هذه الفاتورة'}
              </span>
            </div>
            {apiReceipt.approvedAt !== null && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {isReturn ? 'تاريخ التسليم:' : 'تاريخ الاستلام:'} {formatDate(apiReceipt.approvedAt)}
                </span>
                <span>اعتمده</span>
                <ActorChip actor={employeeActor(apiReceipt.approvedByEmployee)} />
              </div>
            )}
          </div>

          {canClose && apiReceipt.lifecycle === INVOICE_LIFECYCLE.OPEN && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="rounded-full font-semibold px-6"
                onClick={() => setIsCloseOpen(true)}
              >
                <LiaLockSolid className="size-4" />
                إغلاق الفاتورة
              </Button>
            </div>
          )}

          <DataTable<ReceivedLineRow>
            columns={receivedColumns}
            data={invoiceProducts as ReceivedLineRow[]}
            emptyMessage="لا توجد منتجات"
          />
        </div>

        <CloseInvoiceModal
          isOpen={isCloseOpen}
          onClose={() => setIsCloseOpen(false)}
          invoice={{ id: apiReceipt.id, code: apiReceipt.code }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="sm:px-8 py-3 flex flex-col gap-6">
        <ReceiptHeader
          invoiceNumber={apiReceipt.code}
          companyName={apiReceipt.supplier.name}
        />

        <div className="flex flex-col gap-2 max-w-sm">
          <label className="text-sm font-medium text-gray-700">
            {isReturn ? 'مخزن صرف المرتجع' : 'مخزن الاستلام'}
          </label>
          {isReturn && <Input value={returnWarehouseNames || '—'} disabled />}
          {/* Clearable: leaving it empty is the normal path, so there has to
              be a way back to it after picking a warehouse by mistake. */}
          {!isReturn && (
            <SearchableSelect
              options={warehouseOptions}
              value={warehouseId}
              onValueChange={setWarehouseId}
              onClear={() => setWarehouseId('')}
              clearable
              placeholder={t('receipts.warehouseAuto')}
              emptyMessage="لا توجد مخازن — أنشئ مخزنًا أولًا"
            />
          )}
          {isReturn && (
            <p className="text-xs leading-5 text-gray-600">
              تأكيد هذا المرتجع يخصم الكميات المُسلّمة للمورد من المخزن.
            </p>
          )}
          {isReturn && (
            <p className="text-xs leading-5 text-gray-600">{t('returnStock.warehouseLockedHint')}</p>
          )}
          {/* Only while no override is chosen: with one, the missing global
              rule no longer stops this receipt from being confirmed. */}
          {!isReturn && !rulesLoading && !hasGlobalInboundRule && !warehouseId && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs leading-5 text-amber-900">
              {t('receipts.noInboundWarning')}
              {WAREHOUSES_PAGE_ENABLED && (
                <>
                  {' '}
                  <Link
                    href="/dashboard/inventory/warehouses?tab=workflows"
                    className="font-semibold underline"
                  >
                    {t('stockRules.inbound.title')}
                  </Link>
                </>
              )}
            </p>
          )}
        </div>

        {returnStockLoadFailed && (
          <ReturnStockLoadError onRetry={() => void returnStockQuery.refetch()} />
        )}

        <AddVariantsStep
          products={invoiceProducts}
          onNext={handleSubmit}
          nextLabel={isReturn ? 'تأكيد تسليم المرتجع' : 'تأكيد الإيصال'}
          nextIcon={LiaSaveSolid}
          nextDisabled={approveMutation.isPending || returnStockBlocked}
          showNext={canApprove}
          productVariants={productVariants}
          onProductVariantsChange={handleProductVariantsChange}
          returnStockFor={isReturn ? approvalStockFor : undefined}
        />
      </div>

      <BaseModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title={isReturn ? 'تأكيد تسليم المرتجع' : 'تأكيد الإيصال'}
        confirmText={isReturn ? 'تأكيد التسليم' : 'تأكيد الإيصال'}
        isLoading={approveMutation.isPending}
        confirmDisabled={returnStockBlocked}
        maxWidth="md:max-w-lg"
      >
        <div className="flex flex-col gap-2 text-sm text-gray-800">
          <p>
            إجمالي القطع: <b>{formatStockNumber(totalApprovedPieces)}</b>
          </p>
          <p>
            عدد المنتجات: <b>{invoiceProducts.length}</b>
          </p>
          <p>
            {isReturn
              ? `من ${returnWarehouseNames || '—'}`
              : selectedWarehouseLabel
                ? `إلى ${selectedWarehouseLabel}`
                : 'تُوزّع حسب قواعد المخزون'}
          </p>
          <p className="text-xs text-amber-700">
            {isReturn
              ? 'سيتم خصم الكميات من المخزن ولا يمكن التراجع بعد التأكيد'
              : 'لا يمكن التراجع بعد التأكيد'}
          </p>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={pendingMismatches !== null}
        onClose={() => setPendingMismatches(null)}
        title="الكميات المستلمة لا تطابق الفاتورة"
        showFooter={false}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            سيتم تعديل كمية الفاتورة لتطابق الكميات المستلمة، وسيُعاد احتساب
            إجمالي مبلغ الفاتورة بناءً عليها. هذا تغيير في قيمة الفاتورة.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">
                    المنتج
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">
                    المفوتر
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">
                    المُستلم
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">
                    الفرق
                  </th>
                </tr>
              </thead>
              <tbody>
                {(pendingMismatches ?? []).map((m) => (
                  <tr key={m.invoiceProductId} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-900 font-medium">
                      {m.productName ?? `#${m.invoiceProductId}`}
                    </td>
                    <td className="py-2 px-3">{m.invoicedQuantity}</td>
                    <td className="py-2 px-3">{m.countedTotal}</td>
                    <td className="py-2 px-3 font-semibold text-amber-600">
                      {m.difference > 0 ? `+${m.difference}` : m.difference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="rounded-full font-semibold px-6"
              onClick={() => setPendingMismatches(null)}
            >
              إلغاء
            </Button>
            {canApprove && (
              <Button
                variant="default"
                className="rounded-full font-semibold px-6"
                disabled={approveMutation.isPending || returnStockBlocked}
                onClick={() => approve(true)}
              >
                تأكيد التعديل والحفظ
              </Button>
            )}
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
