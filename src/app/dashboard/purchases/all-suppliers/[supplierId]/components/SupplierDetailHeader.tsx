'use client';

import { memo, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  LiaUserSolid,
  LiaMoneyBillWaveSolid,
  LiaHandHoldingUsdSolid,
  LiaBalanceScaleSolid,
  LiaUndoAltSolid,
  LiaFileInvoiceSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Supplier } from '../../types';
import { formatCurrency } from '../../utils';
import PaymentModal from '../../components/PaymentModal';

interface SupplierDetailHeaderProps {
  supplier: Supplier;
}

interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SupplierDetailHeader = memo(({ supplier }: SupplierDetailHeaderProps) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const stats: StatCard[] = useMemo(
    () => [
      {
        label: 'إجمالي المشتريات',
        value: formatCurrency(supplier.totalAmount),
        icon: LiaMoneyBillWaveSolid,
      },
      {
        label: 'المدفوعات',
        value: formatCurrency(supplier.paidAmount),
        icon: LiaHandHoldingUsdSolid,
      },
      {
        label: 'المتبقي',
        value: formatCurrency(Math.abs(supplier.remainingAmount)),
        icon: LiaBalanceScaleSolid,
      },
      {
        label: 'إجمالي المرتجعات',
        value: formatCurrency(0),
        icon: LiaUndoAltSolid,
      },
      {
        label: 'إجمالي الفواتير',
        value: String(supplier.invoicesCount),
        icon: LiaFileInvoiceSolid,
      },
    ],
    [supplier],
  );

  return (
    <div className="px-4 sm:px-8 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-400 flex items-center justify-center shrink-0">
            <LiaUserSolid className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            فواتير {supplier.name}
          </h1>
        </div>
        <Button
          variant="default"
          className="rounded-full font-semibold text-sm px-6 w-full sm:w-auto"
          onClick={() => setIsPaymentOpen(true)}
        >
          دفع
        </Button>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        supplierName={supplier.name}
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className={clsx(
              'flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-3 sm:p-4',
              idx === stats.length - 1 && stats.length % 2 !== 0 && 'col-span-2 sm:col-span-1 max-w-[50%] sm:max-w-none mx-auto sm:mx-0',
            )}
          >
            <span className="text-xs sm:text-sm text-gray-400">{stat.label}</span>
            <div className="flex items-center gap-1.5">
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-base sm:text-lg font-bold text-gray-800">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SupplierDetailHeader.displayName = 'SupplierDetailHeader';

export default SupplierDetailHeader;
