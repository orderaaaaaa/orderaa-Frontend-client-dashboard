'use client';
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Result } from '@/constants/FileUploadResult';

const ResultFileUpload = () => {
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="p-6 mb-6">
          <div>
            <div className="flex max-sm:flex-col items-center max-sm:gap-5 gap-3">
              <h1 className="text-3xl font-bold text-gray-800">
                نتيجة التحقق تم استلام{' '}
              </h1>
              <CheckCircle className="w-6 h-6  text-[#2DB742]" />
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
            <div
              key={order.orderId}
              className="bg-white rounded-lg shadow-sm border-2 border-red-200"
            >
              {/* Order Header */}
              <div
                className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOrder(order.orderId)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className="w-6 h-6 text-[#FF0004] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-gray-800 text-lg select-none">
                      الطلب {order.orderId}: في هذا الطلب الثاني عدم تم العثور
                      على أخطاء
                    </h3>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  {expandedOrders.includes(order.orderId) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Expandable Error Details */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedOrders.includes(order.orderId)
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-red-100 bg-red-50 p-4">
                  <div className="space-y-2">
                    {order.errors.map((error) => (
                      <div
                        key={error.errorId}
                        className="flex items-start gap-2 text-sm text-[#FF0004] select-none"
                      >
                        {error.errorMessage}
                      </div>
                    ))}
                  </div>
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
