import { OrderStatus } from '@/types/orders';
import type {
  InsufficientStockBehavior,
  StockMovementSource,
} from '@/lib/api/warehouses';

/**
 * The 24 statuses the BACKEND OrderStatus enum accepts (prisma/schema.prisma).
 * The frontend enum carries extra legacy values (PARTIAL_DELIVERY,
 * FINAL_RETURN, RETURN_RESEND_PENDING, RETURN_WAREHOUSE) that the rules API
 * rejects with a 400 — never derive workflow options from Object.values().
 */
export const WORKFLOW_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.NEW_ORDER,
  OrderStatus.WHATSAPP_CONFIRMED,
  OrderStatus.ATTEMPTED,
  OrderStatus.WAITING_FOR_PAYMENT,
  OrderStatus.WHATSAPP,
  OrderStatus.CALL_AGAIN,
  OrderStatus.EDIT_REJECTED,
  OrderStatus.POSTPONED,
  OrderStatus.STOPPED,
  OrderStatus.CANCELLED,
  OrderStatus.UNCOMPLETED,
  OrderStatus.CONFIRMED,
  OrderStatus.WAITING_FOR_PACKAGING,
  OrderStatus.PREPARED,
  OrderStatus.WAITING_FOR_APPROVAL,
  OrderStatus.SHIPPING,
  OrderStatus.WITH_DRIVER,
  OrderStatus.DELIVERED,
  OrderStatus.RETURNED_DELIVERED,
  OrderStatus.RETURNED_COLLECTED,
  OrderStatus.COLLECTED,
  OrderStatus.RETURNED_SETTLED,
  OrderStatus.RETURNED_FINAL,
  OrderStatus.MISSING,
];

export const WAREHOUSE_BRANCH_OPTIONS = [
  { key: 'main', value: 'مخزن رئيسي' },
  { key: 'sub', value: 'مخزن فرعي' },
];

export const CREATION_RULE_KEY = '';
export const CREATION_RULE_LABEL = 'عند إنشاء الطلب';

export const INSUFFICIENT_STOCK_OPTIONS: {
  key: InsufficientStockBehavior;
  value: string;
}[] = [
  { key: 'THROW', value: 'منع العملية' },
  { key: 'SKIP', value: 'تخطي الحركة' },
];

export const MOVEMENT_SOURCE_LABELS: Record<StockMovementSource, string> = {
  INBOUND: 'وارد من مورد',
  WORKFLOW: 'حركة حالة طلب',
  ADJUSTMENT: 'تسوية',
  TRANSFER: 'نقل',
};

export const MOVEMENT_SOURCE_CLASSES: Record<StockMovementSource, string> = {
  INBOUND: 'bg-green-100 text-green-700',
  WORKFLOW: 'bg-blue-100 text-blue-700',
  ADJUSTMENT: 'bg-amber-100 text-amber-700',
  TRANSFER: 'bg-purple-100 text-purple-700',
};

/** Ledger `referenceType` values emitted by the backend. */
export const REFERENCE_TYPE_LABELS: Record<string, string> = {
  SUPPLIER_INVOICE: 'فاتورة مورد',
  ORDER: 'طلب',
  ADJUSTMENT_BATCH: 'تسوية',
  TRANSFER_BATCH: 'نقل',
  VARIANT_MERGE: 'دمج متغيرات',
};

export const MOVEMENT_SOURCE_OPTIONS = [
  { key: '', value: 'كل المصادر' },
  ...(
    Object.keys(MOVEMENT_SOURCE_LABELS) as StockMovementSource[]
  ).map((source) => ({ key: source, value: MOVEMENT_SOURCE_LABELS[source] })),
];

export const WAREHOUSE_TABS = {
  WAREHOUSES: 'warehouses',
  WORKFLOWS: 'workflows',
  MOVEMENTS: 'movements',
} as const;
