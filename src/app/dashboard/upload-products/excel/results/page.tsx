'use client';

import React, { useEffect, useState } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { useRouter } from 'next/navigation';
import type {
  BulkImportMissingRow,
  BulkImportResponse,
  OrderCreationResult,
} from '@/lib/api/bulk-import';
import { carrierSendNeedsAttention } from '@/utils/manualOrder/carrierSend';
import {
  CREATED_ORDER_COUNT_FORMS,
  formatArabicCount,
  type ArabicCountForms,
} from '@/utils/arabicCount';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

type StoredResults = {
  backendResponse: BulkImportResponse;
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

const MISSING_ORDER_COUNT_FORMS: ArabicCountForms = {
  one: 'طلب واحد',
  two: 'طلبان',
  few: 'طلبات',
  many: 'طلبًا',
  singular: 'طلب',
};

const rowLabel = (rowIndex: number) =>
  ROW_ORDINALS[rowIndex - 1] ?? `رقم ${rowIndex}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStoredResults = (value: unknown): value is StoredResults =>
  isRecord(value) && isRecord(value.backendResponse) && isRecord(value.backendResponse.data);

const readStoredResults = (json: string): StoredResults | null => {
  try {
    const parsed: unknown = JSON.parse(json);
    return isStoredResults(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const missingRowText = (row: BulkImportMissingRow): string => {
  if (row.reasons.length === 0) {
    return row.status === 'already_missing'
      ? `الطلب ${row.rowIndex}: موجود بالفعل في قائمة المفقودات`
      : `الطلب ${row.rowIndex}: تم نقله إلى قائمة المفقودات`;
  }
  const reasons = row.reasons.join(' · ');
  return row.status === 'already_missing'
    ? `الطلب ${row.rowIndex}: ${reasons} (موجود بالفعل في قائمة المفقودات)`
    : `الطلب ${row.rowIndex}: ${reasons}`;
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
          className="w-full rounded-lg border border-[#FF0004] dark:border-danger-border bg-card"
        >
          <div className="flex items-start gap-2 px-3 py-2">
            <AlertCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-[#FF0004] dark:text-danger-text [stroke-width:1.5px]" />
            <span className="min-w-0 break-words text-base sm:text-lg text-foreground">
              الطلب {row.rowIndex}: في الصف {rowLabel(row.rowIndex)} تم العثور على أخطاء
            </span>
          </div>
          <div className="bg-red-500/5 px-3 py-2 text-sm leading-6 text-[#FF0004] dark:text-danger-text">
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
            className="mt-4 min-h-10 px-4 text-primary-text hover:underline"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const backend = results.backendResponse.data;
  const createdCount = backend.successCount;
  const failedOrders = backend.failedOrders;
  const missingRows = backend.missingRows;
  const missingCount = backend.missingCount > 0 ? backend.missingCount : missingRows.length;
  const failedCount = backend.failureCount;
  const carrierUnsentCount = backend.createdOrders.filter((order) =>
    carrierSendNeedsAttention(order.carrierSend)
  ).length;
  const carrierUnsentLine =
    carrierUnsentCount > 0 ? (
      <p className="font-semibold text-amber-700">
        {`عدد الطلبات التي لم يتم تأكيد إرسالها إلى شركة الشحن: ${carrierUnsentCount}`}
      </p>
    ) : null;

  const problems: RowProblem[] = failedOrders.map((failure) => ({
    rowIndex: failure.rowIndex,
    messages: failureMessages(failure),
  }));

  const newUploadButton = (
    <button
      type="button"
      onClick={() => clearAndGo('/dashboard/upload-products/excel')}
      className="flex min-h-10 items-center justify-center gap-2 px-6 py-2 bg-card border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <ArrowRight className="w-5 h-5" />
      رفع ملف جديد
    </button>
  );

  const viewOrdersButton =
    createdCount > 0 ? (
      <button
        type="button"
        onClick={() => clearAndGo('/dashboard/orders/allOrders')}
        className="min-h-10 px-6 py-2 bg-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
      >
        عرض الطلبات ({createdCount})
      </button>
    ) : null;

  if (failedCount === 0 && missingRows.length === 0 && createdCount > 0) {
    return (
      <div className="w-full bg-card px-4 py-6 sm:p-6" dir="rtl">
        <div className="flex items-center justify-center py-6 sm:py-12">
          <div className="max-w-[656px] w-full text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 sm:p-8">
              <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                تم إنشاء جميع الطلبات بنجاح!
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                {`تم إنشاء ${formatArabicCount(createdCount, CREATED_ORDER_COUNT_FORMS)} في النظام`}
              </p>
              {carrierUnsentLine}
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
    <div className="w-full bg-card px-4 py-6 sm:p-6" dir="rtl">
      <div className="max-w-[656px] w-full">
        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="font-bold text-xl sm:text-[28px] leading-snug text-foreground">
            نتيجة الرفع:
          </h2>
          {createdCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-xl sm:text-[28px] leading-snug text-[#2DB742]">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 [stroke-width:2px]" />
              {`تم إنشاء ${formatArabicCount(createdCount, CREATED_ORDER_COUNT_FORMS)}`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-xl sm:text-[28px] leading-snug text-amber-700">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 [stroke-width:2px]" />
              لم يتم إنشاء أي طلب
            </span>
          )}
        </div>

        {carrierUnsentLine}

        {failedCount > 0 && (
          <p role="alert" className="mb-6 text-lg font-semibold text-[#FF0004] dark:text-danger-text">
            {`تعذر إنشاء ${formatArabicCount(failedCount, CREATED_ORDER_COUNT_FORMS)}`}
          </p>
        )}

        {missingCount > 0 && (
          <section className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <h3 className="mb-2 font-bold text-amber-800">
              {`${formatArabicCount(missingCount, MISSING_ORDER_COUNT_FORMS)} في قائمة المفقودات`}
            </h3>
            <ul className="mb-3 space-y-1 text-sm leading-6 text-amber-900">
              {missingRows.map((row) => (
                <li key={row.rowIndex} className="flex flex-wrap items-start gap-x-3 gap-y-1">
                  <span className="min-w-0 break-words">{missingRowText(row)}</span>
                  <button
                    type="button"
                    onClick={() => clearAndGo(`/dashboard/orders/missing/${row.missingOrderId}`)}
                    className="min-h-10 px-2 font-semibold text-primary-text hover:underline"
                  >
                    فتح الطلب المفقود
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => clearAndGo('/dashboard/orders/missing')}
              className="min-h-10 px-4 py-2 font-semibold text-primary-text hover:underline"
            >
              قائمة المفقودات
            </button>
          </section>
        )}

        <RowProblems rows={problems} />

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {newUploadButton}
          {viewOrdersButton}
        </div>
      </div>
    </div>
  );
}
