import { OrderStatus } from '@/types/orders';
import type { TranslationKey } from '@/i18n/translate';
import type {
  InsufficientStockBehavior,
  StatusSelectionType,
  StockMovementSource,
  StockWorkflowEventType,
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

/**
 * T28 — the transitions T14 seeded a default restock rule for: a packaged order
 * bouncing back to the call centre.
 *
 * These are called out by name in the coverage panel because they are the ones
 * with real inventory consequences. A product or variant that takes over its
 * own scope stops inheriting the global restock rule entirely, and if nothing in
 * its own scope covers these, stock silently stays out of the warehouse — the
 * exact failure T14 existed to fix.
 *
 * CONFIRMED is a valid SOURCE but not a restock TARGET: it is where packaging
 * begins, so an order back at CONFIRMED is still with packaging (T14 decision 2).
 */
export const RESTOCK_SOURCE_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.WAITING_FOR_PACKAGING,
  OrderStatus.PREPARED,
  OrderStatus.WAITING_FOR_APPROVAL,
];

export const RESTOCK_TARGET_STATUSES: OrderStatus[] = [
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
];

/**
 * Scope key → catalogue key, in the order the picker lists them.
 *
 * Label keys rather than labels: the selector resolves them through `t()`, and
 * `RuleScope` is derived from this object's keys so the union and the picker
 * cannot fall out of step.
 */
export const RULE_SCOPE_LABEL_KEYS = {
  GLOBAL: 'stockRules.scope.global',
  PRODUCT: 'stockRules.scope.product',
  VARIANT: 'stockRules.scope.variant',
} as const satisfies Record<string, TranslationKey>;

/**
 * T29 — the event types the rule builder can CREATE, in pill order.
 *
 * `Partial<Record<...>>` on purpose: `INBOUND` is a real wire value with no
 * entry here because T29's backend rejects creating one and the builder offers
 * no affordance for it — T30 adds both. Keying the pills off this object's
 * keys means adding the entry is the only step needed then.
 */
export const EVENT_TYPE_LABEL_KEYS = {
  CREATION: 'stockRules.event.creation',
  TRANSITION: 'stockRules.event.transition',
} as const satisfies Partial<Record<StockWorkflowEventType, TranslationKey>>;

/** Every way one side of a transition rule can match — the segmented control. */
export const SELECTION_TYPE_LABEL_KEYS = {
  ANY: 'stockRules.selection.any',
  RANGE: 'stockRules.selection.range',
  SPECIFIC: 'stockRules.selection.specific',
} as const satisfies Record<StatusSelectionType, TranslationKey>;
