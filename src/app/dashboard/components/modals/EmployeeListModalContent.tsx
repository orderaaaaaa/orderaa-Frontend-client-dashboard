'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type {
  EmployeeModalData,
  EmployeePerformanceData,
  EmployeePerformanceMetric,
} from '../../types';

interface EmployeeListModalContentProps {
  data: EmployeeModalData[];
  performanceData?: Record<number, EmployeePerformanceData>;
}

const STATUS_CONFIG = {
  online: { label: 'نشط', dotColor: 'bg-green-500' },
  offline: { label: 'متوقف', dotColor: 'bg-gray-400' },
} as const;

const performanceColumns: DataTableColumn<EmployeePerformanceMetric>[] = [
  { key: 'label', header: 'النوع' },
  { key: 'count', header: 'العدد' },
  {
    key: 'percentage',
    header: 'النسبة',
    render: (value) => `${value}%`,
  },
];

export function EmployeeListModalContent({
  data,
  performanceData,
}: EmployeeListModalContentProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );

  const handleRowClick = (row: EmployeeModalData) => {
    if (selectedEmployeeId === row.id) {
      setSelectedEmployeeId(null);
    } else {
      setSelectedEmployeeId(row.id);
    }
  };

  const selectedPerformance = selectedEmployeeId
    ? performanceData?.[selectedEmployeeId]
    : null;

  const columns: DataTableColumn<EmployeeModalData>[] = [
    {
      key: 'name',
      header: 'الموظف',
      render: (value, row) => (
        <span
          className={clsx(
            selectedEmployeeId === row.id && 'font-bold text-primary',
          )}
        >
          {String(value ?? '')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحاله',
      render: (value) => {
        const status = value as 'online' | 'offline';
        const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
        return (
          <span className="flex items-center gap-2">
            <span className={clsx('w-2 h-2 rounded-full', config.dotColor)} />
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

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        headerClassName="bg-[#E5E5E5]"
        onRowClick={handleRowClick}
      />

      {selectedPerformance && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-primary">
            أداء الموظف: {selectedPerformance.employeeName}
          </h3>
          <DataTable
            columns={performanceColumns}
            data={selectedPerformance.metrics}
            keyField="id"
          />
        </div>
      )}
    </div>
  );
}
