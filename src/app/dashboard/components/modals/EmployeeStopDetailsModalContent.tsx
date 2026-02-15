'use client';

import clsx from 'clsx';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { SplineAreaChart } from '@/components/ui/charts/SplineAreaChart';
import type { EmployeeStopDetailData } from '../../types';

interface EmployeeStopDetailsModalContentProps {
  activityData?: EmployeeStopDetailData;
  isLoading: boolean;
}

const STATUS_CONFIG = {
  online: { label: 'نشط', dotColor: 'bg-green-500' },
  offline: { label: 'متوقف', dotColor: 'bg-gray-400' },
} as const;

const columns: DataTableColumn<Record<string, unknown>>[] = [
  {
    key: 'employeeName',
    header: 'الموظف',
    className: 'font-medium',
  },
  {
    key: 'status',
    header: 'الحاله',
    render: (value) => {
      const status = value as 'online' | 'offline';
      const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
      return (
        <div className="flex items-center gap-2">
          <span className={clsx('w-2.5 h-2.5 rounded-full', config.dotColor)} />
          <span>{config.label}</span>
        </div>
      );
    },
  },
  {
    key: 'totalWorkingHours',
    header: 'ساعات العمل',
  },
  {
    key: 'totalPausesInDay',
    header: 'عدد التوقفات',
  },
  {
    key: 'totalPauseTime',
    header: 'إجمالي وقت التوقف',
  },
  {
    key: 'totalCallCenterActions',
    header: 'إجمالي المحاولات',
  },
];

export function EmployeeStopDetailsModalContent({
  activityData,
  isLoading,
}: EmployeeStopDetailsModalContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={[]}
          keyField="id"
          headerClassName="bg-[#E5E5E5]"
          isLoading
          skeletonRows={1}
        />
        <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        لا توجد بيانات متاحة
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={[activityData]}
        keyField="id"
        headerClassName="bg-[#E5E5E5]"
      />
      <SplineAreaChart
        categories={activityData.chartCategories}
        series={activityData.chartSeries}
        height={300}
      />
    </div>
  );
}
