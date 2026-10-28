'use client';

import { WarehouseSelect } from '@/components/stock/WarehouseSelect';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';

interface OperationsWarehousePickerProps {
  value: number | null;
  onChange(id: number): void;
}

export function OperationsWarehousePicker({ value, onChange }: OperationsWarehousePickerProps) {
  const canRead = useHasPermissionStrict(PERMISSION_CODES.WAREHOUSES_STOCK_READ);

  if (!canRead) {
    return <p className="text-sm text-muted-foreground">ليس لديك صلاحية عرض المخازن.</p>;
  }

  return (
    <WarehouseSelect value={value} onChange={onChange} placeholder="اختر المخزن" />
  );
}
