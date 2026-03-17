'use client';

import { useParams } from 'next/navigation';
import { useSupplierByIdQuery, useSupplierInvoicesQuery } from '@/services/suppliers';
import { SupplierDetailContent } from './components';
import { DEFAULT_PAGE_SIZE } from './constants';

export default function SupplierDetailPage() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const { data: supplier, isLoading: supplierLoading, isError } = useSupplierByIdQuery(Number(supplierId));
  const { data: invoicesData, isLoading: invoicesLoading } = useSupplierInvoicesQuery({
    supplierId: Number(supplierId),
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });

  if (supplierLoading || invoicesLoading) return null;

  if (isError || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-lg font-semibold text-gray-400">
          المورد غير موجود
        </p>
      </div>
    );
  }

  return <SupplierDetailContent supplier={supplier} initialInvoicesData={invoicesData} />;
}
