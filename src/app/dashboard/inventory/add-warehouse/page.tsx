import { redirect } from 'next/navigation';

/**
 * Warehouse creation now lives inside the warehouse-management page, which
 * also owns the hierarchy, stock-workflow rules and the movements ledger.
 */
export default function AddWarehousePage() {
  redirect('/dashboard/inventory/warehouses');
}
