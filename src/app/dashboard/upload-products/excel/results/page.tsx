'use client';

import React, { useEffect, useState } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { useRouter } from 'next/navigation';
import { UploadResult } from '@/types/excel-upload';
import type { BulkImportResponse, OrderCreationResult } from '@/lib/api/bulk-import';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

type StoredResults = UploadResult & {
  backendResponse?: BulkImportResponse;
  imported?: boolean;
};

interface RowProblem {
  rowIndex: number;
  messages: string[];
}

const ARABIC_PATTERN = /[؀-ۿ]/;

const SERVER_VALIDATION_MESSAGES: Record<string, string> = {
  'Full name is required': 'الاسم الكامل مطلوب',
  'Phone number is required': 'رقم الهاتف مطلوب',
  'Invalid phone number format': 'رقم الهاتف غير صحيح',
  'City is required for Orderaa format': 'المدينة مطلوبة في قالب Orderaa',
  'Address is required': 'العنوان مطلوب',
  'Valid shipping cost is required': 'تكلفة الشحن مطلوبة ويجب أن تكون رقماً صحيحاً',
  'At least one product is required': 'يجب إضافة منتج واحد على الأقل',
};

const ROW_ORDINALS = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
  'الحادي عشر',
  'الثاني عشر',
];

const rowLabel = (rowIndex: number) =>
  ROW_ORDINALS[rowIndex - 1] ?? `رقم ${rowIndex}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStoredResults = (value: unknown): value is StoredResults =>
  isRecord(value) &&
  typeof value.successCount === 'number' &&
  typeof value.errorCount === 'number' &&
  Array.isArray(value.invalidOrders);

const readStoredResults = (json: string): StoredResults | null => {
  try {
    const parsed: unknown = JSON.parse(json);
    return isStoredResults(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const failureMessages = (failure: OrderCreationResult): string[] => {
  if (failure.error === 'Validation failed' && failure.details) {
    return failure.details
      .split(', ')
      .map((message) => SERVER_VALIDATION_MESSAGES[message] ?? message);
  }
  if (failure.error && ARABIC_PATTERN.test(failure.error)) return [failure.error];
  return ['تعذر إنشاء هذا الطلب، راجع بياناته وحاول مرة أخرى'];
};

function RowProblems({ rows }: { rows: RowProblem[] }) {
  return (
    <ul className="flex flex-col gap-3 w-full">
      {rows.map((row) => (
        <li
          key={row.rowIndex}
          className="w-full rounded-lg border border-[#FF0004] bg-white"
        >
          <div className="flex items-start gap-2 px-3 py-2">
            <AlertCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-[#FF0004] [stroke-width:1.5px]" />
            <span className="min-w-0 break-words text-base sm:text-lg text-black">
              الطلب {row.rowIndex}: في الصف {rowLabel(row.rowIndex)} تم العثور على أخطاء
            </span>
          </div>
          <div className="bg-[#FF000408] px-3 py-2 text-sm leading-6 text-[#FF0004]">
            <p className="mb-1">نحتاج إلى بعض المساعدة، يرجى توضيح ما يلي:</p>
            <ul className="space-y-1 font-bold">
              {row.messages.map((message, index) => (
                <li key={index} className="break-words">
                  {message}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ValidationResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<StoredResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resultsJson = sessionStorage.getItem('excelValidationResults');
    setResults(resultsJson ? readStoredResults(resultsJson) : null);
    setLoading(false);
  }, []);

  const clearAndGo = (path: string) => {
    sessionStorage.removeItem('excelValidationResults');
    sessionStorage.removeItem('excelValidationOnly');
    router.push(path);
  };

  if (loading) {
    return <PageLoading message="جاري التحميل..." />;
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <p className="text-gray-600">لا توجد نتائج للعرض</p>
          <button
            type="button"
            onClick={() => clearAndGo('/dashboard/upload-products/excel')}
            className="mt-4 min-h-10 px-4 text-primary hover:underline"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const imported = !!results.imported;
  const backend = results.backendResponse?.data;
  const createdCount = imported ? backend?.successCount ?? 0 : results.successCount;
  const failedOrders = imported ? backend?.failedOrders ?? [] : [];
  const failedCount = imported
    ? backend?.failureCount ?? failedOrders.length
    : results.errorCount;

  const problems: RowProblem[] = imported
    ? failedOrders.map((failure) => ({
        rowIndex: failure.rowIndex,
        messages: failureMessages(failure),
      }))
    : results.invalidOrders.map((order) => ({
        rowIndex: order.rowIndex,
        messages: order.errors.map((error) => error.message),
      }));

  const newUploadButton = (
    <button
      type="button"
      onClick={() => clearAndGo('/dashboard/upload-products/excel')}
      className="flex min-h-10 items-center justify-center gap-2 px-6 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <ArrowRight className="w-5 h-5" />
      رفع ملف جديد
    </button>
  );

  const viewOrdersButton =
    imported && createdCount > 0 ? (
      <button
        type="button"
        onClick={() => clearAndGo('/dashboard/orders/allOrders')}
        className="min-h-10 px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#4a1db5] transition-colors"
      >
        عرض الطلبات ({createdCount})
      </button>
    ) : null;

  if (failedCount === 0) {
    return (
      <div className="w-full bg-gray-50 px-4 py-6 sm:p-6" dir="rtl">
        <div className="flex items-center justify-center py-6 sm:py-12">
          <div className="max-w-[656px] w-full text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 sm:p-8">
              <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                {imported ? 'تم إنشاء جميع الطلبات بنجاح!' : 'تم التحقق من جميع الطلبات بنجاح!'}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                {imported
                  ? `تم إنشاء ${createdCount} طلب في النظام`
                  : `جميع الـ ${results.successCount} طلب صالحة. ارفع الملف مرة أخرى لإنشائها`}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {newUploadButton}
                {viewOrdersButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 px-4 py-6 sm:p-6" dir="rtl">
      <div className="max-w-[656px] w-full">
        {!imported && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 text-blue-800">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                لم يتم إنشاء أي طلب. صحّح الصفوف التالية في الملف ثم ارفعه مرة أخرى.
              </span>
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="font-bold text-xl sm:text-[28px] leading-snug text-black">
            {imported ? 'نتيجة الرفع:' : 'نتيجة التحقق:'}
          </h2>
          <span className="inline-flex items-center gap-1 font-bold text-xl sm:text-[28px] leading-snug text-[#2DB742]">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 [stroke-width:2px]" />
            {imported ? `تم إنشاء ${createdCount} طلب` : `${results.successCount} طلب صالح`}
          </span>
        </div>

        <p role="alert" className="mb-6 text-lg font-semibold text-[#FF0004]">
          {imported
            ? `تعذر إنشاء ${failedCount} طلب`
            : `يوجد ${failedCount} طلبات بها أخطاء`}
        </p>

        <RowProblems rows={problems} />

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {newUploadButton}
          {viewOrdersButton}
        </div>
      </div>
    </div>
  );
}
