import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  desc?: string;
  subtitle?: string;
}

export function StatCard({ icon, label, value, desc, subtitle }: StatCardProps) {
  return (
    <div className="bg-white flex gap-4 rounded-lg py-5 px-4 items-start shadow-md border border-gray-100">
      {icon}
      <div className="flex flex-col">
        <span className="text-[#000000]/60 text-sm block mb-1">{label}</span>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {desc && (
          <span className="text-[#000000]/60 text-sm">{desc}</span>
        )}
        {subtitle && (
          <div className="text-xs text-[#000000]/60 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
