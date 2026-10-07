import { notFound, redirect } from 'next/navigation';
import { WAREHOUSES_PAGE_ENABLED } from '@/constants/warehouses';

/**
 * Warehouse creation now lives inside the warehouse-management page, which
 * also owns the hierarchy, stock-workflow rules and the movements ledger.
 */
export default function AddWarehousePage() {
  if (!WAREHOUSES_PAGE_ENABLED) notFound();
  redirect('/dashboard/inventory/warehouses');
}
