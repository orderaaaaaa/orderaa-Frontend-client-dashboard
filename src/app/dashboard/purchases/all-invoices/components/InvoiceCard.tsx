'use client';

import { memo } from 'react';
import SharedInvoiceCard from '@/components/purchases/InvoiceCard';
import { Invoice } from '../types';
import { formatDate } from '../utils';

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
    return (
      <SharedInvoiceCard
        invoice={invoice}
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
