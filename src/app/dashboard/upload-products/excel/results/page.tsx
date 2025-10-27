'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadResult } from '@/types/excel-upload';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ValidationResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const resultsJson = sessionStorage.getItem('excelValidationResults');

    if (!resultsJson) {
      setLoading(false);
      return;
    }

    try {
      const parsedResults = JSON.parse(resultsJson);
      setResults(parsedResults);
      setImported(!!parsedResults.imported);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">لا توجد نتائج للعرض</p>
          <button
            onClick={() => router.push('/dashboard/upload-products/excel')}
            className="mt-4 text-[#5D24E1] hover:underline"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const { successCount, errorCount, invalidOrders } = results;

  const backendResponse = (results as any).backendResponse;
  const backendSuccessCount = backendResponse?.data?.successCount || 0;

  const displaySuccessCount = imported && backendSuccessCount > 0 ? backendSuccessCount : successCount;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-[656px]">
        <div
          dir="rtl"
          className="flex flex-row justify-start items-center gap-2 w-full max-w-[584px] h-[60px] mb-6"
        >
          <span className="font-bold text-[32px] leading-[60px] text-black whitespace-nowrap">
            نتيجة التحقق تم {imported ? 'إنشاء' : 'استلام'}
          </span>

          <div className="flex flex-row items-center gap-[2px] h-[60px]">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-[#2DB742] [stroke-width:2px]" />

            <span className="font-bold text-[32px] leading-[60px] whitespace-nowrap text-[#2DB742]">
              <span className="mr-2">{displaySuccessCount}</span> طلب بنجاح
            </span>
          </div>
        </div>

        {errorCount > 0 && (
          <div className="mb-6">
            <div className="text-lg font-semibold text-right text-[#FF0004]" dir="rtl">
              يوجد {errorCount} طلبات بها أخطاء
            </div>
          </div>
        )}

        {errorCount > 0 && (
          <div className="flex flex-col items-end gap-4 w-full">
            {invalidOrders.map((order) => (
              <div
                key={order.rowIndex}
                className="w-full max-w-[656px]"
              >
                <div
                  className="box-border flex flex-row justify-end items-center px-2 gap-4 w-full h-[46px] bg-white rounded-lg relative border border-[#FF0004]"
                  dir="rtl"
                >
                  <AlertCircle className="w-6 h-6 flex-shrink-0 text-[#FF0004] [stroke-width:1.5px]" />

                  <span className="font-normal text-lg leading-[33px] text-black text-right flex-grow">
                    الطلب {order.rowIndex}: في الصف{' '}
                    {order.rowIndex === 1 ? 'الأول' :
                      order.rowIndex === 2 ? 'الثاني' :
                        order.rowIndex === 3 ? 'الثالث' :
                          order.rowIndex === 4 ? 'الرابع' :
                            order.rowIndex === 5 ? 'الخامس' :
                              order.rowIndex === 6 ? 'السادس' :
                                order.rowIndex === 7 ? 'السابع' :
                                  order.rowIndex === 8 ? 'الثامن' :
                                    order.rowIndex === 9 ? 'التاسع' :
                                      order.rowIndex === 10 ? 'العاشر' :
                                        order.rowIndex === 11 ? 'الحادي عشر' :
                                          order.rowIndex === 12 ? 'الثاني عشر' :
                                            `رقم ${order.rowIndex}`} تم العثور على أخطاء
                  </span>

                  <svg
                    className="absolute right-[25px] -bottom-[12px] w-6 h-3"
                    style={{ filter: 'drop-shadow(0px 2.67px 2.67px rgba(0, 0, 0, 0.25))' }}
                    viewBox="0 0 24 12"
                  >
                    <polygon points="12,12 0,0 24,0" fill="#FFFFFF" />
                    <polyline points="0,0 12,12 24,0" stroke="#FF0004" strokeWidth="0.67" fill="none" />
                  </svg>
                </div>

                <div className="flex flex-row justify-end items-center p-2.5 gap-2.5 w-full min-h-[87px] mt-1.5 bg-[#FF000408]">
                  <div className="font-normal text-sm leading-[26px] text-right w-full text-[#FF0004]" dir="rtl">
                    <div className="mb-1">
                      نحتاج إلى بعض المساعدة. يرجى توضيح ما يلي:
                    </div>
                    {order.errors.map((error, index) => (
                      <div key={index}>
                        {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {errorCount === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {imported ? '🎉 تم إنشاء جميع الطلبات بنجاح!' : 'تم التحقق من جميع الطلبات بنجاح!'}
            </h2>
            <p className="text-gray-600">
              {imported ? `تم إنشاء ${displaySuccessCount} طلب في النظام` : `جميع الـ ${successCount} طلب جاهزة للمعالجة`}
            </p>
          </div>
        )}

        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => {
              sessionStorage.removeItem('excelValidationResults');
              sessionStorage.removeItem('excelValidationOnly');
              router.push('/dashboard/upload-products/excel');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            رفع ملف جديد
          </button>

          {errorCount === 0 && successCount > 0 && !imported && (
            <button
              onClick={() => {
                alert('تم إرسال البيانات بالفعل! تحقق من الطلبات في قائمة الطلبات');
              }}
              className="px-6 py-3 bg-[#5D24E1] text-white rounded-lg hover:bg-[#4a1db5] transition-colors"
            >
              إرسال الطلبات ({successCount})
            </button>
          )}

          {imported && displaySuccessCount > 0 && (
            <button
              onClick={() => {
                sessionStorage.removeItem('excelValidationResults');
                sessionStorage.removeItem('excelValidationOnly');
                router.push('/dashboard/orders/allOrders');
              }}
              className="px-6 py-3 bg-[#5D24E1] text-white rounded-lg hover:bg-[#4a1db5] transition-colors"
            >
              عرض الطلبات ({displaySuccessCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
