'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LiaBoxOpenSolid,
  LiaHourglassHalfSolid,
  LiaMoneyBillWaveSolid,
  LiaPencilAltSolid,
  LiaTrashAltSolid,
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
import { receivedBadgeLabel } from '@/components/purchases/receivingStatus';
import { DeleteInvoiceModal } from '@/app/dashboard/purchases/all-invoices/components/DeleteInvoiceModal';
import { PaymentInvoiceEditModal } from '@/app/dashboard/purchases/all-invoices/components/PaymentInvoiceEditModal';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { INVOICE_PAYMENT_STATUS_LABEL, INVOICE_TYPE_LABEL } from '@/app/dashboard/purchases/constants';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { supplierInvoiceErrorStatus, SUPPLIER_INVOICE_NOT_FOUND_MESSAGE } from '@/lib/api/supplierInvoiceErrors';
import type { InvoicePaymentStatus, SupplierInvoiceApiItem } from '@/lib/api/suppliers';
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

function InvoiceDetailsPanel({ invoice }: { invoice: SupplierInvoiceApiItem }) {
  const creatorDepartment = invoice.createdByEmployee?.department;
  const approverDepartment = invoice.approvedByEmployee?.department;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <DetailField label="المورد">
        <span className="break-words">{invoice.supplier.name}</span>
        {invoice.supplier.nickname && (
          <span className="block text-sm font-normal text-muted-foreground">{invoice.supplier.nickname}</span>
        )}
      </DetailField>
      <DetailField label="نوع الفاتورة">{INVOICE_TYPE_LABEL[invoice.type] ?? invoice.type}</DetailField>
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

interface InvoiceDetailContentProps {
  invoiceId: number;
}

export function InvoiceDetailContent({ invoiceId }: InvoiceDetailContentProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPaymentEditOpen, setIsPaymentEditOpen] = useState(false);
  const isValidId = Number.isInteger(invoiceId) && invoiceId > 0;

  const { data: invoice, isPending, error, refetch } = useSupplierInvoiceByIdQuery(
    isValidId ? invoiceId : undefined,
  );
  const canUpdate = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_UPDATE);
  const canDelete = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_DELETE);
  const canReadHistory = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_HISTORY_READ);

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

  const showEdit = canUpdate && !invoice.isApproved && invoice.type !== 'PAID';
  const showPaymentEdit = canUpdate && !invoice.isApproved && invoice.type === 'PAID';
  const showDelete = canDelete && !invoice.isApproved;
  const isReturn = invoice.type === 'RETURN';
  const paid = isReturn ? null : roundMoney(invoice.paymentAmount ?? 0);
  const remaining = paid === null ? null : Math.max(roundMoney(invoice.totalAmount - paid), 0);

  const actions =
    showEdit || showPaymentEdit || showDelete ? (
      <>
        {showEdit && (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/dashboard/purchases/add-invoice?invoiceId=${invoice.id}`}>
              <LiaPencilAltSolid className="size-4" />
              تعديل الفاتورة
            </Link>
          </Button>
        )}
        {showPaymentEdit && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setIsPaymentEditOpen(true)}
          >
            <LiaPencilAltSolid className="size-4" />
            تعديل الدفعة
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
        <Badge
          variant="outline"
          className={
            invoice.isApproved
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-muted text-muted-foreground'
          }
        >
          {receivedBadgeLabel(invoice.isApproved)}
        </Badge>
        <Badge variant="outline" className={PAYMENT_STATUS_TONE[invoice.paymentStatus]}>
          {INVOICE_PAYMENT_STATUS_LABEL[invoice.paymentStatus]}
        </Badge>
        <Badge variant="outline" className="border-border text-foreground">
          {INVOICE_TYPE_LABEL[invoice.type] ?? invoice.type}
        </Badge>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="ملخص الفاتورة">
        <KpiCard
          label="الإجمالي"
          value={money(invoice.totalAmount)}
          icon={<LiaMoneyBillWaveSolid className="size-5" aria-hidden="true" />}
          accent="primary"
        />
        <KpiCard
          label="المدفوع"
          value={paid === null ? '—' : money(paid)}
          icon={<LiaWalletSolid className="size-5" aria-hidden="true" />}
          accent="chart2"
        />
        <KpiCard
          label="المتبقي"
          value={remaining === null ? '—' : money(remaining)}
          icon={<LiaHourglassHalfSolid className="size-5" aria-hidden="true" />}
          accent="chart3"
        />
        <KpiCard
          label="عدد الأصناف"
          value={<span dir="ltr" className="tabular-nums">{formatCount(invoice.products.length)}</span>}
          icon={<LiaBoxOpenSolid className="size-5" aria-hidden="true" />}
          accent="chart4"
        />
      </section>

      <Tabs defaultValue="details">
        <TabsList className="justify-start">
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="lines">الأصناف</TabsTrigger>
          {canReadHistory && <TabsTrigger value="history">السجل</TabsTrigger>}
        </TabsList>
        <TabsContent value="details">
          <InvoiceDetailsPanel invoice={invoice} />
        </TabsContent>
        <TabsContent value="lines">
          <InvoiceLinesTab products={invoice.products} />
        </TabsContent>
        {canReadHistory && (
          <TabsContent value="history">
            <InvoiceHistoryTab invoiceId={invoice.id} />
          </TabsContent>
        )}
      </Tabs>

      {isPaymentEditOpen && (
        <PaymentInvoiceEditModal
          isOpen={isPaymentEditOpen}
          onClose={() => setIsPaymentEditOpen(false)}
          invoice={invoice}
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
