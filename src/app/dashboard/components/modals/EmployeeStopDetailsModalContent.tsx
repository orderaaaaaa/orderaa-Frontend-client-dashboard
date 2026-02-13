'use client';

import clsx from 'clsx';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { SplineAreaChart } from '@/components/ui/charts/SplineAreaChart';
import type { EmployeeStopDetailData } from '../../types';

const PLACEHOLDER_CHART_CATEGORIES = [
  '9 ص', '10 ص', '11 ص', '12 م', '1 م', '2 م', '3 م', '4 م',
];

const PLACEHOLDER_CHART_SERIES = [
  { name: 'مدة التوقف (دقيقة)', data: [0, 0, 0, 0, 0, 0, 0, 0] },
];

interface EmployeeStopDetailsModalContentProps {
  stopDetails: EmployeeStopDetailData;
  employeeName: string;
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
      const config = STATUS_CONFIG[status];
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
  stopDetails,
  employeeName,
}: EmployeeStopDetailsModalContentProps) {
  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={[{ ...stopDetails, employeeName }]}
        keyField="id"
        headerClassName="bg-[#E5E5E5]"
      />
      <SplineAreaChart
        categories={PLACEHOLDER_CHART_CATEGORIES}
        series={PLACEHOLDER_CHART_SERIES}
        height={300}
      />
    </div>
  );
}
