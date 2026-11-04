'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { LiaPlusSolid, LiaTimesSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import ProductSelectionModal, {
  type SelectableProduct,
} from '@/components/ui/product-selection-modal';
import { variantLabelFromDetail, variantOptionIdsOf } from '@/components/purchases/variantCounts';
import { supplierInvoiceErrorMessage } from '@/lib/api/supplierInvoiceErrors';
import type {
  ApproveSupplierInvoiceVariantDto,
  InvoiceProductApiItem,
  InvoiceProductVariantDetail,
  OpenInvoiceEditDto,
  OpenInvoiceProductDto,
  SupplierInvoiceApiItem,
} from '@/lib/api/suppliers';
import { useEditOpenSupplierInvoiceMutation } from '@/services/suppliers';

interface OriginalCounts {
  approved: number;
  rejected: number;
}

interface EntryDraft {
  key: string;
  attributeOptionIds: number[];
  label: string | null;
  approved: string;
  rejected: string;
  original: OriginalCounts | null;
}

interface LineDraft {
  key: string;
  invoiceProductId: number | null;
  productId: number;
  productName: string;
  price: string;
  originalPrice: number | null;
  billedQuantity: number | null;
  variant: InvoiceProductVariantDetail | null;
  entries: EntryDraft[];
}

interface PickedProduct {
  product: SelectableProduct;
  attributeOptionIds: number[];
  label: string | null;
}

interface OpenInvoiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SupplierInvoiceApiItem;
}

let draftSeq = 0;
const nextKey = (prefix: string) => {
  draftSeq += 1;
  return `${prefix}-${draftSeq}`;
};

const parseNumber = (text: string): number => {
  if (text.trim() === '') return NaN;
  return Number(text);
};

const isCount = (value: number) => Number.isInteger(value) && value >= 0;

const variantEntry = (
  attributeOptionIds: number[],
  approvedCount: number,
  rejectedCount: number,
): ApproveSupplierInvoiceVariantDto =>
  attributeOptionIds.length > 0
    ? { attributeOptionIds, approvedCount, rejectedCount }
    : { approvedCount, rejectedCount };

const sameIds = (a: number[], b: number[]) =>
  [...a].sort((x, y) => x - y).join('-') === [...b].sort((x, y) => x - y).join('-');

function initialLines(products: InvoiceProductApiItem[]): LineDraft[] {
  return products.map((line) => ({
    key: `existing-${line.id}`,
    invoiceProductId: line.id,
    productId: line.productId,
    productName: line.product.name,
    price: String(line.price),
    originalPrice: line.price,
    billedQuantity: line.quantity,
    variant: line.variant ?? null,
    entries: (line.variantCounts ?? []).map((count, index) => ({
      key: `existing-${line.id}-${index}`,
      attributeOptionIds: variantOptionIdsOf(count.variant),
      label: variantLabelFromDetail(count.variant),
      approved: String(count.approvedCount),
      rejected: String(count.rejectedCount),
      original: { approved: count.approvedCount, rejected: count.rejectedCount },
    })),
  }));
}

function addPicks(lines: LineDraft[], picks: PickedProduct[]): { lines: LineDraft[]; duplicates: number } {
  const next = lines.map((line) => ({ ...line, entries: [...line.entries] }));
  let duplicates = 0;
  for (const pick of picks) {
    let line = next.find((candidate) => candidate.productId === pick.product.id);
    if (!line) {
      line = {
        key: nextKey('new-line'),
        invoiceProductId: null,
        productId: pick.product.id,
        productName: pick.product.name,
        price: String(pick.product.price),
        originalPrice: null,
        billedQuantity: null,
        variant: null,
        entries: [],
      };
      next.push(line);
    }
    if (line.entries.some((entry) => sameIds(entry.attributeOptionIds, pick.attributeOptionIds))) {
      duplicates += 1;
      continue;
    }
    line.entries.push({
      key: nextKey('new-entry'),
      attributeOptionIds: pick.attributeOptionIds,
      label: pick.label,
      approved: '0',
      rejected: '0',
      original: null,
    });
  }
  return { lines: next, duplicates };
}

export function OpenInvoiceEditModal({ isOpen, onClose, invoice }: OpenInvoiceEditModalProps) {
  const editMutation = useEditOpenSupplierInvoiceMutation(invoice.id);
  const isPurchase = invoice.type === 'PURCHASE';

  const [externalNumber, setExternalNumber] = useState(invoice.externalInvoiceNumber ?? '');
  const [paymentText, setPaymentText] = useState(String(invoice.paymentAmount ?? 0));
  const [lines, setLines] = useState<LineDraft[]>(() => initialLines(invoice.products));
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const updateLine = (lineKey: string, patch: Partial<Pick<LineDraft, 'price'>>) => {
    setLines((prev) => prev.map((line) => (line.key === lineKey ? { ...line, ...patch } : line)));
  };

  const updateEntry = (lineKey: string, entryKey: string, field: 'approved' | 'rejected', value: string) => {
    setLines((prev) =>
      prev.map((line) =>
        line.key !== lineKey
          ? line
          : {
              ...line,
              entries: line.entries.map((entry) =>
                entry.key === entryKey ? { ...entry, [field]: value } : entry,
              ),
            },
      ),
    );
  };

  const removeNewEntry = (lineKey: string, entryKey: string) => {
    setLines((prev) =>
      prev
        .map((line) =>
          line.key !== lineKey
            ? line
            : { ...line, entries: line.entries.filter((entry) => entry.key !== entryKey) },
        )
        .filter((line) => line.invoiceProductId !== null || line.entries.length > 0),
    );
  };

  const handleProductsPicked = (picked: SelectableProduct[]) => {
    const picks = picked.map((product) => {
      const combo = product.selectedVariants ?? [];
      const ids = combo.map((variant) => variant.attributeOptionId ?? 0);
      return {
        product,
        valid: ids.every((id) => id > 0),
        attributeOptionIds: ids,
        label: combo.length > 0 ? combo.map((variant) => variant.option).join(' / ') : null,
      };
    });
    if (picks.some((pick) => !pick.valid)) {
      toast.error('تعذّر تحديد خيارات المتغير لبعض الأصناف المختارة، لم تتم إضافتها');
    }
    const result = addPicks(
      lines,
      picks
        .filter((pick) => pick.valid)
        .map((pick) => ({
          product: pick.product,
          attributeOptionIds: pick.attributeOptionIds,
          label: pick.label,
        })),
    );
    if (result.duplicates > 0) {
      toast.info('بعض المتغيرات موجودة بالفعل على الفاتورة');
    }
    setLines(result.lines);
  };

  const handleSave = async () => {
    const body: OpenInvoiceEditDto = {};
    let countsChanged = false;

    if (isPurchase) {
      const payment = parseNumber(paymentText);
      if (!Number.isFinite(payment) || payment < 0) {
        toast.error('أدخل مبلغ دفعة صحيحاً');
        return;
      }
      if (payment !== (invoice.paymentAmount ?? 0)) body.paymentAmount = payment;
    }
    if (externalNumber !== (invoice.externalInvoiceNumber ?? '')) {
      body.externalInvoiceNumber = externalNumber;
    }

    const products: OpenInvoiceProductDto[] = [];
    for (const line of lines) {
      const price = parseNumber(line.price);
      if (!Number.isFinite(price) || price < 0) {
        toast.error(`أدخل سعراً صحيحاً للصنف ${line.productName}`);
        return;
      }
      const parsed = line.entries.map((entry) => ({
        entry,
        approved: parseNumber(entry.approved),
        rejected: parseNumber(entry.rejected),
      }));
      if (parsed.some((item) => !isCount(item.approved) || !isCount(item.rejected))) {
        toast.error(`أعداد الأصناف للصنف ${line.productName} يجب أن تكون أعداداً صحيحة غير سالبة`);
        return;
      }

      const toVariant = (item: (typeof parsed)[number]) =>
        variantEntry(item.entry.attributeOptionIds, item.approved, item.rejected);
      const changedExisting = parsed.filter(
        (item) =>
          item.entry.original !== null &&
          (item.approved !== item.entry.original.approved || item.rejected !== item.entry.original.rejected),
      );
      const newEntries = parsed.filter((item) => item.entry.original === null);

      if (line.invoiceProductId === null) {
        if (newEntries.length === 0) continue;
        countsChanged = true;
        products.push({ productId: line.productId, price, variants: newEntries.map(toVariant) });
        continue;
      }

      const priceChanged = price !== line.originalPrice;
      if (!priceChanged && changedExisting.length === 0 && newEntries.length === 0) continue;
      if (changedExisting.length > 0 || newEntries.length > 0) countsChanged = true;

      let variants = [...changedExisting, ...newEntries].map(toVariant);
      if (variants.length === 0) {
        variants =
          parsed.length > 0
            ? [toVariant(parsed[0])]
            : [variantEntry(variantOptionIdsOf(line.variant), 0, 0)];
      }
      products.push({
        invoiceProductId: line.invoiceProductId,
        productId: line.productId,
        price,
        variants,
      });
    }
    if (products.length > 0) body.products = products;

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    try {
      await editMutation.mutateAsync(body);
      toast.success(
        countsChanged ? 'تم حفظ التعديل وتحديث رصيد المخزون حسب فرق الكميات' : 'تم حفظ التعديل',
      );
      onClose();
    } catch (err: unknown) {
      toast.error(supplierInvoiceErrorMessage(err, 'تعذّر حفظ التعديل'));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل الفاتورة المفتوحة"
      onConfirm={handleSave}
      confirmText="حفظ التعديل"
      isLoading={editMutation.isPending}
      maxWidth="md:max-w-2xl"
    >
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground">رقم فاتورة المورد</span>
          <Input value={externalNumber} onChange={(event) => setExternalNumber(event.target.value)} dir="ltr" />
        </label>
        {isPurchase && (
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">المبلغ المدفوع</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={paymentText}
              onChange={(event) => setPaymentText(event.target.value)}
              dir="ltr"
            />
          </label>
        )}

        {lines.map((line) => {
          const derivedQuantity = line.entries.reduce(
            (sum, entry) => sum + (parseNumber(entry.approved) || 0) + (parseNumber(entry.rejected) || 0),
            0,
          );
          return (
            <div key={line.key} className="flex flex-col gap-3 rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="font-semibold break-words">{line.productName}</span>
                  <span className="text-xs text-muted-foreground">
                    الكمية (مجموع المعتمد والمرفوض):{' '}
                    <span dir="ltr" className="tabular-nums">
                      {line.entries.length > 0 ? derivedQuantity : (line.billedQuantity ?? 0)}
                    </span>
                  </span>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">السعر</span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-32"
                    value={line.price}
                    onChange={(event) => updateLine(line.key, { price: event.target.value })}
                    dir="ltr"
                  />
                </label>
              </div>

              {line.entries.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا توجد أعداد أصناف لتعديلها</p>
              ) : (
                line.entries.map((entry) => (
                  <div key={entry.key} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                    <span className="text-sm">{entry.label ?? 'بدون متغير'}</span>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">مقبول</span>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={entry.approved}
                        onChange={(event) => updateEntry(line.key, entry.key, 'approved', event.target.value)}
                        dir="ltr"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">مرفوض</span>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={entry.rejected}
                        onChange={(event) => updateEntry(line.key, entry.key, 'rejected', event.target.value)}
                        dir="ltr"
                      />
                    </label>
                    {entry.original === null && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => removeNewEntry(line.key, entry.key)}
                        aria-label="إزالة الصنف المضاف قبل الحفظ"
                      >
                        <LiaTimesSolid className="size-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          className="rounded-full self-start"
          onClick={() => setIsProductModalOpen(true)}
        >
          <LiaPlusSolid className="size-4" />
          إضافة صنف أو متغير
        </Button>
      </div>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onConfirm={(picked) => {
          setIsProductModalOpen(false);
          handleProductsPicked(picked);
        }}
        allowVariants
      />
    </BaseModal>
  );
}
