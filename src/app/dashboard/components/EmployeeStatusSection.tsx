'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { DataTable } from '@/components/ui/data-table';
import type { DataTableColumn } from '@/components/ui/data-table';
import BaseModal from '@/components/ui/base-modal';
import type { EmployeeStatusRow } from '../types';
import { useEmployeeActivityQuery } from '../services';
import { transformEmployeeActivity } from '../utils';
import { EmployeeStopDetailsModalContent } from './modals';

interface EmployeeStatusSectionProps {
  employees: EmployeeStatusRow[];
  isLoading: boolean;
}

const STATUS_CONFIG = {
  online: { label: 'نشط', dotColor: 'bg-green-500' },
  offline: { label: 'متوقف', dotColor: 'bg-gray-400' },
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
      const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
      return (
        <div className="flex items-center gap-2">
          <span className={clsx('w-2.5 h-2.5 rounded-full', config.dotColor)} />
          <span className="text-gray-700">{config.label}</span>
        </div>
      );
    },
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
      <DataTable
        columns={columns}
        data={employees as unknown as Record<string, unknown>[]}
        keyField="id"
        isLoading={isLoading}
        skeletonRows={4}
        onRowClick={handleRowClick}
      />

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
        />
      </BaseModal>
    </section>
  );
}
