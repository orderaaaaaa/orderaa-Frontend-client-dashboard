'use client';

import React from 'react';
import { PrintStatus } from '../../types';
import { LiaPrintSolid } from 'react-icons/lia';

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
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
      <button
        type="button"
        onClick={() => handleToggle('printed')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          value === 'printed'
            ? 'bg-primary text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <LiaPrintSolid className="w-4 h-4" />
        <span>طلبات تم طباعتها</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            value === 'printed'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {printedCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleToggle('not_printed')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          value === 'not_printed'
            ? 'bg-primary text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span>طلبات لم يتم طباعتها</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            value === 'not_printed'
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {notPrintedCount}
        </span>
      </button>
    </div>
  );
}
