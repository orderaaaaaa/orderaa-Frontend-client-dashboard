'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  LiaMoneyBillWaveSolid,
  LiaUndoAltSolid,
  LiaBalanceScaleSolid,
} from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { getTimeAgo } from '@/utils/timeAgo';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { SupplierProduct, ProductTransaction } from '../types';
import { useProductTransactionsQuery } from '@/services/suppliers';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SupplierProduct;
  supplierId: number;
}

type TransactionRecord = Record<string, unknown> & ProductTransaction;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

const transactionColumns: DataTableColumn<TransactionRecord>[] = [
  {
    key: 'createdAt',
    header: 'التاريخ',
    render: (val) => {
      const dateStr = val as string;
      return (
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-800">{getTimeAgo(dateStr)}</span>
          <span className="text-xs text-gray-400">{formatDate(dateStr)}</span>
        </div>
      );
    },
  },
  {
    key: 'quantity',
    header: 'الكمية',
  },
  {
    key: 'totalPrice',
    header: 'إجمالي السعر',
    render: (val) => (val as number).toLocaleString(),
  },
  {
    key: 'invoiceType',
    header: 'النوع',
    render: (val) => {
      const type = val as string;
      const isPurchase = type === 'PURCHASE';
      return (
        <span
          className={clsx(
            'text-sm font-medium',
            isPurchase ? 'text-green-600' : 'text-red-500',
          )}
        >
          {isPurchase ? 'شراء' : 'مرتجع'}
        </span>
      );
    },
  },
];

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  supplierId,
}: ProductDetailModalProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('');

  const { data: allTransactionsRaw = [], isLoading } = useProductTransactionsQuery(
    supplierId,
    product.productId,
  );

  const allTransactions = allTransactionsRaw as TransactionRecord[];

  const purchases = useMemo(
    () => allTransactions.filter((t) => t.invoiceType === 'PURCHASE'),
    [allTransactions],
  );

  const returns = useMemo(
    () => allTransactions.filter((t) => t.invoiceType === 'RETURN'),
    [allTransactions],
  );

  const stats = useMemo(
    () => [
      {
        label: 'إجمالي المشتريات',
        value: product.totalPurchaseAmount.toLocaleString(),
        icon: LiaMoneyBillWaveSolid,
      },
      {
        label: 'إجمالي المرتجعات',
        value: product.totalReturnAmount.toLocaleString(),
        icon: LiaUndoAltSolid,
      },
      {
        label: 'إجمالي صافي شراء',
        value: product.netAmount.toLocaleString(),
        icon: LiaBalanceScaleSolid,
      },
    ],
    [product],
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="المنتج"
      showFooter={false}
      maxWidth="md:max-w-[700px]"
      height="h-[85vh]"
    >
      <div className="flex flex-col gap-5">
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          timePeriod={timePeriod}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onTimePeriodChange={setTimePeriod}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-800 text-right">
            اسم المنتج
          </span>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <span className="text-sm font-medium text-gray-800">
              {product.productName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3"
            >
              <stat.icon className="w-5 h-5 text-primary shrink-0" />
              <div className="flex flex-col items-start flex-1 gap-1">
                <span className="text-xs font-bold">{stat.label}</span>
                <span className="text-sm sm:text-base font-bold text-gray-800">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="all" dir="rtl">
            <TabsList>
              <TabsTrigger value="all">
                جميع المعاملات ({allTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="purchases">
                المشتريات ({purchases.length})
              </TabsTrigger>
              <TabsTrigger value="returns">
                المرتجعات ({returns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <DataTable<TransactionRecord>
                columns={transactionColumns}
                data={allTransactions}
                keyField="invoiceId"
                emptyMessage="لا توجد معاملات"
                className="shadow-none"
              />
            </TabsContent>

            <TabsContent value="purchases">
              <DataTable<TransactionRecord>
                columns={transactionColumns}
                data={purchases}
                keyField="invoiceId"
                emptyMessage="لا توجد مشتريات"
                className="shadow-none"
              />
            </TabsContent>

            <TabsContent value="returns">
              <DataTable<TransactionRecord>
                columns={transactionColumns}
                data={returns}
                keyField="invoiceId"
                emptyMessage="لا توجد مرتجعات"
                className="shadow-none"
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </BaseModal>
  );
}
