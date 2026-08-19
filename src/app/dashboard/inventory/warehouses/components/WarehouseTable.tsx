'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LiaBoxesSolid, LiaEditSolid, LiaTrashSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import type { WarehouseApiItem } from '@/lib/api/warehouses';

interface WarehouseTableProps {
  warehouses: WarehouseApiItem[];
  onEdit: (warehouse: WarehouseApiItem) => void;
  onDelete: (warehouse: WarehouseApiItem) => void;
}

interface WarehouseRow {
  warehouse: WarehouseApiItem;
  isChild: boolean;
}

const buildRows = (warehouses: WarehouseApiItem[]): WarehouseRow[] => {
  const roots = warehouses.filter((w) => w.parentWarehouseId === null);
  const rows: WarehouseRow[] = [];

  roots.forEach((root) => {
    rows.push({ warehouse: root, isChild: false });
    (root.children ?? []).forEach((child) => {
      rows.push({ warehouse: child, isChild: true });
    });
  });

  // Children whose parent is not in the current page still deserve a row.
  const rendered = new Set(rows.map((row) => row.warehouse.id));
  warehouses.forEach((warehouse) => {
    if (!rendered.has(warehouse.id)) {
      rows.push({ warehouse, isChild: warehouse.parentWarehouseId !== null });
    }
  });

  return rows;
};

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

export function WarehouseTable({
  warehouses,
  onEdit,
  onDelete,
}: WarehouseTableProps) {
  const router = useRouter();
  const rows = useMemo(() => buildRows(warehouses), [warehouses]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" dir="rtl">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="py-3 px-4 text-right font-semibold text-gray-700">
              الاسم
            </th>
            <th className="py-3 px-4 text-right font-semibold text-gray-700">
              العنوان
            </th>
            <th className="py-3 px-4 text-right font-semibold text-gray-700">
              النوع
            </th>
            <th className="py-3 px-4 text-right font-semibold text-gray-700">
              الحالة
            </th>
            <th className="py-3 px-4 text-right font-semibold text-gray-700">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ warehouse, isChild }) => (
            <tr
              key={warehouse.id}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
            >
              <td className="py-2.5 px-4 font-medium text-gray-900">
                <span className={isChild ? 'pr-6 text-gray-600' : ''}>
                  {isChild ? `— ${warehouse.name}` : warehouse.name}
                </span>
              </td>
              <td className="py-2.5 px-4 text-gray-600">
                {warehouse.address || '—'}
              </td>
              <td className="py-2.5 px-4">
                {isChild ? (
                  <Badge className="bg-gray-100 text-gray-600">مخزن فرعي</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700">
                    مخزن رئيسي
                  </Badge>
                )}
              </td>
              <td className="py-2.5 px-4">
                {warehouse.isActive ? (
                  <Badge className="bg-green-100 text-green-700">نشط</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">موقوف</Badge>
                )}
              </td>
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/dashboard/inventory/warehouses/${warehouse.id}`
                      )
                    }
                  >
                    <LiaBoxesSolid className="ml-1 size-4" />
                    عرض المخزون
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(warehouse)}
                  >
                    <LiaEditSolid className="ml-1 size-4" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(warehouse)}
                  >
                    <LiaTrashSolid className="ml-1 size-4" />
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
