'use client';
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Mock data - replace with your actual data
const Result = {
  success: 150,
  failed: 3,
  orders: [
    {
      orderId: 1,
      errors: [
        {
          errorId: 1,
          errorMessage: 'نحتاج إلى بعض المساعدة. يرجى توضيح ما يلي:',
        },
        { errorId: 2, errorMessage: 'يبدو أن العنوان غير مكتمل' },
        { errorId: 3, errorMessage: 'لا يمكن تحديد السعر' },
      ],
    },
    {
      orderId: 2,
      errors: [
        {
          errorId: 1,
          errorMessage: 'نحتاج إلى بعض المساعدة. يرجى توضيح ما يلي:',
        },
        { errorId: 2, errorMessage: 'يبدو أن العنوان غير مكتمل' },
        { errorId: 3, errorMessage: 'لا يمكن تحديد السعر' },
      ],
    },
    {
      orderId: 12,
      errors: [
        {
          errorId: 1,
          errorMessage: 'نحتاج إلى بعض المساعدة. يرجى توضيح ما يلي:',
        },
        { errorId: 2, errorMessage: 'يبدو أن العنوان غير مكتمل' },
        { errorId: 3, errorMessage: 'لا يمكن تحديد السعر' },
      ],
    },
  ],
};

const ResultFileUpload = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div>
            <div className="flex max-sm:flex-col items-center max-sm:gap-5 gap-3">
              <h1 className="text-3xl font-bold text-gray-800">
                نتيجة التحقق تم استلام{' '}
              </h1>
              <CheckCircle className="w-6 h-6 text-[#2DB742]" />
              <div className="text-3xl font-bold text-[#2DB742]">
                {Result.success} طلب بنجاح
              </div>
            </div>
          </div>
          <div className="mt-4 max-sm:text-center">
            <p className="text-[#F61515] font-bold text-[22px]">
              يوجد {Result.failed} طلبات بها أخطاء
            </p>
          </div>
        </div>

        {/* Error Cards */}
        <div className="space-y-4">
          {Result.orders.map((order) => (
            <div key={order.orderId} className="relative">
              <div className="bg-white rounded-lg shadow-sm border-2 border-[#FF0004] relative">
                {/* Outlined Triangle Pointer - POINTING DOWN */}
                <div className="absolute bottom-0 right-6 translate-y-full z-10">
                  <div className="relative w-0 h-0">
                    {/* Outer red triangle */}
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-[#FF0004]"></div>
                    {/* Inner white triangle to create outline */}
                    <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[13px] border-t-white"></div>
                  </div>
                </div>

                {/* Order Header */}
                <div className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-6 h-6 text-[#FF0004] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-gray-800 text-lg select-none">
                        الطلب {order.orderId}:{' '}
                        {order.errors[0]?.errorMessage ||
                          'في هذا الطلب الثاني عدم تم العثور على أخطاء'}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Expandable Error Details */}
              </div>

              <div className="border-t border-red-100 bg-red-50 p-4 rounded-b-lg">
                <div className="space-y-2">
                  {order.errors.map((error) => (
                    <div
                      key={error.errorId}
                      className="flex items-start gap-2 text-sm text-[#FF0004] select-none"
                    >
                      <span className="w-2 h-2 bg-[#FF0004] rounded-full mt-1.5 text-base flex-shrink-0"></span>
                      {error.errorMessage}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultFileUpload;
