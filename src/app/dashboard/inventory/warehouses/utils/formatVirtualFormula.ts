import type {
  VirtualWarehouseTermSign,
  VirtualWarehouseTermView,
} from '@/lib/api/virtualWarehouses';
import { VIRTUAL_WAREHOUSE_TERM_KINDS } from '@/lib/api/virtualWarehouses';
import type { OrderStatus } from '@/types/orders';

type FormulaTerm = Pick<
  VirtualWarehouseTermView,
  'sign' | 'kind' | 'warehouseId' | 'rangeStart' | 'rangeEnd' | 'excludedStatuses'
> & { warehouseName?: string };

export const VIRTUAL_TERM_SIGN_SYMBOLS: Record<`${VirtualWarehouseTermSign}`, string> = {
  '1': '+',
  '-1': '−',
};

export function formatVirtualTerm(
  term: FormulaTerm,
  statusLabel: (status: OrderStatus) => string
): string {
  const sign = VIRTUAL_TERM_SIGN_SYMBOLS[`${term.sign}`];

  if (term.kind === VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE) {
    const name =
      term.warehouseName ??
      (term.warehouseId !== null ? `#${term.warehouseId}` : '');
    return `${sign} ${name}`.trim();
  }

  if (!term.rangeStart || !term.rangeEnd) return sign;

  const range = `${sign} الطلبات من ${statusLabel(term.rangeStart)} إلى ${statusLabel(term.rangeEnd)}`;
  if (term.excludedStatuses.length === 0) return range;

  const excluded = term.excludedStatuses.map(statusLabel).join('، ');
  return `${range} (عدا ${excluded})`;
}

export function formatVirtualFormula(
  terms: FormulaTerm[],
  statusLabel: (status: OrderStatus) => string
): string {
  return terms.map((term) => formatVirtualTerm(term, statusLabel)).join(' ');
}
