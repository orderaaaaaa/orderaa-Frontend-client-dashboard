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
        rowClassName={(row) =>
          row.id === selectedEmployeeId ? 'bg-primary/5' : undefined
        }
        renderMobileRow={(row) => {
          const config = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.offline;
          const isSelected = selectedEmployeeId === row.id;
          return (
            <div className="flex flex-col gap-2" aria-current={isSelected || undefined}>
              <div className="flex items-start justify-between gap-3">
                <span
                  className={clsx(
                    'min-w-0 break-words font-medium',
                    isSelected && 'font-bold text-primary',
                  )}
                >
                  {row.name}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-gray-700">
                  <span className={clsx('w-2 h-2 rounded-full', config.dotColor)} />
                  {config.label}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-gray-500">اجمالي ساعات العمل</dt>
                  <dd className="mt-0.5 text-sm font-medium">{row.totalWorkHours}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">المحاولات</dt>
                  <dd className="mt-0.5 text-sm font-medium">{row.attempts}</dd>
                </div>
              </dl>
            </div>
          );
        }}
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
            renderMobileRow={(metric) => (
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 break-words font-medium">{metric.label}</span>
                <span className="shrink-0 text-gray-700">
                  {metric.count} · {metric.percentage}%
                </span>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
