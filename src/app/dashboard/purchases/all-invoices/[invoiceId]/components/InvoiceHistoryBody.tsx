'use client';

import { formatStockNumber } from '@/utils/format';
import type { ReactNode } from 'react';
import type { InvoiceProductApiItem, SupplierInvoiceEvent } from '@/lib/api/suppliers';
import { INVOICE_PAYMENT_STATUS_LABEL } from '@/app/dashboard/purchases/constants';
import { invoiceVariantCountLabel } from '@/components/purchases/variantCounts';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import { closedPayloadOf, reversedPayloadOf } from './historyPayloads';

interface HistoryLabels {
  productName: (invoiceProductId: number) => string;
  variantLabel: (variantId: number | null) => string | null;
}

function historyLabelsOf(products: InvoiceProductApiItem[]): HistoryLabels {
  return {
    productName: (invoiceProductId) =>
      products.find((line) => line.id === invoiceProductId)?.product.name ?? '—',
    variantLabel: (variantId) => {
      if (variantId === null) return null;
      for (const line of products) {
        if (line.variant?.id === variantId) return invoiceVariantCountLabel(line.variant);
        const match = line.variantCounts?.find((count) => count.variantId === variantId);
        if (match) return invoiceVariantCountLabel(match.variant);
      }
      return null;
    },
  };
}

interface Change<T> {
  before: T;
  after: T;
}

interface LineIdentity {
  productId: number;
  variantId: number | null;
  productName?: string | null;
  variantLabel?: string | null;
  sku?: string | null;
}

interface LineSnapshot extends LineIdentity {
  quantity: number;
  price: number;
  packageCount: number | null;
  piecesPerPackage: number | null;
}

type LineFields = Pick<LineSnapshot, 'quantity' | 'price' | 'packageCount' | 'piecesPerPackage'>;

interface SnapshotChanges {
  code?: string;
  header?: { externalInvoiceNumber?: string | null; paymentAmount?: number | null; images?: string[] };
  totals?: { totalAmount?: number; paymentStatus?: string };
  lines?: LineSnapshot[];
}

interface VariantCountChange {
  invoiceProductId: number;
  variantId: number;
  warehouseId: number | null;
  from: { approvedCount: number; rejectedCount: number };
  to: { approvedCount: number; rejectedCount: number };
}

interface ApprovedLine {
  invoiceProductId: number;
  invoiced: { variantId: number | null; quantity: number };
  counted: { variantId: number; approvedCount: number; rejectedCount: number }[];
}

interface UpdatedChanges {
  variantCounts?: VariantCountChange[];
  header?: {
    externalInvoiceNumber?: Change<string | null>;
    paymentAmount?: Change<number | null>;
    images?: Change<string[]>;
  };
  totals?: { totalAmount?: Change<number>; paymentStatus?: Change<string> };
  lines?: {
    added: LineSnapshot[];
    removed: LineSnapshot[];
    changed: (LineIdentity & { before: Partial<LineFields>; after: Partial<LineFields> })[];
  };
}

interface CreatorChange extends Change<number> {
  beforeName: string | null;
  afterName: string | null;
}

interface AttributedChanges {
  creator?: CreatorChange;
}

interface ApprovedChanges {
  approval?: {
    approvedByEmployeeId: number;
    lineCount: number;
    totalAmount: Change<number>;
    paymentStatus: Change<string>;
  };
  lines?: ApprovedLine[];
}


const countsText = (approved: number, rejected: number): ReactNode => (
  <>
    مقبول {ltr(formatStockNumber(approved))} · مرفوض {ltr(formatStockNumber(rejected))}
  </>
);

const LINE_FIELD_LABEL: Record<keyof LineFields, string> = {
  quantity: 'الكمية',
  price: 'السعر',
  packageCount: 'عدد الطرود',
  piecesPerPackage: 'القطع في الطرد',
};

const ltr = (content: ReactNode) => <span dir="ltr" className="tabular-nums">{content}</span>;

const moneyOf = (value: number | null | undefined) =>
  value == null ? '—' : ltr(formatMoney(String(value)));

const paymentStatusOf = (value: string | null | undefined) =>
  value == null ? '—' : INVOICE_PAYMENT_STATUS_LABEL[value as keyof typeof INVOICE_PAYMENT_STATUS_LABEL] ?? value;

const lineFieldValue = (field: keyof LineFields, value: number | null | undefined): ReactNode => {
  if (field === 'price') return value == null ? '—' : moneyOf(value);
  return ltr(formatStockNumber(value));
};

const differs = (before: unknown, after: unknown): boolean => JSON.stringify(before) !== JSON.stringify(after);

function ChangeRow({ label, before, after }: { label: string; before: ReactNode; after: ReactNode }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">من</span>
      <span className="tabular-nums">{before}</span>
      <span className="text-muted-foreground">إلى</span>
      <span className="font-semibold tabular-nums">{after}</span>
    </li>
  );
}

function ChangeList({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-2">{children}</ul>;
}

const lineTitle = (line: LineIdentity): string => {
  if (!line.productName) return `منتج #${line.productId}`;
  return line.variantLabel ? `${line.productName} · ${line.variantLabel}` : line.productName;
};

function lineSummary(line: LineSnapshot) {
  return (
    <>
      {lineTitle(line)} · الكمية {ltr(formatStockNumber(line.quantity))} · السعر{' '}
      {moneyOf(line.price)}
    </>
  );
}

function SnapshotBody({ changes, verb }: { changes: SnapshotChanges | null; verb: string }) {
  const lines = changes?.lines ?? [];
  return (
    <p>
      {verb} بإجمالي {moneyOf(changes?.totals?.totalAmount)} وعدد {ltr(formatCount(lines.length))} صنف
    </p>
  );
}

function DeletedBody({ changes }: { changes: SnapshotChanges | null }) {
  return (
    <p>
      حُذفت الفاتورة بإجمالي {moneyOf(changes?.totals?.totalAmount)}، والمبلغ المدفوع المسجل{' '}
      {moneyOf(changes?.header?.paymentAmount)}
    </p>
  );
}

function UpdatedBody({ changes, labels }: { changes: UpdatedChanges | null; labels: HistoryLabels }) {
  const rows: ReactNode[] = [];
  const header = changes?.header;
  const totals = changes?.totals;
  const lines = changes?.lines;

  changes?.variantCounts?.forEach((entry, index) => {
    if (entry.from.approvedCount === entry.to.approvedCount && entry.from.rejectedCount === entry.to.rejectedCount) return;
    rows.push(
      <ChangeRow
        key={`variant-${index}`}
        label={`الأصناف · ${labels.productName(entry.invoiceProductId)} · ${labels.variantLabel(entry.variantId) ?? '—'}`}
        before={countsText(entry.from.approvedCount, entry.from.rejectedCount)}
        after={countsText(entry.to.approvedCount, entry.to.rejectedCount)}
      />,
    );
  });

  if (header?.externalInvoiceNumber && differs(header.externalInvoiceNumber.before, header.externalInvoiceNumber.after)) {
    rows.push(
      <ChangeRow
        key="externalInvoiceNumber"
        label="رقم فاتورة المورد"
        before={header.externalInvoiceNumber.before ?? '—'}
        after={header.externalInvoiceNumber.after ?? '—'}
      />,
    );
  }
  if (header?.paymentAmount && differs(header.paymentAmount.before, header.paymentAmount.after)) {
    rows.push(
      <ChangeRow
        key="paymentAmount"
        label="المبلغ المدفوع"
        before={moneyOf(header.paymentAmount.before)}
        after={moneyOf(header.paymentAmount.after)}
      />,
    );
  }
  if (header?.images && differs(header.images.before, header.images.after)) {
    rows.push(
      <ChangeRow
        key="images"
        label="صور الفاتورة"
        before={ltr(formatCount(header.images.before.length))}
        after={ltr(formatCount(header.images.after.length))}
      />,
    );
  }
  if (totals?.totalAmount && differs(totals.totalAmount.before, totals.totalAmount.after)) {
    rows.push(
      <ChangeRow
        key="totalAmount"
        label="الإجمالي"
        before={moneyOf(totals.totalAmount.before)}
        after={moneyOf(totals.totalAmount.after)}
      />,
    );
  }
  if (totals?.paymentStatus && differs(totals.paymentStatus.before, totals.paymentStatus.after)) {
    rows.push(
      <ChangeRow
        key="paymentStatus"
        label="حالة الدفع"
        before={paymentStatusOf(totals.paymentStatus.before)}
        after={paymentStatusOf(totals.paymentStatus.after)}
      />,
    );
  }
  if (lines) {
    lines.added.forEach((line, index) =>
      rows.push(<li key={`added-${index}`}>أُضيف {lineSummary(line)}</li>),
    );
    lines.removed.forEach((line, index) =>
      rows.push(<li key={`removed-${index}`}>حُذف {lineSummary(line)}</li>),
    );
    lines.changed.forEach((line, index) =>
      Object.keys(line.after).forEach((field) => {
        const key = field as keyof LineFields;
        if (!differs(line.before[key], line.after[key])) return;
        rows.push(
          <ChangeRow
            key={`changed-${index}-${field}`}
            label={`${LINE_FIELD_LABEL[key]} · ${lineTitle(line)}`}
            before={lineFieldValue(key, line.before[key])}
            after={lineFieldValue(key, line.after[key])}
          />,
        );
      }),
    );
  }

  if (rows.length === 0) return <p>حفظ بدون تغيير ظاهر</p>;
  return <ChangeList>{rows}</ChangeList>;
}

function AttributedBody({ changes }: { changes: AttributedChanges | null }) {
  const creator = changes?.creator;
  if (!creator) return <p>تغيير المنشئ</p>;
  return (
    <ChangeList>
      <ChangeRow
        label="المنشئ"
        before={creator.beforeName || ltr(`#${creator.before}`)}
        after={creator.afterName || ltr(`#${creator.after}`)}
      />
    </ChangeList>
  );
}

function ApprovedBody({ changes, labels }: { changes: ApprovedChanges | null; labels: HistoryLabels }) {
  const approval = changes?.approval;
  if (!approval) return <p>اعتماد الفاتورة</p>;
  return (
    <ChangeList>
      <li>
        عدد الأصناف المعتمدة {ltr(formatCount(approval.lineCount))}
      </li>
      {differs(approval.totalAmount.before, approval.totalAmount.after) && (
        <ChangeRow
          label="الإجمالي"
          before={moneyOf(approval.totalAmount.before)}
          after={moneyOf(approval.totalAmount.after)}
        />
      )}
      {differs(approval.paymentStatus.before, approval.paymentStatus.after) && (
        <ChangeRow
          label="حالة الدفع"
          before={paymentStatusOf(approval.paymentStatus.before)}
          after={paymentStatusOf(approval.paymentStatus.after)}
        />
      )}
      {changes?.lines?.map((line) => {
        const invoicedVariant = labels.variantLabel(line.invoiced.variantId);
        return (
          <li key={`approved-line-${line.invoiceProductId}`}>
            {labels.productName(line.invoiceProductId)} · مفوتر{' '}
            {ltr(formatStockNumber(line.invoiced.quantity))}
            {invoicedVariant && ` (${invoicedVariant})`}
            {line.counted.length > 0 && (
              <ul className="mt-1 flex flex-col gap-1 ps-4 text-muted-foreground">
                {line.counted.map((count) => (
                  <li key={`counted-${line.invoiceProductId}-${count.variantId}`}>
                    {labels.variantLabel(count.variantId) ?? '—'}:{' '}
                    {countsText(count.approvedCount, count.rejectedCount)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ChangeList>
  );
}

function ClosedBody({ changes }: { changes: unknown }) {
  return <p>{closedPayloadOf(changes).auto ? 'أُغلقت الفاتورة تلقائياً' : 'أُغلقت الفاتورة'}</p>;
}

function ReversedBody({ changes }: { changes: unknown }) {
  const payload = reversedPayloadOf(changes);
  if (payload.reversalInvoiceId !== null) {
    return <p>عُكست الدفعة بدفعة عكسية {ltr(`#${payload.reversalInvoiceId}`)}</p>;
  }
  if (payload.reversesInvoiceId !== null) {
    return <p>دفعة عكسية للدفعة {ltr(`#${payload.reversesInvoiceId}`)}</p>;
  }
  return <p>عكس الدفعة</p>;
}

export function InvoiceHistoryBody({
  event,
  products,
}: {
  event: SupplierInvoiceEvent;
  products: InvoiceProductApiItem[];
}) {
  const labels = historyLabelsOf(products);
  if (event.action === 'CREATED') {
    return <SnapshotBody changes={event.changes as SnapshotChanges | null} verb="أُنشئت الفاتورة" />;
  }
  if (event.action === 'DELETED') {
    return <DeletedBody changes={event.changes as SnapshotChanges | null} />;
  }
  if (event.action === 'UPDATED') {
    return <UpdatedBody changes={event.changes as UpdatedChanges | null} labels={labels} />;
  }
  if (event.action === 'ATTRIBUTED') {
    return <AttributedBody changes={event.changes as AttributedChanges | null} />;
  }
  if (event.action === 'CLOSED') {
    return <ClosedBody changes={event.changes} />;
  }
  if (event.action === 'REVERSED') {
    return <ReversedBody changes={event.changes} />;
  }
  return <ApprovedBody changes={event.changes as ApprovedChanges | null} labels={labels} />;
}
