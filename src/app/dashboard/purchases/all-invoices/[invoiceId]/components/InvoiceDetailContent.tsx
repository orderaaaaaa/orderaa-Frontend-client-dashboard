'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LiaBoxOpenSolid,
  LiaCheckCircleSolid,
  LiaHourglassHalfSolid,
  LiaLockSolid,
  LiaMoneyBillWaveSolid,
  LiaPencilAltSolid,
  LiaTrashAltSolid,
  LiaUndoAltSolid,
  LiaWalletSolid,
} from 'react-icons/lia';
import { ActorChip } from '@/components/audit/ActorChip';
import { employeeActor } from '@/components/audit/actors';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { INVOICE_LIFECYCLE_BADGE } from '@/components/purchases/receivingStatus';
import { DeleteInvoiceModal } from '@/app/dashboard/purchases/all-invoices/components/DeleteInvoiceModal';
import { ReverseInvoiceModal } from '@/app/dashboard/purchases/all-invoices/components/ReverseInvoiceModal';
import { OpenInvoiceEditModal } from '@/app/dashboard/purchases/all-invoices/components/OpenInvoiceEditModal';
import { CloseInvoiceModal } from '@/components/purchases/CloseInvoiceModal';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { INVOICE_PAYMENT_STATUS_LABEL, invoiceTypeLabel, signedInvoiceAmount } from '@/app/dashboard/purchases/constants';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { supplierInvoiceErrorStatus, SUPPLIER_INVOICE_NOT_FOUND_MESSAGE } from '@/lib/api/supplierInvoiceErrors';
import {
  INVOICE_LIFECYCLE,
  type InvoiceProductApiItem,
  type InvoicePaymentStatus,
  type SupplierInvoiceApiItem,
  type SupplierInvoiceSettlement,
} from '@/lib/api/suppliers';
import { DataTable } from '@/components/ui/data-table';
import BaseModal from '@/components/ui/base-modal';
import { VariantCountsList } from '@/components/purchases/variantCounts';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useSupplierInvoiceByIdQuery } from '@/services/suppliers';
import { formatDateTime } from '@/utils/format';
import { formatCount, formatMoney } from '@/utils/formatMoney';
import { roundMoney } from '@/utils/money';
import { InvoiceHistoryTab } from './InvoiceHistoryTab';
import { InvoiceLinesTab } from './InvoiceLinesTab';

const PAYMENT_STATUS_TONE: Record<InvoicePaymentStatus, string> = {
  NOT_PAID: 'border-destructive/30 bg-destructive/10 text-destructive',
  PARTIALLY_PAID: 'border-warning/30 bg-warning/10 text-foreground',
  PAID: 'border-success/30 bg-success/10 text-success',
};

const INVOICES_LIST_HREF = '/dashboard/purchases/all-invoices';

const money = (value: number) => <span dir="ltr" className="tabular-nums">{formatMoney(String(value))}</span>;
const signedMoney = (invoice: { type: string; totalAmount: number }) => (
  <span dir="ltr" className="tabular-nums">{signedInvoiceAmount(invoice)}</span>
);

interface DetailFieldProps {
  label: string;
  children: ReactNode;
}

function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="min-w-0 text-base font-semibold text-foreground">{children}</div>
    </div>
  );
}

function InvoiceLinkField({ label, id, text }: { label: string; id: number; text: string }) {
  return (
    <DetailField label={label}>
      <Link
        href={`${INVOICES_LIST_HREF}/${id}`}
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        {text}
      </Link>
    </DetailField>
  );
}

function InvoiceSettlementsPanel({ invoice }: { invoice: SupplierInvoiceApiItem }) {
  const settlements = invoice.settlements ?? [];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="المدفوع المرتبط">
          {money(invoice.settledAmount ?? 0)}
        </DetailField>
        <DetailField label="المتبقي على الفاتورة">
          {money(invoice.outstandingAmount ?? 0)}
        </DetailField>
      </div>
      <DataTable<InvoiceSettlementRow>
        columns={[
          {
            key: 'code',
            header: 'رقم الدفعة',
            render: (_value, row) => (
              <Link href={`${INVOICES_LIST_HREF}/${row.id}`} className="text-primary underline-offset-4 hover:underline" dir="ltr">
                {row.code}
              </Link>
            ),
          },
          {
            key: 'paymentAmount',
            header: 'المبلغ',
            render: (value: unknown) => <span dir="ltr" className="tabular-nums">{formatMoney(String(value))}</span>,
          },
          {
            key: 'createdAt',
            header: 'التاريخ',
            render: (value: unknown) => <span dir="ltr" className="tabular-nums">{formatDateTime(String(value))}</span>,
          },
          {
            key: 'isReversal',
            header: 'النوع',
            render: (value: unknown) => (value ? 'عكس دفعة' : 'دفعة'),
          },
        ]}
        data={settlements as InvoiceSettlementRow[]}
        keyField="id"
        emptyMessage="لا توجد مدفوعات مرتبطة بهذه الفاتورة"
      />
    </div>
  );
}

type InvoiceSettlementRow = SupplierInvoiceSettlement & Record<string, unknown>;

function InvoiceDetailsPanel({ invoice }: { invoice: SupplierInvoiceApiItem }) {
  const creatorDepartment = invoice.createdByEmployee?.department;
  const approverDepartment = invoice.approvedByEmployee?.department;
  const closerDepartment = invoice.closedByEmployee?.department;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {invoice.reversedByInvoiceId !== null && (
        <InvoiceLinkField label="الحالة" id={invoice.reversedByInvoiceId} text="عُكست بواسطة" />
      )}
      {invoice.reversesInvoiceId !== null && (
        <InvoiceLinkField label="الحالة" id={invoice.reversesInvoiceId} text="عكس الدفعة الأصلية" />
      )}
      {invoice.settlesInvoiceId !== null && (
        <InvoiceLinkField label="مرتبطة بالفاتورة" id={invoice.settlesInvoiceId} text="الفاتورة المرتبطة" />
      )}
      {invoice.closedAt && (
        <DetailField label="أغلقها">
          <ActorChip actor={employeeActor(invoice.closedByEmployee)} />
          {closerDepartment && (
            <span className="block text-sm font-normal text-muted-foreground">
              {getDepartmentLabel(closerDepartment)}
            </span>
          )}
          <span dir="ltr" className="block text-sm font-normal tabular-nums text-muted-foreground">
            {formatDateTime(invoice.closedAt)}
          </span>
        </DetailField>
      )}
      <DetailField label="المورد">
        <span className="break-words">{invoice.supplier.name}</span>
        {invoice.supplier.nickname && (
          <span className="block text-sm font-normal text-muted-foreground">{invoice.supplier.nickname}</span>
        )}
      </DetailField>
      <DetailField label="نوع الفاتورة">{invoiceTypeLabel(invoice)}</DetailField>
      <DetailField label="رقم فاتورة المورد">
        {invoice.externalInvoiceNumber ? (
          <span dir="ltr" className="tabular-nums">{invoice.externalInvoiceNumber}</span>
        ) : (
          '—'
        )}
      </DetailField>
      <DetailField label="أنشأها">
        <ActorChip actor={employeeActor(invoice.createdByEmployee)} />
        {creatorDepartment && (
          <span className="block text-sm font-normal text-muted-foreground">
            {getDepartmentLabel(creatorDepartment)}
          </span>
        )}
      </DetailField>
      <DetailField label="اعتمدها">
        {invoice.isApproved ? (
          <>
            <ActorChip actor={employeeActor(invoice.approvedByEmployee)} />
            {approverDepartment && (
              <span className="block text-sm font-normal text-muted-foreground">
                {getDepartmentLabel(approverDepartment)}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm font-normal text-muted-foreground">لم تُعتمد بعد</span>
        )}
      </DetailField>
      <DetailField label="تاريخ الاعتماد">
        {invoice.approvedAt ? (
          <span dir="ltr" className="tabular-nums">{formatDateTime(invoice.approvedAt)}</span>
        ) : (
          '—'
        )}
      </DetailField>
      <DetailField label="تاريخ الإنشاء">
        <span dir="ltr" className="tabular-nums">{formatDateTime(invoice.createdAt)}</span>
      </DetailField>
      <DetailField label="آخر تعديل">
        <span dir="ltr" className="tabular-nums">{formatDateTime(invoice.updatedAt)}</span>
      </DetailField>
      <DetailField label="صور الفاتورة">
        {invoice.images.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {invoice.images.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                صورة {formatCount(index + 1)}
              </a>
            ))}
          </div>
        ) : (
          '—'
        )}
      </DetailField>
    </div>
  );
}

function InvoiceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-16 w-1/2 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

interface InvoiceVariantCountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceCode: string;
  products: InvoiceProductApiItem[];
  isApproved: boolean;
}

function InvoiceVariantCountsModal({
  isOpen,
  onClose,
  invoiceCode,
  products,
  isApproved,
}: InvoiceVariantCountsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`عدد الأصناف · ${invoiceCode}`} showFooter={false} maxWidth="md:max-w-2xl">
      <div className="flex flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد أصناف في هذه الفاتورة</p>
        ) : (
          products.map((line) => (
            <div key={line.id} className="flex flex-col gap-1 rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold break-words">{line.product.name}</span>
                <span className="text-xs text-muted-foreground">
                  الكمية المفوترة <span dir="ltr" className="tabular-nums">{formatCount(line.quantity)}</span>
                </span>
              </div>
              <VariantCountsList line={line} isApproved={isApproved} />
            </div>
          ))
        )}
      </div>
    </BaseModal>
  );
}

interface InvoiceDetailContentProps {
  invoiceId: number;
}

export function InvoiceDetailContent({ invoiceId }: InvoiceDetailContentProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isOpenEditOpen, setIsOpenEditOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isReverseOpen, setIsReverseOpen] = useState(false);
  const [isVariantCountsOpen, setIsVariantCountsOpen] = useState(false);
  const isValidId = Number.isInteger(invoiceId) && invoiceId > 0;

  const { data: invoice, isPending, error, refetch } = useSupplierInvoiceByIdQuery(
    isValidId ? invoiceId : undefined,
  );
  const canUpdate = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_UPDATE);
  const canDelete = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_DELETE);
  const canReadHistory = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_HISTORY_READ);
  const canClose = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_CLOSE);

  if (!isValidId) {
    return (
      <EmptyState
        title={SUPPLIER_INVOICE_NOT_FOUND_MESSAGE}
        action={
          <Button asChild variant="outline" className="rounded-full">
            <Link href={INVOICES_LIST_HREF}>العودة إلى الفواتير</Link>
          </Button>
        }
      />
    );
  }

  if (isPending) {
    return <InvoiceDetailSkeleton />;
  }

  if (!invoice) {
    if (supplierInvoiceErrorStatus(error) === 404) {
      return (
        <EmptyState
          title={SUPPLIER_INVOICE_NOT_FOUND_MESSAGE}
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href={INVOICES_LIST_HREF}>العودة إلى الفواتير</Link>
            </Button>
          }
        />
      );
    }
    return <ErrorState error={error} fallback="تعذّر تحميل الفاتورة" onRetry={() => void refetch()} />;
  }

  const isDraft = invoice.lifecycle === INVOICE_LIFECYCLE.DRAFT;
  const isOpen = invoice.lifecycle === INVOICE_LIFECYCLE.OPEN;
  const isPaid = invoice.type === 'PAID';
  const showEdit = canUpdate && isDraft && !isPaid;
  const showOpenEdit = canClose && isOpen && !isPaid;
  const showClose = canClose && isOpen && !isPaid;
  const showDelete = canDelete && isDraft && !isPaid;
  const showReverse =
    canDelete && isPaid && invoice.reversesInvoiceId === null && invoice.reversedByInvoiceId === null;
  const isReturn = invoice.type === 'RETURN';
  const paid = isReturn ? null : roundMoney((invoice.paymentAmount ?? 0) + (invoice.settledAmount ?? 0));
  const remaining =
    paid === null
      ? null
      : Math.max(roundMoney(invoice.outstandingAmount ?? invoice.totalAmount - paid), 0);

  const actions =
    showEdit || showOpenEdit || showClose || showReverse || showDelete ? (
      <>
        {showEdit && (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/dashboard/purchases/add-invoice?invoiceId=${invoice.id}`}>
              <LiaPencilAltSolid className="size-4" />
              تعديل الفاتورة
            </Link>
          </Button>
        )}
        {showOpenEdit && (
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsOpenEditOpen(true)}>
            <LiaPencilAltSolid className="size-4" />
            تعديل الأصناف والمبالغ
          </Button>
        )}
        {showClose && (
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsCloseOpen(true)}>
            <LiaLockSolid className="size-4" />
            إغلاق الفاتورة
          </Button>
        )}
        {showReverse && (
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsReverseOpen(true)}>
            <LiaUndoAltSolid className="size-4" />
            عكس الدفعة
          </Button>
        )}
        {showDelete && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <LiaTrashAltSolid className="size-4" />
            حذف الفاتورة
          </Button>
        )}
      </>
    ) : null;

  return (
    <div className="flex w-full max-w-full flex-col gap-6 overflow-x-hidden sm:px-8 py-3">
      <StockPageHeader
        title={invoice.code}
        subtitle={invoice.supplier.name}
        breadcrumbs={[
          { label: 'المشتريات' },
          { label: 'الفواتير', href: INVOICES_LIST_HREF },
          { label: invoice.code },
        ]}
        actions={actions}
      />

      <div className="flex flex-wrap items-center gap-2">
        {invoice.type !== 'PAID' && (
          <Badge variant="outline" className={INVOICE_LIFECYCLE_BADGE[invoice.lifecycle].className}>
            {INVOICE_LIFECYCLE_BADGE[invoice.lifecycle].label}
          </Badge>
        )}
        {invoice.reversesInvoiceId === null && (
          <Badge variant="outline" className={PAYMENT_STATUS_TONE[invoice.paymentStatus]}>
            {INVOICE_PAYMENT_STATUS_LABEL[invoice.paymentStatus]}
          </Badge>
        )}
        <Badge variant="outline" className="border-border text-foreground">
          {invoiceTypeLabel(invoice)}
        </Badge>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="ملخص الفاتورة">
        <KpiCard
          label="الإجمالي"
          value={invoice.reversesInvoiceId != null ? signedMoney(invoice) : money(invoice.totalAmount)}
          icon={<LiaMoneyBillWaveSolid className="size-5" aria-hidden="true" />}
          accent="primary"
        />
        <KpiCard
          label="المدفوع"
          value={
            paid === null
              ? '—'
              : invoice.reversesInvoiceId != null
                ? signedMoney({ type: 'PAID', totalAmount: paid })
                : money(paid)
          }
          icon={<LiaWalletSolid className="size-5" aria-hidden="true" />}
          accent="chart2"
        />
        <KpiCard
          label="المتبقي"
          value={remaining === null ? '—' : money(remaining)}
          icon={<LiaHourglassHalfSolid className="size-5" aria-hidden="true" />}
          accent="chart3"
        />
        <button
          type="button"
          className="block w-full rounded-xl text-start transition-opacity hover:opacity-90"
          onClick={() => setIsVariantCountsOpen(true)}
        >
          <KpiCard
            label="عدد الأصناف"
            value={<span dir="ltr" className="tabular-nums">{formatCount(invoice.products.length)}</span>}
            icon={<LiaBoxOpenSolid className="size-5" aria-hidden="true" />}
            accent="chart4"
          />
        </button>
      </section>

      <Tabs defaultValue="details">
        <TabsList className="justify-start">
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="lines">الأصناف</TabsTrigger>
          {invoice.type === 'PURCHASE' && <TabsTrigger value="settlements">المدفوعات المرتبطة</TabsTrigger>}
          {canReadHistory && <TabsTrigger value="history">السجل</TabsTrigger>}
        </TabsList>
        <TabsContent value="details">
          <InvoiceDetailsPanel invoice={invoice} />
        </TabsContent>
        <TabsContent value="lines">
          <InvoiceLinesTab products={invoice.products} isApproved={invoice.isApproved} />
        </TabsContent>
        {invoice.type === 'PURCHASE' && (
          <TabsContent value="settlements">
            <InvoiceSettlementsPanel invoice={invoice} />
          </TabsContent>
        )}
        {canReadHistory && (
          <TabsContent value="history">
            <InvoiceHistoryTab invoiceId={invoice.id} products={invoice.products} />
          </TabsContent>
        )}
      </Tabs>

      {isVariantCountsOpen && (
        <InvoiceVariantCountsModal
          isOpen={isVariantCountsOpen}
          onClose={() => setIsVariantCountsOpen(false)}
          invoiceCode={invoice.code}
          products={invoice.products}
          isApproved={invoice.isApproved}
        />
      )}

      {isOpenEditOpen && (
        <OpenInvoiceEditModal
          isOpen={isOpenEditOpen}
          onClose={() => setIsOpenEditOpen(false)}
          invoice={invoice}
        />
      )}

      {showClose && (
        <CloseInvoiceModal
          isOpen={isCloseOpen}
          onClose={() => setIsCloseOpen(false)}
          invoice={{ id: invoice.id, code: invoice.code }}
        />
      )}

      {showReverse && (
        <ReverseInvoiceModal
          isOpen={isReverseOpen}
          onClose={() => setIsReverseOpen(false)}
          invoice={{ id: invoice.id, code: invoice.code, paymentAmount: invoice.paymentAmount }}
        />
      )}

      {showDelete && (
        <DeleteInvoiceModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          invoice={{ id: invoice.id, code: invoice.code, paymentAmount: invoice.paymentAmount }}
          onDeleted={() => router.push(INVOICES_LIST_HREF)}
        />
      )}
    </div>
  );
}
