'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import SharedInvoiceCard, { InvoiceCardData } from '@/components/purchases/InvoiceCard';
import { Button } from '@/components/ui/button';
import { employeeActor } from '@/components/audit/actors';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { Invoice } from '../types';
import { formatDate } from '@/utils/format';
import { INVOICE_TYPE_LABEL } from '../../constants';
import { DeleteInvoiceModal } from './DeleteInvoiceModal';

interface InvoiceCardProps {
  invoice: Invoice;
  select: boolean;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  onTitleClick: () => void;
}

const InvoiceCard = memo(
  ({
    invoice,
    select,
    isSelected,
    onSelectionChange,
    onTitleClick,
  }: InvoiceCardProps) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const canRead = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_READ);
    const canUpdate = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_UPDATE);
    const canDelete = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_DELETE);
    const canEdit = canUpdate && !invoice.isApproved && invoice.type !== 'PAID';
    const canRemove = canDelete && !invoice.isApproved;

    const creatorDepartment = invoice.createdByEmployee?.department;

    const cardData: InvoiceCardData = {
      id: invoice.id,
      invoiceNumber: invoice.code,
      companyName: invoice.supplier.name,
      itemsCount: invoice.products.length,
      totalPieces: invoice.products.reduce((sum, p) => sum + (p.quantity || 0), 0),
      products: invoice.products.map((p) => ({
        name: p.product.name,
        quantity: p.quantity,
        price: p.price,
        packageCount: p.packageCount,
        piecesPerPackage: p.piecesPerPackage,
      })),
      creator: employeeActor(invoice.createdByEmployee),
      creatorSubtitle: creatorDepartment ? getDepartmentLabel(creatorDepartment) : undefined,
      createdAt: invoice.createdAt,
      totalAmount: invoice.totalAmount,
      invoiceType: invoice.type,
      paymentStatus: invoice.paymentStatus,
      transactionType: INVOICE_TYPE_LABEL[invoice.type] ?? invoice.type,
      isApproved: invoice.isApproved,
      imageUrl: invoice.images?.[0] ?? undefined,
    };

    const actions =
      canRead || canEdit || canRemove ? (
        <>
          {canRead && (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={`/dashboard/purchases/all-invoices/${invoice.id}`}>عرض التفاصيل</Link>
            </Button>
          )}
          {canEdit && (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={`/dashboard/purchases/add-invoice?invoiceId=${invoice.id}`}>تعديل</Link>
            </Button>
          )}
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-destructive hover:text-destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              حذف
            </Button>
          )}
        </>
      ) : undefined;

    return (
      <>
        <SharedInvoiceCard
          invoice={cardData}
          select={select}
          isSelected={isSelected}
          onSelectionChange={onSelectionChange}
          onTitleClick={onTitleClick}
          formatDate={formatDate}
          actions={actions}
        />
        {canRemove && (
          <DeleteInvoiceModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            invoice={{ id: invoice.id, code: invoice.code, paymentAmount: invoice.paymentAmount ?? null }}
          />
        )}
      </>
    );
  }
);

InvoiceCard.displayName = 'InvoiceCard';

export default InvoiceCard;
