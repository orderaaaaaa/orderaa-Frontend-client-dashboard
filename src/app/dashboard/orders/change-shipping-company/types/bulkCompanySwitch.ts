import type { Order } from '@/types/orders';
import type { CarrierSendBlock } from '@/types/carrierSends';
import type { ShippingCompanyKind } from '@/types/shippingCompanies';

export const BULK_COMPANY_SWITCH_OUTCOME = {
  SWITCHED: 'SWITCHED',
  UPDATED: 'UPDATED',
  NOT_SWITCHED: 'NOT_SWITCHED',
  SKIPPED: 'SKIPPED',
} as const;

export type BulkCompanySwitchOutcome =
  (typeof BULK_COMPANY_SWITCH_OUTCOME)[keyof typeof BULK_COMPANY_SWITCH_OUTCOME];

export const BULK_COMPANY_SWITCH_REASON = {
  STATUS_NOT_ALLOWED: 'STATUS_NOT_ALLOWED',
  SHADOWED: 'SHADOWED',
  PARKED: 'PARKED',
  LOCKED_BY_OTHER: 'LOCKED_BY_OTHER',
  TARGET_NOT_ACTIVE: 'TARGET_NOT_ACTIVE',
  LOCATION_MISSING: 'LOCATION_MISSING',
  LOCATION_UNRESOLVED: 'LOCATION_UNRESOLVED',
  PHONE_MISSING: 'PHONE_MISSING',
  ADDRESS_MISSING: 'ADDRESS_MISSING',
  OPEN_MARKER: 'OPEN_MARKER',
  LEDGER_REFUSED: 'LEDGER_REFUSED',
  CLAIM_FAILED: 'CLAIM_FAILED',
  CODE_NOT_ISSUED: 'CODE_NOT_ISSUED',
  RETIRED_INTEGRATION: 'RETIRED_INTEGRATION',
  REPLACED_PARENT_NO_CARRIER_SYNC: 'REPLACED_PARENT_NO_CARRIER_SYNC',
  CARRIER_ACCEPTED: 'CARRIER_ACCEPTED',
  LOCAL_SWITCH: 'LOCAL_SWITCH',
  LOCAL_SAME: 'LOCAL_SAME',
  UPDATED_ON_CARRIER: 'UPDATED_ON_CARRIER',
  CARRIER_REJECTED: 'CARRIER_REJECTED',
  OUTCOME_UNKNOWN: 'OUTCOME_UNKNOWN',
  STATE_CHANGED: 'STATE_CHANGED',
  HELD_CHECK_REQUIRED: 'HELD_CHECK_REQUIRED',
  CAP_REACHED: 'CAP_REACHED',
  BUDGET_REACHED: 'BUDGET_REACHED',
} as const;

export type BulkCompanySwitchReason =
  (typeof BULK_COMPANY_SWITCH_REASON)[keyof typeof BULK_COMPANY_SWITCH_REASON];

export interface BulkCompanySwitchCompanyRef {
  id: number;
  name: string;
  kind: ShippingCompanyKind;
}

export interface BulkCompanySwitchRequest {
  shippingCompanyId: number;
  governorateOption: string;
  cityOption: string;
}

export interface BulkCompanySwitchResponse {
  orderId: number;
  code: string;
  outcome: BulkCompanySwitchOutcome;
  reason: BulkCompanySwitchReason;
  message: string;
  shippingCompany: BulkCompanySwitchCompanyRef | null;
  previousCompany: BulkCompanySwitchCompanyRef | null;
  shippingId: string | null;
  previousShippingId: string | null;
  cancelAtPreviousCarrier: boolean;
  openMarkerId: number | null;
  skipRowCode: string | null;
  carrierSend: CarrierSendBlock | null;
}

export const CHANGE_COMPANY_ROW_STATUS = {
  READY: 'READY',
  SKIPPED_LOCAL: 'SKIPPED_LOCAL',
  SENDING: 'SENDING',
  DONE: 'DONE',
  SKIPPED: 'SKIPPED',
  ERROR: 'ERROR',
  ERROR_UNKNOWN: 'ERROR_UNKNOWN',
} as const;

export type ChangeCompanyRowStatus =
  (typeof CHANGE_COMPANY_ROW_STATUS)[keyof typeof CHANGE_COMPANY_ROW_STATUS];

export const CHANGE_COMPANY_CHOICE = {
  SAVE_ONLY: 'SAVE_ONLY',
  SAVE_AND_PRINT: 'SAVE_AND_PRINT',
} as const;

export type ChangeCompanyChoice =
  (typeof CHANGE_COMPANY_CHOICE)[keyof typeof CHANGE_COMPANY_CHOICE];

export const CHANGE_COMPANY_PHASE = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
} as const;

export type ChangeCompanyPhase =
  (typeof CHANGE_COMPANY_PHASE)[keyof typeof CHANGE_COMPANY_PHASE];

export interface ChangeCompanySnapshot {
  companyId: number | null;
  companyName: string | null;
}

export interface ChangeCompanyPicks {
  governorateOption: string | null;
  governorateName: string | null;
  cityOption: string | null;
  cityName: string | null;
}

export interface ChangeCompanyRow {
  order: Order;
  snapshot: ChangeCompanySnapshot;
  status: ChangeCompanyRowStatus;
  picks: ChangeCompanyPicks;
  localReason: BulkCompanySwitchReason | null;
  result: BulkCompanySwitchResponse | null;
  errorMessage: string | null;
  prefillTargetId: number | null;
  cityPrefillKey: string | null;
}
