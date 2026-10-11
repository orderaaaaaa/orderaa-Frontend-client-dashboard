import type { WarehouseSummaryCard } from '@/lib/api/warehouses';
import type { VirtualWarehouseSummaryCard } from '@/lib/api/virtualWarehouses';
import { STOCK_SCOPE_KINDS } from '../constants';

export type ScopeEntry =
  | { kind: typeof STOCK_SCOPE_KINDS.PHYSICAL; card: WarehouseSummaryCard }
  | { kind: typeof STOCK_SCOPE_KINDS.VIRTUAL; card: VirtualWarehouseSummaryCard };

const kindRank = (entry: ScopeEntry) =>
  entry.kind === STOCK_SCOPE_KINDS.PHYSICAL ? 0 : 1;

export function sortScopeEntries(
  physical: WarehouseSummaryCard[],
  virtual: VirtualWarehouseSummaryCard[]
): ScopeEntry[] {
  const entries: ScopeEntry[] = [
    ...physical.map(
      (card): ScopeEntry => ({ kind: STOCK_SCOPE_KINDS.PHYSICAL, card })
    ),
    ...virtual.map(
      (card): ScopeEntry => ({ kind: STOCK_SCOPE_KINDS.VIRTUAL, card })
    ),
  ];
  return entries.sort((a, b) => {
    const posA = a.card.displayPosition ?? Infinity;
    const posB = b.card.displayPosition ?? Infinity;
    if (posA !== posB) return posA < posB ? -1 : 1;
    const rank = kindRank(a) - kindRank(b);
    if (rank !== 0) return rank;
    return a.card.id - b.card.id;
  });
}

export function resolveParentNames(entries: ScopeEntry[]): Map<number, string> {
  const namesById = new Map<number, string>();
  for (const entry of entries) {
    if (entry.kind === STOCK_SCOPE_KINDS.PHYSICAL) {
      namesById.set(entry.card.id, entry.card.name);
    }
  }
  const parentNames = new Map<number, string>();
  for (const entry of entries) {
    if (
      entry.kind === STOCK_SCOPE_KINDS.PHYSICAL &&
      entry.card.parentWarehouseId !== null
    ) {
      const parentName = namesById.get(entry.card.parentWarehouseId);
      if (parentName) parentNames.set(entry.card.id, parentName);
    }
  }
  return parentNames;
}
