'use client';

import Link from 'next/link';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import type { ProviderShipment } from '@/types/shippingProviders';
import { formatDate, formatNumber } from './formatNumber';

interface ShipmentsTableProps {
  shipments: ProviderShipment[];
}

export function ShipmentsTable({ shipments }: ShipmentsTableProps) {
  const { getStatusLabel } = useStatusLabel();

  return (
    <table className="w-full text-sm" dir="rtl">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className="text-right py-2 px-3 font-semibold text-gray-700">الكود</th>
          <th className="text-right py-2 px-3 font-semibold text-gray-700">تاريخ الاستلام</th>
          <th className="text-right py-2 px-3 font-semibold text-gray-700">الحالة</th>
          <th className="text-right py-2 px-3 font-semibold text-gray-700">المحافظة</th>
          <th className="text-right py-2 px-3 font-semibold text-gray-700">المنطقة</th>
          <th className="text-right py-2 px-3 font-semibold text-gray-700">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((s) => (
          <tr key={s.id} className="border-b border-gray-100">
            <td className="py-2 px-3 font-medium text-gray-900">
              <Link href={`/dashboard/orders/${s.id}`} className="text-primary hover:underline">
                {s.code}
              </Link>
            </td>
            <td className="py-2 px-3 text-gray-600">
              {formatDate(s.takenAt)}
            </td>
            <td className="py-2 px-3 text-gray-600">{getStatusLabel(s.status)}</td>
            <td className="py-2 px-3 text-gray-600">{s.governorate ?? '—'}</td>
            <td className="py-2 px-3 text-gray-600">{s.city ?? '—'}</td>
            <td className="py-2 px-3 text-gray-600">
              {s.totalCost === null ? '—' : `${formatNumber(s.totalCost, 2)} جنيه`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
