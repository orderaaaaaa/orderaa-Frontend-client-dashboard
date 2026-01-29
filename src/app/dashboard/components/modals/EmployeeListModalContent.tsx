'use client';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { EmployeeModalData } from '../../types';

interface EmployeeListModalContentProps {
  data: EmployeeModalData[];
}

const STATUS_CONFIG = {
  active: { label: 'نشط', dotColor: 'bg-green-500' },
  stopped: { label: 'متوقف', dotColor: 'bg-gray-400' },
} as const;

const columns: DataTableColumn<EmployeeModalData>[] = [
  {
    key: 'name',
    header: 'الموظف',
  },
  {
    key: 'status',
    header: 'الحاله',
    render: (value) => {
      const status = value as 'active' | 'stopped';
      const config = STATUS_CONFIG[status];
      return (
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          {config.label}
        </span>
      );
    },
  },
  {
    key: 'totalWorkHours',
    header: 'اجمالي ساعات العمل',
  },
  {
    key: 'attempts',
    header: 'المحاولات',
  },
];

export function EmployeeListModalContent({
  data,
}: EmployeeListModalContentProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="id"
      headerClassName="bg-[#E5E5E5]"
    />
  );
}
