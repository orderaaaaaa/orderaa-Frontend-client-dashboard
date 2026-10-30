'use client';

import { formatStockNumber } from '@/utils/format';
import type { ReactNode } from 'react';
import type { SupplierInvoiceEvent } from '@/lib/api/suppliers';
import { INVOICE_PAYMENT_STATUS_LABEL } from '@/app/dashboard/purchases/constants';
import { formatCount, formatMoney } from '@/utils/formatMoney';

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

interface UpdatedChanges {
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
}

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

function UpdatedBody({ changes }: { changes: UpdatedChanges | null }) {
  const rows: ReactNode[] = [];
  const header = changes?.header;
  const totals = changes?.totals;
  const lines = changes?.lines;

  if (header?.externalInvoiceNumber) {
    rows.push(
      <ChangeRow
        key="externalInvoiceNumber"
        label="رقم فاتورة المورد"
        before={header.externalInvoiceNumber.before ?? '—'}
        after={header.externalInvoiceNumber.after ?? '—'}
      />,
    );
  }
  if (header?.paymentAmount) {
    rows.push(
      <ChangeRow
        key="paymentAmount"
        label="المبلغ المدفوع"
        before={moneyOf(header.paymentAmount.before)}
        after={moneyOf(header.paymentAmount.after)}
      />,
    );
  }
  if (header?.images) {
    rows.push(
      <ChangeRow
        key="images"
        label="صور الفاتورة"
        before={ltr(formatCount(header.images.before.length))}
        after={ltr(formatCount(header.images.after.length))}
      />,
    );
  }
  if (totals?.totalAmount) {
    rows.push(
      <ChangeRow
        key="totalAmount"
        label="الإجمالي"
        before={moneyOf(totals.totalAmount.before)}
        after={moneyOf(totals.totalAmount.after)}
      />,
    );
  }
  if (totals?.paymentStatus) {
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

function ApprovedBody({ changes }: { changes: ApprovedChanges | null }) {
  const approval = changes?.approval;
  if (!approval) return <p>اعتماد الفاتورة</p>;
  return (
    <ChangeList>
      <li>
        عدد الأصناف المعتمدة {ltr(formatCount(approval.lineCount))}
      </li>
      <ChangeRow
        label="الإجمالي"
        before={moneyOf(approval.totalAmount.before)}
        after={moneyOf(approval.totalAmount.after)}
      />
      <ChangeRow
        label="حالة الدفع"
        before={paymentStatusOf(approval.paymentStatus.before)}
        after={paymentStatusOf(approval.paymentStatus.after)}
      />
    </ChangeList>
  );
}

export function InvoiceHistoryBody({ event }: { event: SupplierInvoiceEvent }) {
  if (event.action === 'CREATED') {
    return <SnapshotBody changes={event.changes as SnapshotChanges | null} verb="أُنشئت الفاتورة" />;
  }
  if (event.action === 'DELETED') {
    return <DeletedBody changes={event.changes as SnapshotChanges | null} />;
  }
  if (event.action === 'UPDATED') {
    return <UpdatedBody changes={event.changes as UpdatedChanges | null} />;
  }
  if (event.action === 'ATTRIBUTED') {
    return <AttributedBody changes={event.changes as AttributedChanges | null} />;
  }
  return <ApprovedBody changes={event.changes as ApprovedChanges | null} />;
}
