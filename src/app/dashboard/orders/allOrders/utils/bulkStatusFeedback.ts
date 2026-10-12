import { toast } from 'react-toastify';
import type { Order } from '@/types/orders';

const CODES_SHOWN = 5;

export function formatOrderCodes(orders: Pick<Order, 'code'>[]): string {
  const shown = orders.slice(0, CODES_SHOWN).map((order) => order.code);
  const rest = orders.length - shown.length;
  return rest > 0 ? `${shown.join('، ')} و${rest} غيرها` : shown.join('، ');
}

export function splitParkedOrders<T extends Pick<Order, 'parkedAt'>>(
  orders: T[]
): { actionable: T[]; parked: T[] } {
  const actionable: T[] = [];
  const parked: T[] = [];
  for (const order of orders) {
    (order.parkedAt ? parked : actionable).push(order);
  }
  return { actionable, parked };
}

export function warnParkedOrdersSkipped(parked: Pick<Order, 'code'>[]) {
  if (parked.length === 0) return;
  toast.warning(
    `تم استبعاد ${parked.length} طلب معلّق بسبب إيقاف المتجر مؤقتًا: ${formatOrderCodes(parked)}`
  );
}

export function notifyBulkStatusResult(
  updatedCount: number,
  requestedCount?: number
) {
  if (updatedCount === 0) {
    toast.warning(
      'لم يتم تحديث أي طلب. قد تكون الطلبات معلّقة أو محذوفة أو تغيّرت حالتها أو في الحالة المطلوبة بالفعل'
    );
    return;
  }
  toast.success(`تم تحديث حالة ${updatedCount} طلب بنجاح`);
  if (requestedCount !== undefined && updatedCount < requestedCount) {
    toast.warning(
      `لم يتم تحديث ${requestedCount - updatedCount} من ${requestedCount} طلب لأنها معلّقة أو محذوفة أو في الحالة المطلوبة بالفعل`
    );
  }
}
