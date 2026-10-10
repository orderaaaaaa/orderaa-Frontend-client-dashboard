import React from 'react';

export const EMPTY_VALUE = '—';

export const formatDetailValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return JSON.stringify(value);
};

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">{children}</dl>;
}

export function DetailField({
  label,
  children,
  ltr = false,
}: {
  label: string;
  children: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-[#1F1F1F] break-words" dir={ltr ? 'ltr' : undefined}>
        {children}
      </dd>
    </div>
  );
}
