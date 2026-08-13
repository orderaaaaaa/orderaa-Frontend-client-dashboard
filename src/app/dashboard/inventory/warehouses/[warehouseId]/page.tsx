'use client';

import { notFound } from 'next/navigation';
import { WarehouseDetailContent } from './components';

export default function WarehouseDetailPage({
  params,
}: {
  params: { warehouseId: string };
}) {
  const numericId = Number(params.warehouseId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  return <WarehouseDetailContent warehouseId={numericId} />;
}
