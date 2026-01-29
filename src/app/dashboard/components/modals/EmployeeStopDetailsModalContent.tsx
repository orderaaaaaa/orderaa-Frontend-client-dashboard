'use client';

import clsx from 'clsx';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { SplineAreaChart } from '@/components/ui/charts/SplineAreaChart';
import type { EmployeeStopDetailData } from '../../types';
import type { EmployeeStopChartData } from '../../constants';

interface EmployeeStopDetailsModalContentProps {
  stopDetails: EmployeeStopDetailData;
  employeeName: string;
  chartData?: EmployeeStopChartData;
}

const STATUS_CONFIG = {
  active: { label: 'نشط', dotColor: 'bg-green-500' },
  stopped: { label: 'متوقف', dotColor: 'bg-gray-400' },
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
      const status = value as 'active' | 'stopped';
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
    key: 'stopTimes',
    header: 'زمن التوقف (من والي)',
    render: (value) => {
      const times = value as { from: string; to: string }[];
      return (
        <div className="flex flex-col">
          {times.map((time, idx) => (
            <div
              key={idx}
              className={clsx(
                'flex',
                idx < times.length - 1 && 'border-b border-gray-200',
              )}
            >
              <span className="flex-1 px-2 text-center">{time.from}</span>
              <span className="flex-1 px-2 text-center border-r border-gray-200">
                {time.to}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    key: 'totalStopToday',
    header: 'اجمالي التوقف اليوم',
  },
  {
    key: 'totalAttempts',
    header: 'اجمالي المحاولات',
  },
];

export function EmployeeStopDetailsModalContent({
  stopDetails,
  employeeName,
  chartData,
}: EmployeeStopDetailsModalContentProps) {
  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={[{ ...stopDetails, employeeName }]}
        keyField="id"
        headerClassName="bg-[#E5E5E5]"
      />
      {chartData && (
        <SplineAreaChart
          categories={chartData.categories}
          series={chartData.series}
          height={300}
        />
      )}
    </div>
  );
}
