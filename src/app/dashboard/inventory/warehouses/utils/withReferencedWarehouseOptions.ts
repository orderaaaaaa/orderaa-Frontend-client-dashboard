import type { WarehouseRef } from '@/lib/api/warehouses';
import type { WarehouseOption } from '@/services/warehouses';

export function withReferencedWarehouseOptions(
  options: WarehouseOption[],
  refs: (WarehouseRef | null | undefined)[]
): WarehouseOption[] {
  const known = new Set(options.map((option) => option.key));
  const extra: WarehouseOption[] = [];

  refs.forEach((ref) => {
    if (!ref) return;
    const key = String(ref.id);
    if (known.has(key)) return;
    known.add(key);
    extra.push({ key, value: ref.name });
  });

  return extra.length === 0 ? options : [...options, ...extra];
}
