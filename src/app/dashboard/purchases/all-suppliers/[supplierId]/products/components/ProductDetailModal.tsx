'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  LiaBoxSolid,
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
import { MOCK_PRODUCT_TRANSACTIONS } from '../constants';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SupplierProduct;
}

type TransactionRecord = Record<string, unknown> & ProductTransaction;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

const transactionColumns: DataTableColumn<TransactionRecord>[] = [
  {
    key: 'date',
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
    key: 'type',
    header: 'النوع',
    render: (val) => {
      const type = val as string;
      const isPurchase = type === 'purchase';
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
}: ProductDetailModalProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('');

  const allTransactions = useMemo(
    () => (MOCK_PRODUCT_TRANSACTIONS[product.id] ?? []) as TransactionRecord[],
    [product.id],
  );

  const purchases = useMemo(
    () => allTransactions.filter((t) => t.type === 'purchase'),
    [allTransactions],
  );

  const returns = useMemo(
    () => allTransactions.filter((t) => t.type === 'return'),
    [allTransactions],
  );

  const stats = useMemo(
    () => [
      {
        label: 'إجمالي المشتريات',
        value: product.totalPurchase.toLocaleString(),
        icon: LiaMoneyBillWaveSolid,
      },
      {
        label: 'إجمالي المرتجعات',
        value: product.totalReturned.toLocaleString(),
        icon: LiaUndoAltSolid,
      },
      {
        label: 'إجمالي صافي شراء',
        value: product.totalNet.toLocaleString(),
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
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-800">
              {product.name}
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
              keyField="id"
              emptyMessage="لا توجد معاملات"
              className="shadow-none"
            />
          </TabsContent>

          <TabsContent value="purchases">
            <DataTable<TransactionRecord>
              columns={transactionColumns}
              data={purchases}
              keyField="id"
              emptyMessage="لا توجد مشتريات"
              className="shadow-none"
            />
          </TabsContent>

          <TabsContent value="returns">
            <DataTable<TransactionRecord>
              columns={transactionColumns}
              data={returns}
              keyField="id"
              emptyMessage="لا توجد مرتجعات"
              className="shadow-none"
            />
          </TabsContent>
        </Tabs>
      </div>
    </BaseModal>
  );
}
