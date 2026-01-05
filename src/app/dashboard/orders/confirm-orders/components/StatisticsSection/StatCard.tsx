import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
}

export function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white flex gap-4 rounded-lg py-5 px-4 items-center shadow-md border border-gray-100">
      <div className="flex items-center justify-center rounded-lg p-2 bg-primary/10">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-gray-600 text-sm block mb-1">{label}</span>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
