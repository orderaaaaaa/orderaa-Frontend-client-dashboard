'use client';

import React from 'react';
import clsx from 'clsx';
//TODO: Move this import after moving types
import { PrintStatus } from '../../print-orders/types';
import { LiaPrintSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

interface PrintStatusToggleProps {
  value: PrintStatus;
  onChange: (status: PrintStatus) => void;
  printedCount?: number;
  notPrintedCount?: number;
}

export function PrintStatusToggle({
  value,
  onChange,
  printedCount = 0,
  notPrintedCount = 0,
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
        <LiaPrintSolid className="size-4" />
        <span>طلبات تم طباعتها</span>
      </Button>

      <Button
        variant={value === 'not_printed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToggle('not_printed')}
        className={clsx(value !== 'not_printed' && 'text-gray-600')}
      >
        <span>طلبات لم يتم طباعتها</span>
      </Button>
    </div>
  );
}
