'use client';

import { memo, useMemo, useState } from 'react';
import Link from 'next/link';
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
  LiaEditSolid,
} from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import { Supplier } from '../types';
import { formatCurrency, formatSupplierBalance } from '../utils';
import PaymentModal from './PaymentModal';
import EditSupplierModal from './EditSupplierModal';

interface SupplierCardProps {
  supplier: Supplier;
}

const SupplierCard = memo(({ supplier }: SupplierCardProps) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const remainingLabel = useMemo(() => formatSupplierBalance(supplier.remaining), [supplier.remaining]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start flex-col gap-1 min-w-0">
          <Link
            href={`/dashboard/purchases/all-suppliers/${supplier.id}`}
            className="flex min-w-0 items-center gap-2 text-lg font-bold text-primary hover:underline transition-colors"
          >
            <LiaUserSolid className="w-6 h-6 shrink-0 text-primary" />
            <span className="break-words min-w-0">{supplier.name}</span>
          </Link>
          {supplier.nickname && (
            <span className="ps-8 text-sm text-gray-600 break-words">{supplier.nickname}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* suppliers:update is in MANAGER_EXCLUDED_CODES, so an ungated
              button would 403 for Managers. */}
          <Can code={PERMISSIONS.SUPPLIERS_UPDATE}>
            <Button
              variant="outline"
              size="sm"
              className="max-sm:h-10 max-sm:flex-1 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              onClick={() => setIsEditOpen(true)}
            >
              <LiaEditSolid className="w-4 h-4" />
              تعديل
            </Button>
          </Can>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="max-sm:h-10 max-sm:flex-1 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Link href={`/dashboard/purchases/all-suppliers/${supplier.id}/products`}>
              <LiaBoxesSolid className="w-4 h-4" />
              المنتجات
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="max-sm:h-10 max-sm:flex-1 rounded-full font-semibold text-xs sm:text-sm"
            onClick={() => setIsPaymentOpen(true)}
          >
            دفع
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 px-0 sm:px-4">
        <div className="col-span-2 md:col-span-1 flex flex-col items-start sm:items-center gap-1.5 min-w-0">
          <a
            href={`tel:${supplier.phoneNumber}`}
            className="flex min-h-10 items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <LiaPhoneSolid className="w-4 h-4 shrink-0" />
            <span dir="ltr">{supplier.phoneNumber}</span>
          </a>
          {supplier.email && (
            <a
              href={`mailto:${supplier.email}`}
              className="flex min-h-10 min-w-0 max-w-full items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
            >
              <LiaEnvelopeSolid className="w-4 h-4 shrink-0" />
              <span dir="ltr" className="truncate">{supplier.email}</span>
            </a>
          )}
        </div>
        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-sm sm:text-base text-gray-600">المبلغ الاجمالي</span>
          <div className="flex items-center gap-1.5">
            <LiaMoneyBillWaveSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {formatCurrency(supplier.totalPurchased)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-sm sm:text-base text-gray-600">فواتير الشراء</span>
          <div className="flex items-center gap-1.5">
            <LiaFileInvoiceSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {supplier.invoiceCount}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-sm sm:text-base text-gray-600">مدفوع</span>
          <div className="flex items-center gap-1.5">
            <LiaHandHoldingUsdSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {formatCurrency(supplier.paidAmount)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-sm sm:text-base text-gray-600">المرتجعات</span>
          <div className="flex items-center gap-1.5">
            <LiaUndoAltSolid className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold text-gray-800">
              {formatCurrency(supplier.totalReturned)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-center gap-1.5">
          <span className="text-sm sm:text-base text-gray-600">المتبقي</span>
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
        remaining={supplier.remaining}
      />
      <EditSupplierModal
        supplier={supplier}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
});

SupplierCard.displayName = 'SupplierCard';

export default SupplierCard;
