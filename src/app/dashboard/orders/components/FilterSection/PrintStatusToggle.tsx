'use client';

import React from 'react';
import clsx from 'clsx';
import { PrintStatus, PrintOrderStatistics } from '../../print-orders/types';
import { Button } from '@/components/ui/button';

interface PrintStatusToggleProps {
  value: PrintStatus;
  onChange: (status: PrintStatus) => void;
  printStatistics?: PrintOrderStatistics | null;
}

export function PrintStatusToggle({
  value,
  onChange,
  printStatistics,
}: PrintStatusToggleProps) {
  const handleToggle = (status: PrintStatus) => {
    if (value === status) {
      onChange(null);
    } else {
      onChange(status);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
      <Button
        variant={value === 'printed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToggle('printed')}
        className={clsx(value !== 'printed' && 'text-gray-600')}
      >
        <span>طلبات تم طباعتها</span>
        {printStatistics && (
          <span className="bg-primary rounded-full text-white px-1.5">{printStatistics.confirmedPrintedOrders}</span>
        )}
      </Button>

      <Button
        variant={value === 'not_printed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToggle('not_printed')}
        className={clsx(value !== 'not_printed' && 'text-gray-600')}
      >
        <span>طلبات لم يتم طباعتها</span>
        {printStatistics && (
          <span className="bg-primary rounded-full text-white px-1.5">{printStatistics.confirmedNotPrintedOrders}</span>
        )}
      </Button>
    </div>
  );
}
