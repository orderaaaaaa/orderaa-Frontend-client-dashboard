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
import { newRowOf } from '../hooks/useChangeCompanyRows';
import { resultSectionsOf } from './SwitchResultPanel';

function rowOf(id: number, status: ChangeCompanyRow['status'], result: BulkCompanySwitchResponse | null = null): ChangeCompanyRow {
  const order = { id, code: String(id), status: 'CONFIRMED', customers: { id: 1, name: 'C', phone_numbers: ['0100'] } } as Order;
  return { ...newRowOf(order), status, result };
}

function responseOf(outcome: BulkCompanySwitchResponse['outcome'], overrides: Partial<BulkCompanySwitchResponse> = {}): BulkCompanySwitchResponse {
  return {
    orderId: 1,
    code: '1',
    outcome,
    reason: BULK_COMPANY_SWITCH_REASON.LOCAL_SWITCH,
    message: 'ok',
    shippingCompany: null,
    previousCompany: null,
    shippingId: null,
    previousShippingId: null,
    cancelAtPreviousCarrier: false,
    openMarkerId: null,
    skipRowCode: null,
    carrierSend: null,
    ...overrides,
  };
}

describe('resultSectionsOf', () => {
  it('places each row in exactly one section', () => {
    const rows = [
      rowOf(1, CHANGE_COMPANY_ROW_STATUS.DONE, responseOf(BULK_COMPANY_SWITCH_OUTCOME.SWITCHED)),
      rowOf(2, CHANGE_COMPANY_ROW_STATUS.DONE, responseOf(BULK_COMPANY_SWITCH_OUTCOME.SWITCHED, { cancelAtPreviousCarrier: true, previousShippingId: '9' })),
      rowOf(3, CHANGE_COMPANY_ROW_STATUS.DONE, responseOf(BULK_COMPANY_SWITCH_OUTCOME.UPDATED)),
      rowOf(4, CHANGE_COMPANY_ROW_STATUS.DONE, responseOf(BULK_COMPANY_SWITCH_OUTCOME.NOT_SWITCHED, { reason: BULK_COMPANY_SWITCH_REASON.CARRIER_REJECTED })),
      rowOf(5, CHANGE_COMPANY_ROW_STATUS.ERROR),
      rowOf(6, CHANGE_COMPANY_ROW_STATUS.ERROR_UNKNOWN),
      rowOf(7, CHANGE_COMPANY_ROW_STATUS.SKIPPED),
      rowOf(8, CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL),
      rowOf(9, CHANGE_COMPANY_ROW_STATUS.READY),
    ];
    const sections = resultSectionsOf(rows);
    const placed = [...sections.switched, ...sections.cancelOld, ...sections.notSwitched, ...sections.skipped];
    assert.equal(placed.length, 8);
    assert.deepEqual(sections.switched.map((row) => row.order.id), [1, 3]);
    assert.deepEqual(sections.cancelOld.map((row) => row.order.id), [2]);
    assert.deepEqual(sections.notSwitched.map((row) => row.order.id), [4, 5, 6]);
    assert.deepEqual(sections.skipped.map((row) => row.order.id), [7, 8]);
  });

  it('puts an unknown outcome in the not-switched section', () => {
    const rows = [rowOf(6, CHANGE_COMPANY_ROW_STATUS.ERROR_UNKNOWN)];
    assert.deepEqual(resultSectionsOf(rows).notSwitched.map((row) => row.order.id), [6]);
  });

  it('puts a SKIPPED response with STATE_CHANGED in the skipped section, not the not-switched one', () => {
    const rows = [
      rowOf(10, CHANGE_COMPANY_ROW_STATUS.DONE, responseOf(BULK_COMPANY_SWITCH_OUTCOME.SKIPPED, { reason: BULK_COMPANY_SWITCH_REASON.STATE_CHANGED })),
    ];
    const sections = resultSectionsOf(rows);
    assert.deepEqual(sections.skipped.map((row) => row.order.id), [10]);
    assert.equal(sections.notSwitched.length, 0);
  });
});
