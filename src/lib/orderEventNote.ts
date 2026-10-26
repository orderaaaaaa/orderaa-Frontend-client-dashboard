import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';

/**
 * Stock-workflow events store their params as a JSON string in
 * `order_events.note`. This module turns those notes (and the line-edit
 * send-back note) into the same Arabic sentence everywhere they are shown, so
 * the order list cards and the order details timeline never drift apart.
 */

const STOCK_SHORTAGE_EVENT_MESSAGES = {
  STOCK_SHORTAGE_CARRIER_STATUS_NOT_APPLIED: {
    key: 'stockShortage.event.carrierNotApplied',
    withoutWarehouseKey: 'stockShortage.event.carrierNotAppliedNoWarehouse',
    title: 'stockShortage.event.shortageTitle',
    fields: ['status', 'productName', 'warehouseName'],
  },
  STOCK_SHORTAGE_MACHINE_TRANSITION: {
    key: 'stockShortage.event.machineTransition',
    withoutWarehouseKey: 'stockShortage.event.machineTransitionNoWarehouse',
    title: 'stockShortage.event.shortageTitle',
    fields: ['status', 'productName', 'warehouseName'],
  },
  STOCK_SHORTAGE_STORE_CREATION: {
    key: 'stockShortage.event.storeCreation',
    withoutWarehouseKey: 'stockShortage.event.storeCreationNoWarehouse',
    title: 'stockShortage.event.shortageTitle',
    fields: ['productName', 'warehouseName'],
  },
  STOCK_SHORTAGE_RETRY_APPLIED: {
    key: 'stockShortage.event.retryApplied',
    withoutWarehouseKey: null,
    title: 'stockShortage.event.retryTitle',
    fields: ['status'],
  },
  STOCK_TRANSITION_BLOCKED: {
    key: 'stockShortage.event.transitionBlockedWarehouse',
    withoutWarehouseKey: 'stockShortage.event.transitionBlocked',
    title: 'stockShortage.event.title',
    fields: ['fromStatus', 'toStatus', 'warehouseName'],
  },
} as const;

type StockShortageEventName = keyof typeof STOCK_SHORTAGE_EVENT_MESSAGES;

function isStockShortageEventName(
  name: string
): name is StockShortageEventName {
  return Object.prototype.hasOwnProperty.call(
    STOCK_SHORTAGE_EVENT_MESSAGES,
    name
  );
}

function parseEventParams(note: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(note);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

const LINE_EDIT_SENT_BACK_EVENT = 'ORDER_SENT_BACK_FOR_LINE_EDIT';

const LINE_EDIT_ACTION_LABEL_KEYS = {
  ADD: 'lineEdit.event.action.add',
  UPDATE: 'lineEdit.event.action.update',
  DELETE: 'lineEdit.event.action.delete',
} as const;

function isLineEditAction(
  value: string
): value is keyof typeof LINE_EDIT_ACTION_LABEL_KEYS {
  return Object.prototype.hasOwnProperty.call(LINE_EDIT_ACTION_LABEL_KEYS, value);
}

function lineEditSentBackNote(note: string | null | undefined): string | null {
  const params = note ? parseEventParams(note) : null;
  if (!params) return null;
  const locale = readStoredLocale();
  const parts: string[] = [];
  const action = params.lineAction;
  if (typeof action === 'string' && isLineEditAction(action)) {
    parts.push(translate(locale, LINE_EDIT_ACTION_LABEL_KEYS[action]));
  }
  const bypassed = params.bypassedVariantIds;
  if (Array.isArray(bypassed) && bypassed.length > 0) {
    parts.push(translate(locale, 'lineEdit.event.bypassed', { count: bypassed.length }));
  }
  return parts.length > 0 ? parts.join('، ') : null;
}

export function orderEventTitle(
  name: string,
  statusLabelOf: (statusKey: string) => string
): string {
  if (name === LINE_EDIT_SENT_BACK_EVENT) {
    return translate(readStoredLocale(), 'lineEdit.event.title');
  }
  if (!isStockShortageEventName(name)) return statusLabelOf(name);
  return translate(readStoredLocale(), STOCK_SHORTAGE_EVENT_MESSAGES[name].title);
}

export function renderOrderEventNote(
  name: string | null | undefined,
  note: string | null | undefined,
  statusLabelOf: (statusKey: string) => string
): string | null {
  if (name === LINE_EDIT_SENT_BACK_EVENT) return lineEditSentBackNote(note);
  if (!name || !isStockShortageEventName(name)) return note || null;
  const message = STOCK_SHORTAGE_EVENT_MESSAGES[name];
  const params = note ? parseEventParams(note) : null;
  if (!params) return name;
  const warehouseName = params.warehouseName;
  const warehouseMissing =
    typeof warehouseName !== 'string' || warehouseName === '';
  const omitWarehouse =
    warehouseMissing && message.withoutWarehouseKey !== null;
  const key =
    omitWarehouse && message.withoutWarehouseKey !== null
      ? message.withoutWarehouseKey
      : message.key;
  const values: Record<string, string> = {};
  for (const field of message.fields) {
    if (omitWarehouse && field === 'warehouseName') continue;
    const value = params[field];
    if (typeof value !== 'string' || value === '') return name;
    values[field] = value;
  }
  for (const statusField of ['status', 'fromStatus', 'toStatus']) {
    const statusValue = values[statusField];
    if (statusValue !== undefined) {
      values[statusField] = statusLabelOf(statusValue);
    }
  }
  return translate(readStoredLocale(), key, values);
}
