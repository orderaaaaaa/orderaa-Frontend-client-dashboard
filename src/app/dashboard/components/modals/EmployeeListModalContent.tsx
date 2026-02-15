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
      <div className="bg-white rounded-lg border border-gray-100 shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E5E5E5]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 sm:px-4 sm:py-4 font-bold text-start border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => handleRowClick(row)}
                className={clsx(
                  'cursor-pointer border-b transition-colors',
                  selectedEmployeeId === row.id
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : 'hover:bg-gray-50',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-2 py-2 sm:px-4 sm:py-3 border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm"
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
