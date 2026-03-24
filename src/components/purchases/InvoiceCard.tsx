'use client';

import { memo, useMemo, useState } from 'react';
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
import BaseModal from '@/components/ui/base-modal';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { getTimeAgo } from '@/utils/timeAgo';

const TRANSACTION_TYPE_CONFIG: Record<string, { text: string; iconColor: string; icon: IconType }> = {
  'استبدال': { text: 'text-orange-500', iconColor: 'text-orange-500', icon: LiaExchangeAltSolid },
  'مرتجع': { text: 'text-red-500', iconColor: 'text-red-500', icon: LiaUndoAltSolid },
  'مشتريات': { text: 'text-green-500', iconColor: 'text-green-500', icon: LiaDollarSignSolid },
};

function getPaymentStatus(totalAmount: number, paymentAmount?: number | null): { label: string; bgClass: string; textClass: string } {
  if (!paymentAmount || paymentAmount === 0) {
    return { label: 'غير مدفوع', bgClass: 'bg-red-500', textClass: 'text-white' };
  }
  if (paymentAmount >= totalAmount) {
    return { label: 'مدفوع بالكامل', bgClass: 'bg-green-500', textClass: 'text-white' };
  }
  return { label: 'مدفوع جزئياً', bgClass: 'bg-yellow-500', textClass: 'text-white' };
}

export interface InvoiceCardProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface InvoiceCardData {
  id: number;
  invoiceNumber: string;
  companyName: string;
  itemsCount: number;
  products?: InvoiceCardProduct[];
  employeeName: string;
  createdAt: string;
  totalAmount: number;
  paymentAmount?: number | null;
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
  onClick?: () => void;
}

type ProductRow = InvoiceCardProduct & Record<string, unknown>;

const productColumns: DataTableColumn<ProductRow>[] = [
  { key: 'name', header: 'اسم الصنف' },
  {
    key: 'quantity',
    header: 'الكمية',
    render: (value) => <span>{(value as number).toLocaleString()}</span>,
  },
  {
    key: 'price',
    header: 'السعر',
    render: (value) => <span>{(value as number).toLocaleString()} جنيه</span>,
  },
  {
    key: 'total',
    header: 'الإجمالي',
    render: (_value, row) => (
      <span className="font-semibold">
        {(row.quantity * row.price).toLocaleString()} جنيه
      </span>
    ),
  },
];

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
    const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);

    const typeConfig = TRANSACTION_TYPE_CONFIG[invoice.transactionType];
    const typeColors = typeConfig ?? {
      text: 'text-gray-800',
      iconColor: 'text-primary',
      icon: LiaCheckCircleSolid,
    };

    const isNegativeAmount = invoice.transactionType === 'استبدال' || invoice.transactionType === 'مرتجع';

    const paymentStatus = useMemo(
      () => getPaymentStatus(invoice.totalAmount, invoice.paymentAmount),
      [invoice.totalAmount, invoice.paymentAmount],
    );

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
          onClick: invoice.products?.length ? () => setIsProductsModalOpen(true) : undefined,
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
        {
          label: 'المبلغ الإجمالي',
          value: `${invoice.totalAmount.toLocaleString()} جنيه`,
          icon: LiaMoneyBillWaveSolid,
        },
      ],
      [invoice, typeColors, isNegativeAmount, formatDate]
    );

    return (
      <div className="relative w-full bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md overflow-hidden">
        <div className="absolute top-0 end-0 w-28 h-28 overflow-hidden pointer-events-none">
          <div
            className={clsx(
              'absolute top-5 -end-10 w-40 text-center text-base font-bold py-1 shadow-sm rotate-45 rtl:-rotate-45',
              paymentStatus.bgClass,
              paymentStatus.textClass,
            )}
          >
            {paymentStatus.label}
          </div>
        </div>

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
            <span className="ps-11 text-base">{invoice.companyName}</span>
          </div>

          {select && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange(checked === true)}
              className="mt-1"
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 px-10">
          {fields.map((field) =>
            field.onClick ? (
              <button
                key={field.label}
                type="button"
                className="flex flex-col items-start sm:items-center gap-1.5 group cursor-pointer"
                onClick={field.onClick}
              >
                <span className="text-base text-gray-400">{field.label}</span>
                <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-full px-3 py-1 group-hover:bg-primary/10 group-hover:border-primary/40 transition-colors">
                  <field.icon className="w-4 h-4 text-primary" />
                  <span className="text-base font-semibold text-primary">
                    {field.value}
                  </span>
                </div>
              </button>
            ) : (
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
            ),
          )}
        </div>

        <BaseModal
          isOpen={isProductsModalOpen}
          onClose={() => setIsProductsModalOpen(false)}
          title={`أصناف الفاتورة ${invoice.invoiceNumber}`}
          showFooter={false}
        >
          <DataTable
            columns={productColumns}
            data={(invoice.products ?? []) as (InvoiceCardProduct & Record<string, unknown>)[]}
            keyField="name"
            emptyMessage="لا توجد أصناف"
          />
        </BaseModal>
      </div>
    );
  }
);

InvoiceCard.displayName = 'InvoiceCard';

export default InvoiceCard;
