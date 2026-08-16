'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import { LiaSaveSolid } from 'react-icons/lia';
import PageLoading from '@/components/ui/page-loading';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useReceiptStore } from '@/store/receiptStore';
import { useShallow } from 'zustand/react/shallow';
import {
  useSupplierInvoiceByIdQuery,
  useApproveSupplierInvoiceMutation,
} from '@/services/suppliers';
import { useWarehouseOptions } from '@/services/warehouses';
import ReceiptHeader from './ReceiptHeader';
import AddVariantsStep, { InvoiceProductRow } from './AddVariantsStep';
import { SelectedVariant } from '../types';
import type { ApproveSupplierInvoiceVariantDto } from '@/lib/api/suppliers';

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

export function ReceiptDetailContent({ receiptId }: ReceiptDetailContentProps) {
  const router = useRouter();
  const numericId = Number(receiptId);
  const isValidId = Number.isFinite(numericId);

  const { data: apiReceipt, isLoading, isError } = useSupplierInvoiceByIdQuery(
    isValidId ? numericId : undefined,
  );

  const { productVariants } = useReceiptStore(
    useShallow((s) => s.getReceiptState(receiptId)),
  );

  const setProductVariants = useReceiptStore((s) => s.setProductVariants);
  const clearReceipt = useReceiptStore((s) => s.clearReceipt);

  const approveMutation = useApproveSupplierInvoiceMutation();

  const { options: warehouseOptions, defaultWarehouseId } =
    useWarehouseOptions();
  const [warehouseId, setWarehouseId] = useState('');
  const [pendingMismatches, setPendingMismatches] = useState<
    QuantityMismatch[] | null
  >(null);

  // Seed the receiving warehouse with the merchant default, once it loads.
  useEffect(() => {
    if (warehouseId) return;
    if (defaultWarehouseId == null) return;
    setWarehouseId(String(defaultWarehouseId));
  }, [defaultWarehouseId, warehouseId]);

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
      const rawIds = p.attributeOptionIds ?? (p.variant?.options ?? []).map((o) => (o as any).attributeOptionId ?? (o as any).attribute_option?.id);
      const ids = rawIds.filter((x): x is number => typeof x === 'number');
      const labels = (p.variant?.options ?? []).map((o) => (o as any).attribute_option?.name ?? (o as any).name).filter(Boolean) as string[];
      if (ids.length === 0) continue;
      seed[p.id] = [
        {
          attributeOptionIds: ids,
          attributeLabels: labels,
          quantity: '',
          variantId: p.variantId ?? undefined,
          variantName: p.variant?.name,
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
        .filter((m) => m.countedTotal > 0 && m.difference !== 0),
    [invoiceProducts, countedFor],
  );

  const approve = useCallback(
    async (acknowledgeQuantityChange: boolean) => {
      if (!apiReceipt) return;

      const productsPayload = invoiceProducts
        .map((p) => ({
          invoiceProductId: p.id,
          variants: (productVariants[p.id] ?? [])
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
            }),
        }))
        .filter((p) => p.variants.length > 0);

      if (productsPayload.length === 0) {
        toast.error('يرجى إدخال الكمية المستلمة لمنتج واحد على الأقل');
        return;
      }

      try {
        await approveMutation.mutateAsync({
          id: apiReceipt.id,
          body: {
            products: productsPayload,
            warehouseId: Number(warehouseId),
            // Sent only when the user has just confirmed. Never sticky.
            ...(acknowledgeQuantityChange
              ? { acknowledgeQuantityChange: true }
              : {}),
          },
        });
        toast.success('تم تأكيد الإيصال بنجاح');
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

        setPendingMismatches(null);
        toast.error(getApiErrorMessage(err, 'فشل تأكيد الإيصال، حاول مرة أخرى'));
      }
    },
    [
      apiReceipt,
      warehouseId,
      invoiceProducts,
      productVariants,
      approveMutation,
      clearReceipt,
      receiptId,
      router,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (!apiReceipt) return;

    if (!warehouseId) {
      toast.error('يرجى اختيار مخزن الاستلام');
      return;
    }

    if (mismatches.length > 0) {
      setPendingMismatches(mismatches);
      return;
    }

    await approve(false);
  }, [apiReceipt, warehouseId, mismatches, approve]);

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

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="sm:px-8 py-3 flex flex-col gap-6">
        <ReceiptHeader
          invoiceNumber={apiReceipt.code}
          companyName={apiReceipt.supplier.name}
        />

        <div className="flex flex-col gap-2 max-w-sm">
          <label className="text-sm font-medium text-gray-700">
            مخزن الاستلام <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={warehouseOptions}
            value={warehouseId}
            onValueChange={setWarehouseId}
            placeholder="اختر مخزن الاستلام"
            emptyMessage="لا توجد مخازن — أنشئ مخزنًا أولًا"
          />
          <p className="text-xs text-gray-500">
            سيتم إضافة الكميات المعتمدة إلى هذا المخزن
          </p>
        </div>

        <AddVariantsStep
          products={invoiceProducts}
          onNext={handleSubmit}
          nextLabel="تأكيد الإيصال"
          nextIcon={LiaSaveSolid}
          nextDisabled={approveMutation.isPending}
          productVariants={productVariants}
          onProductVariantsChange={handleProductVariantsChange}
        />
      </div>

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
            <Button
              variant="default"
              className="rounded-full font-semibold px-6"
              disabled={approveMutation.isPending}
              onClick={() => approve(true)}
            >
              تأكيد التعديل والحفظ
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
