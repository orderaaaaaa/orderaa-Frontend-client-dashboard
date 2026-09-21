'use client';

import { useState } from 'react';
import { LiaChevronDownSolid, LiaExclamationTriangleSolid } from 'react-icons/lia';
import {
  MISSING_ORDER_FAILURE_LABELS,
  MISSING_ORDER_STATUS_LABELS,
  INTERNAL_CLASS_FAILURE_CODES,
} from '@/constants/missingOrders';
import type { MissingOrderDetail } from '@/types/missing-orders';

const NOT_AVAILABLE = 'غير متوفر';

interface MissingOrderHeaderProps {
  row: MissingOrderDetail;
}

export function MissingOrderHeader({ row }: MissingOrderHeaderProps) {
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const isInternal = INTERNAL_CLASS_FAILURE_CODES.includes(row.failureCode);

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="block text-xs text-gray-500">اسم العميل</span>
            <span className="font-semibold">{row.customerName || NOT_AVAILABLE}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">رقم الهاتف</span>
            <span className="font-semibold">{row.phone || NOT_AVAILABLE}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">المصدر</span>
            <span className="font-semibold">{row.format ?? NOT_AVAILABLE}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">رقم الطلب الخارجي</span>
            <span className="font-semibold">{row.externalOrderId ?? NOT_AVAILABLE}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">سبب الفشل</span>
            <span className="font-semibold">{MISSING_ORDER_FAILURE_LABELS[row.failureCode]}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">عدد المحاولات</span>
            <span className="font-semibold">{row.failureCount}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">الحالة</span>
            <span className="font-semibold">{MISSING_ORDER_STATUS_LABELS[row.status]}</span>
          </div>
        </div>

        {isInternal && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <LiaExclamationTriangleSolid className="w-5 h-5 text-red-600 shrink-0" />
            <span className="text-sm text-red-700 font-medium">
              هذا خطأ داخلي. تواصل مع الدعم
            </span>
          </div>
        )}

        {row.diagnostic && (
          <div>
            <button
              type="button"
              onClick={() => setIsDiagnosticOpen((v) => !v)}
              className="flex items-center gap-1 text-sm font-semibold text-primary"
            >
              تفاصيل الخطأ
              <LiaChevronDownSolid
                className={`w-4 h-4 transition-transform ${isDiagnosticOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isDiagnosticOpen && (
              <p className="mt-2 text-xs text-gray-600 whitespace-pre-wrap break-words">
                {row.diagnostic}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
