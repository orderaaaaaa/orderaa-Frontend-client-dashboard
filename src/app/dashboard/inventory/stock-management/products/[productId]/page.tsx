'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import PageLoading from '@/components/ui/page-loading';
import { PERMISSION_CODES } from '@/lib/permissions';
import { StocktakeAccessDenied } from '../../components/stocktake/StocktakeAccessDenied';
import { parsePositiveId } from '../../utils/parsePositiveId';
import { ProductStockContent } from './components/ProductStockContent';

interface ProductStockPageProps {
  params: { productId: string };
}

function ProductStockGate({ productId }: { productId: number }) {
  const canView = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_STOCK_READ);

  if (!canView) {
    return <StocktakeAccessDenied title="ليس لديك صلاحية عرض مخزون المنتج" />;
  }

  return <ProductStockContent key={productId} productId={productId} />;
}

export default function ProductStockPage({ params }: ProductStockPageProps) {
  const productId = parsePositiveId(params.productId);
  if (productId === null) notFound();

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden p-4">
      <Suspense fallback={<PageLoading message="جاري التحميل..." />}>
        <ProductStockGate productId={productId} />
      </Suspense>
    </div>
  );
}
