import { redirect } from 'next/navigation';
import {
  STOCK_MANAGEMENT_BASE_PATH,
  STOCK_SCOPE_KINDS,
  stockProductHref,
  stockScopeHref,
} from '../constants';
import { parsePositiveId } from '../utils/parsePositiveId';

interface StockOperationsRedirectPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function StockOperationsRedirectPage({ searchParams }: StockOperationsRedirectPageProps) {
  const productId = parsePositiveId(searchParams.productId);
  if (productId !== null) {
    redirect(stockProductHref(productId, parsePositiveId(searchParams.variantId)));
  }

  const warehouseId = parsePositiveId(searchParams.warehouseId);
  if (warehouseId !== null) {
    redirect(stockScopeHref({ kind: STOCK_SCOPE_KINDS.PHYSICAL, id: warehouseId }));
  }

  redirect(STOCK_MANAGEMENT_BASE_PATH);
}
