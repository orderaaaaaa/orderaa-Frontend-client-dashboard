'use client';

import { memo, useMemo } from 'react';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import {
  LiaFileInvoiceSolid,
  LiaUserTieSolid,
  LiaClockSolid,
  LiaMoneyBillWaveSolid,
  LiaBoxOpenSolid,
  LiaExchangeAltSolid,
  LiaUndoAltSolid,
  LiaCheckCircleSolid,
  LiaDollarSignSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getTimeAgo } from '@/utils/timeAgo';

const TRANSACTION_TYPE_CONFIG: Record<string, { text: string; iconColor: string; icon: IconType }> = {
  'استبدال': { text: 'text-orange-500', iconColor: 'text-orange-500', icon: LiaExchangeAltSolid },
  'مرتجع': { text: 'text-red-500', iconColor: 'text-red-500', icon: LiaUndoAltSolid },
  'مشتريات': { text: 'text-green-500', iconColor: 'text-green-500', icon: LiaDollarSignSolid },
};

export interface InvoiceCardData {
  id: number;
  invoiceNumber: string;
  companyName: string;
  itemsCount: number;
  employeeName: string;
  createdAt: string;
  totalAmount: number;
  transactionType: string;
  acceptanceStatus: string;
  imageUrl?: string;
}

interface CardField {
  label: string;
  value: string;
  icon: IconType;
  subtitle?: string;
  valueClassName?: string;
  iconClassName?: string;
}

interface InvoiceCardProps {
  invoice: InvoiceCardData;
  select: boolean;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  onTitleClick: () => void;
  formatDate: (dateStr: string) => string;
}

const InvoiceCard = memo(
  ({
    invoice,
    select,
    isSelected,
    onSelectionChange,
    onTitleClick,
    formatDate,
  }: InvoiceCardProps) => {
    const typeConfig = TRANSACTION_TYPE_CONFIG[invoice.transactionType];
    const typeColors = typeConfig ?? {
      text: 'text-gray-800',
      iconColor: 'text-primary',
      icon: LiaCheckCircleSolid,
    };

    const isNegativeAmount = invoice.transactionType === 'استبدال' || invoice.transactionType === 'مرتجع';

    const fields: CardField[] = useMemo(
      () => [
        {
          label: 'موظف مشتريات',
          value: invoice.employeeName,
          icon: LiaUserTieSolid,
        },
        {
          label: 'عدد القطع',
          value: `عدد القطع ${invoice.itemsCount}`,
          icon: LiaBoxOpenSolid,
        },
        {
          label: 'التاريخ والوقت',
          value: getTimeAgo(invoice.createdAt),
          icon: LiaClockSolid,
          subtitle: formatDate(invoice.createdAt),
        },
        {
          label: 'نوع الفاتورة',
          value: invoice.transactionType,
          icon: typeColors.icon,
          valueClassName: typeColors.text,
          iconClassName: typeColors.iconColor,
        },
      ],
      [invoice, typeColors, isNegativeAmount, formatDate]
    );

    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start gap-1">
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 h-auto hover:bg-transparent hover:text-primary hover:underline"
              onClick={onTitleClick}
            >
              <LiaFileInvoiceSolid className="text-primary shrink-0" style={{ width: 24, height: 24 }} />
              <span className="text-lg font-bold text-primary">
                فاتورة رقم  {invoice.invoiceNumber}
              </span>
            </Button>
            <span className="ps-11 text-sm">{invoice.companyName}</span>
          </div>

          {select && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange(checked === true)}
              className="mt-1"
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 px-10">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col items-start sm:items-center gap-1.5">
              <span className="text-base text-gray-400">{field.label}</span>
              <div className="flex items-center gap-1.5">
                <field.icon className={clsx('w-4 h-4', field.iconClassName ?? 'text-primary')} />
                <span className={clsx('text-base font-semibold', field.valueClassName ?? 'text-gray-800')}>
                  {field.value}
                </span>
              </div>
              {field.subtitle && (
                <span className="text-sm text-gray-400">{field.subtitle}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

InvoiceCard.displayName = 'InvoiceCard';

export default InvoiceCard;
