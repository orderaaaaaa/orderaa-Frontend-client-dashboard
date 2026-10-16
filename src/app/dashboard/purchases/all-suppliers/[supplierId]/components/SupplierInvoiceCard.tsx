'use client';

import { memo, useMemo, useState } from 'react';
import clsx from 'clsx';
import { IconType } from 'react-icons';
import { getDepartmentLabel } from '@/app/dashboard/employees/utils/employeeMappers';
import {
  LiaFileInvoiceSolid,
  LiaUserTieSolid,
  LiaClockSolid,
  LiaMoneyBillWaveSolid,
  LiaBoxOpenSolid,
  LiaDollarSignSolid,
  LiaUndoAltSolid,
  LiaHandHoldingUsdSolid,
} from 'react-icons/lia';
import { Checkbox } from '@/components/ui/checkbox';
import { getTimeAgo } from '@/utils/timeAgo';
import { formatMoney } from '@/utils/formatMoney';
import { SupplierInvoice } from '../types';
import { formatDate } from '@/utils/format';
import InvoiceDetailModal from './InvoiceDetailModal';
import { INVOICE_TYPE_LABEL } from '../../../constants';

const TRANSACTION_TYPE_CONFIG: Record<
  string,
  { text: string; iconColor: string; icon: IconType }
> = {
  PURCHASE: { text: 'text-green-500', iconColor: 'text-green-500', icon: LiaDollarSignSolid },
  RETURN: { text: 'text-red-500', iconColor: 'text-red-500', icon: LiaUndoAltSolid },
  PAID: { text: 'text-blue-500', iconColor: 'text-blue-500', icon: LiaHandHoldingUsdSolid },
};

interface SupplierInvoiceCardProps {
  invoice: SupplierInvoice;
  select: boolean;
  isSelected: boolean;
  onSelectionChange: (checked: boolean) => void;
}

interface CardField {
  label: string;
  value: string;
  icon: IconType;
  subtitle?: string;
  valueClassName?: string;
  iconClassName?: string;
}

const SupplierInvoiceCard = memo(
  ({ invoice, select, isSelected, onSelectionChange }: SupplierInvoiceCardProps) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const typeConfig = TRANSACTION_TYPE_CONFIG[invoice.type];
    const typeColors = typeConfig ?? {
      text: 'text-gray-800',
      iconColor: 'text-primary',
      icon: LiaDollarSignSolid,
    };

    const isNegativeAmount = invoice.type === 'RETURN' || invoice.type === 'PAID';

    const fields: CardField[] = useMemo(
      () => [
        {
          label: 'موظف مشتريات',
          value: invoice.createdByEmployee ? getDepartmentLabel(invoice.createdByEmployee.department) : 'غير محدد',
          icon: LiaUserTieSolid,
        },
        {
          label: 'عدد الاصناف',
          value: `عدد الاصناف ${invoice.products.length}`,
          icon: LiaBoxOpenSolid,
        },
        {
          label: 'التاريخ والوقت',
          value: getTimeAgo(invoice.createdAt),
          icon: LiaClockSolid,
          subtitle: formatDate(invoice.createdAt),
        },
        {
          label: 'المبلغ الاجمالي',
          value: `${isNegativeAmount ? '-' : '+'}${formatMoney(String(Math.abs(invoice.totalAmount)))}`,
          icon: LiaMoneyBillWaveSolid,
          valueClassName: typeColors.text,
          iconClassName: typeColors.iconColor,
        },
        {
          label: 'نوع الفاتورة',
          value: INVOICE_TYPE_LABEL[invoice.type] ?? invoice.type,
          icon: typeColors.icon,
          valueClassName: typeColors.text,
          iconClassName: typeColors.iconColor,
        },
      ],
      [invoice, typeColors, isNegativeAmount],
    );

    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start gap-2">
          {select && (
            <label className="-ms-2 -mt-1.5 flex size-10 shrink-0 cursor-pointer items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectionChange(checked === true)}
                aria-label={`تحديد الفاتورة ${invoice.code}`}
              />
            </label>
          )}
          <button
            type="button"
            className="flex min-h-10 min-w-0 items-center gap-2 text-start text-lg font-bold text-primary hover:underline transition-colors"
            onClick={() => setIsDetailOpen(true)}
          >
            <LiaFileInvoiceSolid
              className="text-primary shrink-0"
              style={{ width: 24, height: 24 }}
            />
            <span className="break-all">فاتورة رقم {invoice.code}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 px-0 sm:px-10">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex flex-col items-start sm:items-center gap-1.5"
            >
              <span className="text-sm sm:text-base text-gray-600">{field.label}</span>
              <div className="flex items-center gap-1.5">
                <field.icon
                  className={clsx('w-4 h-4', field.iconClassName ?? 'text-primary')}
                />
                <span
                  className={clsx(
                    'text-base font-semibold',
                    field.valueClassName ?? 'text-gray-800',
                  )}
                >
                  {field.value}
                </span>
              </div>
              {field.subtitle && (
                <span className="text-sm text-gray-600">{field.subtitle}</span>
              )}
            </div>
          ))}
        </div>

        <InvoiceDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          invoice={invoice}
        />
      </div>
    );
  },
);

SupplierInvoiceCard.displayName = 'SupplierInvoiceCard';

export default SupplierInvoiceCard;
