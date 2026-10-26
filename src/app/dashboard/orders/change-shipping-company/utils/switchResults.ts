import {
  BULK_COMPANY_SWITCH_OUTCOME,
  CHANGE_COMPANY_ROW_STATUS,
  type ChangeCompanyRow,
} from '../types/bulkCompanySwitch';
import {
  CHANGE_COMPANY_TEXT,
  localReasonTextOf,
  resultTextOf,
  unknownResultTextOf,
} from '../constants/changeCompany';
import { isCancelListRow } from './switchRows';

export function rowMessageOf(row: ChangeCompanyRow, targetName: string): string {
  const names = {
    newCarrier: row.result?.shippingCompany?.name ?? targetName,
    oldCarrier: row.result?.previousCompany?.name ?? row.snapshot.companyName ?? '',
  };
  if (row.result) return resultTextOf(row.result, names);
  if (row.status === CHANGE_COMPANY_ROW_STATUS.ERROR_UNKNOWN) return unknownResultTextOf(names);
  if (row.errorMessage) return row.errorMessage;
  if (row.localReason) return localReasonTextOf(row.localReason);
  return '';
}

export interface SwitchResultSections {
  switched: ChangeCompanyRow[];
  cancelOld: ChangeCompanyRow[];
  notSwitched: ChangeCompanyRow[];
  skipped: ChangeCompanyRow[];
}

export type SectionKey = keyof SwitchResultSections;

export function sectionOf(row: ChangeCompanyRow): SectionKey | null {
  if (isCancelListRow(row)) return 'cancelOld';
  switch (row.status) {
    case CHANGE_COMPANY_ROW_STATUS.DONE: {
      const outcome = row.result?.outcome;
      if (
        outcome === BULK_COMPANY_SWITCH_OUTCOME.SWITCHED ||
        outcome === BULK_COMPANY_SWITCH_OUTCOME.UPDATED
      ) {
        return 'switched';
      }
      if (outcome === BULK_COMPANY_SWITCH_OUTCOME.NOT_SWITCHED) return 'notSwitched';
      if (outcome === BULK_COMPANY_SWITCH_OUTCOME.SKIPPED) return 'skipped';
      return null;
    }
    case CHANGE_COMPANY_ROW_STATUS.ERROR:
    case CHANGE_COMPANY_ROW_STATUS.ERROR_UNKNOWN:
      return 'notSwitched';
    case CHANGE_COMPANY_ROW_STATUS.SKIPPED:
    case CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL:
      return 'skipped';
    default:
      return null;
  }
}

export function resultSectionsOf(rows: ChangeCompanyRow[]): SwitchResultSections {
  const sections: SwitchResultSections = {
    switched: [],
    cancelOld: [],
    notSwitched: [],
    skipped: [],
  };
  for (const row of rows) {
    const key = sectionOf(row);
    if (key !== null) sections[key].push(row);
  }
  return sections;
}

export const SECTION_TITLES: Record<SectionKey, string> = {
  switched: CHANGE_COMPANY_TEXT.resultSwitched,
  cancelOld: CHANGE_COMPANY_TEXT.resultCancelOld,
  notSwitched: CHANGE_COMPANY_TEXT.resultNotSwitched,
  skipped: CHANGE_COMPANY_TEXT.resultSkipped,
};

export const SECTION_ORDER: SectionKey[] = ['switched', 'cancelOld', 'notSwitched', 'skipped'];
