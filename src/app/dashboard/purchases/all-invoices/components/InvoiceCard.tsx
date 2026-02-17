'use client';

import { memo, useMemo } from 'react';
import { IconType } from 'react-icons';
import {
  LiaFileInvoiceSolid,
  LiaUserTieSolid,
  LiaClockSolid,
  LiaMoneyBillWaveSolid,
  LiaBoxOpenSolid
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { getTimeAgo } from '@/utils/timeAgo';
import { Invoice } from '../types';
import { formatDate } from '../utils';

interface InvoiceCardProps {
  invoice: Invoice;
  select: boolean;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
  onTitleClick: () => void;
}

interface CardField {
  label: string;
  value: string;
  icon: IconType;
  subtitle?: string;
}

const InvoiceCard = memo(
  ({
    invoice,
    select,
    isSelected,
    onSelectionChange,
    onTitleClick,
  }: InvoiceCardProps) => {
    const fields: CardField[] = useMemo(
      () => [
        {
          label: 'عدد الاصناف',
          value: `عدد الاصناف: ${invoice.itemsCount}`,
          icon: LiaBoxOpenSolid,
        },
        {
          label: 'موظف مشتريات',
          value: invoice.employeeName,
          icon: LiaUserTieSolid,
        },
        {
          label: 'التاريخ و الوقت',
          value: getTimeAgo(invoice.createdAt),
          icon: LiaClockSolid,
          subtitle: formatDate(invoice.createdAt),
        },
        {
          label: 'المبلغ الاجمالي',
          value: invoice.totalAmount.toLocaleString(),
          icon: LiaMoneyBillWaveSolid,
        },
      ],
      [invoice]
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
              <span className="text-lg font-bold text-gray-800">
                فاتورة رقم  {invoice.invoiceNumber}
              </span>
            </Button>
            <span className="ps-11 text-sm">{invoice.companyName}</span>
          </div>

          {select && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelectionChange(e.target.checked)}
              className="w-5 h-5 border-2 border-primary rounded-[4px] cursor-pointer accent-primary mt-1"
            />
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 px-10">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col items-start sm:items-center gap-1.5">
              <span className="text-base text-gray-400">{field.label}</span>
              <div className="flex items-center gap-1.5">
                <field.icon className="w-4 h-4 text-primary" />
                <span className="text-base font-semibold text-gray-800">
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
