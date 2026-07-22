'use client';

import { memo } from 'react';
import SharedInvoiceCard, { InvoiceCardData } from '@/components/purchases/InvoiceCard';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import { Invoice } from '../types';
import { formatDate } from '../utils';
import { INVOICE_TYPE_LABEL } from '../../constants';

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
      employeeName: invoice.createdByEmployee ? getDepartmentLabel(invoice.createdByEmployee.department) : 'غير محدد',
      createdAt: invoice.createdAt,
      totalAmount: invoice.totalAmount,
      paymentAmount: invoice.paymentAmount,
      transactionType: INVOICE_TYPE_LABEL[invoice.type] ?? invoice.type,
      acceptanceStatus: invoice.acceptanceStatus ?? '',
      imageUrl: invoice.images?.[0] ?? undefined,
    };

    return (
      <SharedInvoiceCard
        invoice={cardData}
        select={select}
        isSelected={isSelected}
        onSelectionChange={onSelectionChange}
        onTitleClick={onTitleClick}
        formatDate={formatDate}
      />
    );
  }
);

InvoiceCard.displayName = 'InvoiceCard';

export default InvoiceCard;
