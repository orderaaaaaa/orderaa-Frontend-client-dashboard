'use client';

import { memo, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  LiaUserSolid,
  LiaPhoneSolid,
  LiaEnvelopeSolid,
  LiaMoneyBillWaveSolid,
  LiaFileInvoiceSolid,
  LiaHandHoldingUsdSolid,
  LiaBalanceScaleSolid,
  LiaUndoAltSolid,
  LiaBoxesSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Supplier } from '../types';
import { formatCurrency } from '../utils';
import PaymentModal from './PaymentModal';

interface SupplierCardProps {
  supplier: Supplier;
}

const SupplierCard = memo(({ supplier }: SupplierCardProps) => {
  const router = useRouter();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const remainingLabel = useMemo(() => {
    if (supplier.remaining === 0) return { text: '0 ج.م', color: 'text-gray-500' };
    if (supplier.remaining < 0) {
      return { text: `${formatCurrency(Math.abs(supplier.remaining))} عليه`, color: 'text-red-500' };
    }
    return { text: `${formatCurrency(supplier.remaining)} له`, color: 'text-green-500' };
  }, [supplier.remaining]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center flex-col gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <LiaUserSolid className="w-6 h-6 text-primary" />
            <span
              className="text-lg font-bold text-primary cursor-pointer hover:text-primary hover:underline transition-colors"
              onClick={() => router.push(`/dashboard/purchases/all-suppliers/${supplier.id}`)}
            >
              {supplier.name}
            </span>
          </div>
          <span className="text-sm text-gray-500">{supplier.nickname}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5"
            onClick={() => router.push(`/dashboard/purchases/all-suppliers/${supplier.id}/products`)}
          >
            <LiaBoxesSolid className="w-4 h-4" />
            المنتجات
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-full font-semibold text-xs sm:text-sm"
            onClick={() => setIsPaymentOpen(true)}
          >
            دفع
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 px-4">
        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <a
            href={`tel:${supplier.phoneNumber}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <LiaPhoneSolid className="w-4 h-4" />
            <span>{supplier.phoneNumber}</span>
          </a>
          <a
            href={`mailto:${supplier.email}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <LiaEnvelopeSolid className="w-4 h-4" />
            <span>{supplier.email}</span>
          </a>
        </div>
        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-base text-gray-400">المبلغ الاجمالي</span>
          <div className="flex items-center gap-1.5">
            <LiaMoneyBillWaveSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {formatCurrency(supplier.totalPurchased)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-base text-gray-400">عدد الفواتير</span>
          <div className="flex items-center gap-1.5">
            <LiaFileInvoiceSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {supplier.invoiceCount}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-base text-gray-400">مدفوع</span>
          <div className="flex items-center gap-1.5">
            <LiaHandHoldingUsdSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {formatCurrency(supplier.paidAmount)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-base text-gray-400">المرتجعات</span>
          <div className="flex items-center gap-1.5">
            <LiaUndoAltSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {formatCurrency(supplier.totalReturned)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-base text-gray-400">المتبقي</span>
          <div className="flex items-center gap-1.5">
            <LiaBalanceScaleSolid className={clsx('w-4 h-4', remainingLabel.color)} />
            <span className={clsx('text-base font-semibold', remainingLabel.color)}>
              {remainingLabel.text}
            </span>
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        supplierId={supplier.id}
        supplierName={supplier.name}
      />
    </div>
  );
});

SupplierCard.displayName = 'SupplierCard';

export default SupplierCard;
