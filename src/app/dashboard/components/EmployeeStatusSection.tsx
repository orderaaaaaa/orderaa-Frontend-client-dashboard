'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { DataTable } from '@/components/ui/data-table';
import type { DataTableColumn } from '@/components/ui/data-table';
import BaseModal from '@/components/ui/base-modal';
import { ErrorState } from '@/components/ui/state-panels';
import type { QuerySectionState } from '../hooks';
import type { EmployeeStatusRow } from '../types';
import { useEmployeeActivityQuery } from '../services';
import { transformEmployeeActivity } from '../utils';
import { EmployeeStopDetailsModalContent } from './modals';

interface EmployeeStatusSectionProps {
  employees: EmployeeStatusRow[];
  isLoading: boolean;
  error?: QuerySectionState;
}

const STATUS_CONFIG = {
  online: { label: 'نشط', dotColor: 'bg-green-500' },
  offline: { label: 'متوقف', dotColor: 'bg-gray-400' },
} as const;

function EmployeeStatusBadge({ status }: { status: EmployeeStatusRow['status'] }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-2.5 h-2.5 rounded-full', config.dotColor)} />
      <span className="text-gray-700">{config.label}</span>
    </div>
  );
}

function renderEmployeeMobileRow(row: Record<string, unknown>) {
  const employee = row as unknown as EmployeeStatusRow;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 break-words font-medium text-gray-900">
          {employee.name}
        </span>
        <EmployeeStatusBadge status={employee.status} />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <div className="min-w-0">
          <dt className="text-gray-500">وقت التوقف</dt>
          <dd className="mt-0.5 text-sm font-medium text-gray-700">
            {employee.totalPauseTime}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-gray-500">عدد التوقفات</dt>
          <dd className="mt-0.5 text-sm font-medium text-gray-700">
            {employee.totalPausesInDay}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-gray-500">المحاولات</dt>
          <dd className="mt-0.5 text-sm font-medium text-gray-900">
            {employee.totalCallCenterActions}
          </dd>
        </div>
      </dl>
    </div>
  );
}

const columns: DataTableColumn<Record<string, unknown>>[] = [
  {
    key: 'name',
    header: 'اسم الموظف',
    className: 'font-medium text-gray-900',
  },
  {
    key: 'status',
    header: 'حالة الموظف',
    render: (value) => (
      <EmployeeStatusBadge status={value as EmployeeStatusRow['status']} />
    ),
  },
  {
    key: 'totalPauseTime',
    header: 'إجمالي وقت التوقف',
    className: 'text-gray-600',
  },
  {
    key: 'totalPausesInDay',
    header: 'إجمالي عدد التوقفات لليوم',
    className: 'text-gray-600',
  },
  {
    key: 'totalCallCenterActions',
    header: 'إجمالي المحاولات',
    className: 'font-medium text-gray-900',
  },
];

export function EmployeeStatusSection({
  employees,
  isLoading,
  error,
}: EmployeeStatusSectionProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');

  const activityQuery = useEmployeeActivityQuery(selectedEmployeeId);

  const activityData = useMemo(
    () =>
      activityQuery.data
        ? transformEmployeeActivity(activityQuery.data)
        : undefined,
    [activityQuery.data],
  );

  const handleRowClick = (row: Record<string, unknown>) => {
    const employee = row as unknown as EmployeeStatusRow;
    setSelectedEmployeeId(employee.id);
    setSelectedEmployeeName(employee.name);
  };

  const closeModal = () => {
    setSelectedEmployeeId(null);
    setSelectedEmployeeName('');
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">حالة الموظفين</h2>
      {error?.isError ? (
        <ErrorState
          error={error.error}
          fallback="تعذّر تحميل حالة الموظفين"
          onRetry={error.refetch}
        />
      ) : (
        <DataTable
          columns={columns}
          data={employees as unknown as Record<string, unknown>[]}
          keyField="id"
          isLoading={isLoading}
          skeletonRows={4}
          onRowClick={handleRowClick}
          renderMobileRow={renderEmployeeMobileRow}
        />
      )}

      <BaseModal
        isOpen={selectedEmployeeId !== null}
        onClose={closeModal}
        title={`تفاصيل توقف ${selectedEmployeeName}`}
        showFooter={false}
        maxWidth="md:max-w-[900px]"
      >
        <EmployeeStopDetailsModalContent
          activityData={activityData}
          isLoading={activityQuery.isLoading}
          error={activityQuery.isError ? activityQuery.error : null}
          onRetry={() => {
            activityQuery.refetch();
          }}
        />
      </BaseModal>
    </section>
  );
}
