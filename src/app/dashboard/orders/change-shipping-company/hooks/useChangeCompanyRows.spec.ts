import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Order } from '@/types/orders';
import {
  BULK_COMPANY_SWITCH_OUTCOME,
  BULK_COMPANY_SWITCH_REASON,
  CHANGE_COMPANY_ROW_STATUS,
  type BulkCompanySwitchResponse,
  type ChangeCompanyRow,
} from '../types/bulkCompanySwitch';
import {
  applyClientChecks,
  needsClearConfirm,
  newRowOf,
  snapshotOf,
} from './useChangeCompanyRows';

const CONTEXT = {
  targetId: 12,
  targetActive: true,
  callerEmployeeId: 7,
  canBypassLock: false,
};

function orderOf(overrides: Partial<Order> = {}): Order {
  return {
    id: 1001,
    code: '1001',
    status: 'CONFIRMED',
    address: 'street 1',
    governorate: 'Cairo',
    city: 'Nasr City',
    customers: { id: 1, name: 'Customer', phone_numbers: ['01000000000'] },
    isShadowed: false,
    parkedAt: null,
    lockedById: null,
    shippingCompanyRef: null,
    ...overrides,
  } as Order;
}

function pickedRowOf(order: Order): ChangeCompanyRow {
  const row = newRowOf(order);
  return {
    ...row,
    picks: {
      governorateOption: 'name:431',
      governorateName: 'Cairo',
      cityOption: 'row:9120',
      cityName: 'Nasr City',
    },
  };
}

function responseOf(overrides: Partial<BulkCompanySwitchResponse> = {}): BulkCompanySwitchResponse {
  return {
    orderId: 1001,
    code: '1001',
    outcome: BULK_COMPANY_SWITCH_OUTCOME.SWITCHED,
    reason: BULK_COMPANY_SWITCH_REASON.CARRIER_ACCEPTED,
    message: 'ok',
    shippingCompany: null,
    previousCompany: { id: 3, name: 'Turbo', kind: 'INTEGRATION' },
    shippingId: '2',
    previousShippingId: '1',
    cancelAtPreviousCarrier: true,
    openMarkerId: null,
    skipRowCode: null,
    carrierSend: null,
    ...overrides,
  };
}

describe('applyClientChecks', () => {
  it('marks a ready, picked, sendable row READY', () => {
    const [checked] = applyClientChecks([pickedRowOf(orderOf())], CONTEXT);
    assert.equal(checked.status, CHANGE_COMPANY_ROW_STATUS.READY);
    assert.equal(checked.localReason, null);
  });

  it('refuses a status outside the three sendable statuses (G-115)', () => {
    const [checked] = applyClientChecks(
      [pickedRowOf(orderOf({ status: 'SHIPPING' }))],
      CONTEXT
    );
    assert.equal(checked.status, CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL);
    assert.equal(checked.localReason, BULK_COMPANY_SWITCH_REASON.STATUS_NOT_ALLOWED);
  });

  it('refuses a missing or blank phone (DF-T09-5)', () => {
    const [missing] = applyClientChecks(
      [pickedRowOf(orderOf({ customers: { id: 1, name: 'C', phone_numbers: [] } }))],
      CONTEXT
    );
    const [blank] = applyClientChecks(
      [pickedRowOf(orderOf({ customers: { id: 1, name: 'C', phone_numbers: ['  '] } }))],
      CONTEXT
    );
    assert.equal(missing.localReason, BULK_COMPANY_SWITCH_REASON.PHONE_MISSING);
    assert.equal(blank.localReason, BULK_COMPANY_SWITCH_REASON.PHONE_MISSING);
  });

  it('refuses a row without a governorate or city pick (G-120)', () => {
    const [checked] = applyClientChecks([newRowOf(orderOf())], CONTEXT);
    assert.equal(checked.status, CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL);
    assert.equal(checked.localReason, BULK_COMPANY_SWITCH_REASON.LOCATION_MISSING);
  });

  it('refuses a shadowed order (DF-T09-7)', () => {
    const [checked] = applyClientChecks(
      [pickedRowOf(orderOf({ isShadowed: true }))],
      CONTEXT
    );
    assert.equal(checked.localReason, BULK_COMPANY_SWITCH_REASON.SHADOWED);
  });

  it('refuses a parked order (DF-T09-7)', () => {
    const [checked] = applyClientChecks(
      [pickedRowOf(orderOf({ parkedAt: '2026-10-25T10:00:00.000Z' }))],
      CONTEXT
    );
    assert.equal(checked.localReason, BULK_COMPANY_SWITCH_REASON.PARKED);
  });

  it('refuses an order locked by another employee without the bypass code (DF-T09-6)', () => {
    const [checked] = applyClientChecks(
      [pickedRowOf(orderOf({ lockedById: 99 }))],
      CONTEXT
    );
    assert.equal(checked.localReason, BULK_COMPANY_SWITCH_REASON.LOCKED_BY_OTHER);
  });

  it('allows a lock held by another employee when the caller has the bypass code', () => {
    const [checked] = applyClientChecks(
      [pickedRowOf(orderOf({ lockedById: 99 }))],
      { ...CONTEXT, canBypassLock: true }
    );
    assert.equal(checked.status, CHANGE_COMPANY_ROW_STATUS.READY);
  });

  it('skips the lock check when the caller id is not readable (UA-9)', () => {
    const [checked] = applyClientChecks(
      [pickedRowOf(orderOf({ lockedById: 99 }))],
      { ...CONTEXT, callerEmployeeId: null }
    );
    assert.equal(checked.status, CHANGE_COMPANY_ROW_STATUS.READY);
  });

  it('refuses every row when the target is not in the active list (DF-T09-8)', () => {
    const [checked] = applyClientChecks(
      [pickedRowOf(orderOf())],
      { ...CONTEXT, targetActive: false }
    );
    assert.equal(checked.localReason, BULK_COMPANY_SWITCH_REASON.TARGET_NOT_ACTIVE);
  });

  it('reports the first failing check in the table order', () => {
    const [checked] = applyClientChecks(
      [newRowOf(orderOf({ status: 'SHIPPING', isShadowed: true }))],
      CONTEXT
    );
    assert.equal(checked.localReason, BULK_COMPANY_SWITCH_REASON.STATUS_NOT_ALLOWED);
  });

  it('leaves rows that already ran untouched', () => {
    const done: ChangeCompanyRow = {
      ...pickedRowOf(orderOf({ status: 'SHIPPING' })),
      status: CHANGE_COMPANY_ROW_STATUS.DONE,
      result: responseOf(),
    };
    const [checked] = applyClientChecks([done], CONTEXT);
    assert.equal(checked, done);
  });
});

describe('snapshotOf', () => {
  it('takes the company from shippingCompanyRef', () => {
    const snapshot = snapshotOf(
      orderOf({
        shippingCompanyRef: {
          id: 3,
          name: 'Turbo',
        } as Order['shippingCompanyRef'],
      })
    );
    assert.deepEqual(snapshot, { companyId: 3, companyName: 'Turbo' });
  });

  it('returns nulls when the order has no company', () => {
    assert.deepEqual(snapshotOf(orderOf()), { companyId: null, companyName: null });
  });
});

describe('needsClearConfirm', () => {
  it('asks for no confirmation with no rows or with only ready rows', () => {
    assert.equal(needsClearConfirm([]), false);
    assert.equal(needsClearConfirm([pickedRowOf(orderOf())]), false);
  });

  it('asks for confirmation when a cancel-at-old-carrier row exists', () => {
    const cancelRow: ChangeCompanyRow = {
      ...pickedRowOf(orderOf()),
      status: CHANGE_COMPANY_ROW_STATUS.DONE,
      result: responseOf(),
    };
    assert.equal(needsClearConfirm([pickedRowOf(orderOf()), cancelRow]), true);
  });

  it('does not ask when the switch needs no cancel at the old carrier', () => {
    const plainRow: ChangeCompanyRow = {
      ...pickedRowOf(orderOf()),
      status: CHANGE_COMPANY_ROW_STATUS.DONE,
      result: responseOf({ cancelAtPreviousCarrier: false, previousShippingId: null }),
    };
    const updatedRow: ChangeCompanyRow = {
      ...pickedRowOf(orderOf({ id: 1002, code: '1002' })),
      status: CHANGE_COMPANY_ROW_STATUS.DONE,
      result: responseOf({ outcome: BULK_COMPANY_SWITCH_OUTCOME.UPDATED, cancelAtPreviousCarrier: true }),
    };
    assert.equal(needsClearConfirm([plainRow, updatedRow]), false);
  });
});
