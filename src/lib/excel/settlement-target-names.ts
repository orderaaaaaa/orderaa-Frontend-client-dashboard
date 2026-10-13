import type { SettlementRow } from '@/lib/api/settlement';

export type SettlementTarget = SettlementRow['targetStatus'];

interface SettlementTargetNames {
  label: string;
  names: readonly string[];
  shortCode: string;
}

export const SETTLEMENT_TARGET_NAMES: Record<SettlementTarget, SettlementTargetNames> = {
  COLLECTED: {
    label: 'تحصيل',
    names: ['تم التحصيل', 'تحصيل', 'تم التسليم', 'مسلم', 'مدفوع', 'collected', 'delivered', 'paid'],
    shortCode: '1',
  },
  RETURNED_SETTLED: {
    label: 'مرتجع',
    names: ['مرتجع', 'مرتجع تم التحصيل', 'راجع', 'returned', 'return'],
    shortCode: '2',
  },
};

export const SETTLEMENT_TARGETS = Object.keys(SETTLEMENT_TARGET_NAMES) as SettlementTarget[];

export function normalizeSettlementTargetText(value: string): string {
  return value
    .replace(/ـ/g, '')
    .replace(/[ً-ْٰ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function settlementTargetAcceptedNames(target: SettlementTarget): string[] {
  return [...SETTLEMENT_TARGET_NAMES[target].names, SETTLEMENT_TARGET_NAMES[target].shortCode];
}

const SETTLEMENT_TARGET_LOOKUP = new Map<string, SettlementTarget>(
  SETTLEMENT_TARGETS.flatMap((target) =>
    [target, ...settlementTargetAcceptedNames(target)].map(
      (alias): [string, SettlementTarget] => [normalizeSettlementTargetText(alias), target],
    ),
  ),
);

export function resolveSettlementTarget(value: unknown): SettlementTarget | null {
  const text = typeof value === 'number' && Number.isFinite(value) ? String(value) : value;
  if (typeof text !== 'string') return null;
  return SETTLEMENT_TARGET_LOOKUP.get(normalizeSettlementTargetText(text)) ?? null;
}

export function settlementAcceptedNamesSentence(): string {
  return SETTLEMENT_TARGETS.map(
    (target) => `${SETTLEMENT_TARGET_NAMES[target].label}: ${settlementTargetAcceptedNames(target).join('، ')}`,
  ).join(' — ');
}
