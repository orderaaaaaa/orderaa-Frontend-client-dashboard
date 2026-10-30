import { useState } from 'react';
import {
  LOCATION_SOURCES,
  type LocationSource,
  type SourceGroup,
  type SourceRow,
} from '@/types/canonicalNames';
import {
  initialSuggestionPicks,
  unlinkedRowsOf,
  type SourceCandidates,
  type SuggestionTarget,
} from './locationSuggestions';

export type SourcePicks = Partial<Record<LocationSource, number>>;

const SOURCE_ORDER = Object.values(LOCATION_SOURCES);

const candidatesOf = (rows: SourceRow[]): SourceCandidates[] =>
  SOURCE_ORDER.map((source) => ({
    source,
    rows: rows.filter((row) => row.source === source),
  })).filter((candidates) => candidates.rows.length > 0);

export function prePickFor(group: SourceGroup): SourcePicks {
  const target: SuggestionTarget = {
    key: 'group',
    name: group.normalizedText,
    scopeId: group.scopeId,
    target: {},
    sources: candidatesOf(unlinkedRowsOf(group)),
  };
  return initialSuggestionPicks([target]).group ?? {};
}

export function togglePick(picks: SourcePicks, row: SourceRow, checked: boolean): SourcePicks {
  const next: SourcePicks = { ...picks };
  if (checked) {
    next[row.source] = row.id;
  } else if (next[row.source] === row.id) {
    delete next[row.source];
  }
  return next;
}

export function pickedRowIds(picks: SourcePicks): number[] {
  return SOURCE_ORDER.map((source) => picks[source]).filter(
    (id): id is number => id !== undefined,
  );
}

export function useLocationPicks(group: SourceGroup) {
  const [manual, setManual] = useState<SourcePicks | null>(null);
  const picks = manual ?? prePickFor(group);
  return {
    picks,
    isPrePicked: manual === null && pickedRowIds(picks).length > 0,
    rowIds: pickedRowIds(picks),
    togglePick: (row: SourceRow, checked: boolean) => setManual(togglePick(picks, row, checked)),
    clearPicks: () => setManual({}),
  };
}
