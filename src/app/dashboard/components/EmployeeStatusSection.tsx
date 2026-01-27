'use client';

import clsx from 'clsx';
import { DataTable } from '@/components/ui/data-table';
import type { DataTableColumn } from '@/components/ui/data-table';
import type { EmployeeStatusRow } from '../types';

interface EmployeeStatusSectionProps {
  employees: EmployeeStatusRow[];
  isLoading: boolean;
}

const STATUS_CONFIG = {
  active: { label: 'نشط', dotColor: 'bg-green-500' },
  stopped: { label: 'متوقف', dotColor: 'bg-gray-400' },
} as const;

const columns: DataTableColumn<Record<string, unknown>>[] = [
  {
    key: 'name',
    header: 'اسم الموظف',
    className: 'font-medium text-gray-900',
  },
  {
    key: 'status',
    header: 'حالة الموظف',
    render: (value) => {
      const status = value as EmployeeStatusRow['status'];
      const config = STATUS_CONFIG[status];
      return (
        <div className="flex items-center gap-2">
          <span className={clsx('w-2.5 h-2.5 rounded-full', config.dotColor)} />
          <span className="text-gray-700">{config.label}</span>
        </div>
      );
    },
  },
  {
    key: 'lastInactivityDuration',
    header: 'مدة آخر توقف',
    className: 'text-gray-600',
  },
  {
    key: 'totalInactivityToday',
    header: 'إجمالي عدد التوقفات لليوم',
    className: 'text-gray-600',
  },
  {
    key: 'totalAttempts',
    header: 'إجمالي المحاولات',
    className: 'font-medium text-gray-900',
  },
];

export function EmployeeStatusSection({
  employees,
  isLoading,
}: EmployeeStatusSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">حالة الموظفين</h2>
      <DataTable
        columns={columns}
        data={employees as unknown as Record<string, unknown>[]}
        keyField="id"
        isLoading={isLoading}
        skeletonRows={4}
      />
    </section>
  );
}
