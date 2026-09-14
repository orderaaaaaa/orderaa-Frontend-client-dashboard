import { CONFIRM_MODES, type ConfirmMode } from '@/lib/api/warehouses';

export type StoreConfirmOutOfStock = boolean | null;

export function storeValueToConfirmMode(
  value: StoreConfirmOutOfStock
): ConfirmMode {
  if (value === null) return CONFIRM_MODES.FOLLOW_WORKFLOW;
  return value ? CONFIRM_MODES.ALLOW : CONFIRM_MODES.FORBID;
}

export function confirmModeToStoreValue(
  mode: ConfirmMode
): StoreConfirmOutOfStock {
  if (mode === CONFIRM_MODES.FOLLOW_WORKFLOW) return null;
  return mode === CONFIRM_MODES.ALLOW;
}

export function isConfirmMode(value: string): value is ConfirmMode {
  return Object.values<string>(CONFIRM_MODES).includes(value);
}
