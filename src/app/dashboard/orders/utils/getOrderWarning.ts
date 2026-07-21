interface OrderWithWarnings {
  isShadowed?: boolean;
  packagingWarning?: string | null;
  editRejectedNote?: string | null;
  cancelReason?: string | null;
}

/**
 * Returns the first warning message for a scanned order, or null if no warnings.
 * Priority: isShadowed > packagingWarning > editRejectedNote > cancelReason
 */
export function getOrderWarning(order: OrderWithWarnings): string | null {
  if (order.isShadowed) {
    return 'الطلب محجوب Due to insufficient balance';
  }
  if (order.packagingWarning) {
    return order.packagingWarning;
  }
  if (order.editRejectedNote) {
    return order.editRejectedNote;
  }
  if (order.cancelReason) {
    return order.cancelReason;
  }
  return null;
}
