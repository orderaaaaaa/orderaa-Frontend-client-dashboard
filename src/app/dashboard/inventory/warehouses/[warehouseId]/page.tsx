'use client';

import { notFound } from 'next/navigation';
import { WAREHOUSES_PAGE_ENABLED } from '@/constants/warehouses';
import { WarehouseDetailContent } from './components';

export default function WarehouseDetailPage({
  params,
}: {
  params: { warehouseId: string };
}) {
  if (!WAREHOUSES_PAGE_ENABLED) notFound();

  const numericId = Number(params.warehouseId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  return <WarehouseDetailContent warehouseId={numericId} />;
}
