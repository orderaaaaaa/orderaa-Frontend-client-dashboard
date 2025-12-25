import React from 'react';
import { CheckCircle, Clock, Package } from 'lucide-react';

interface StatsTabProps {
  deliveryRate: number;
  cancellationRate: number;
  returnRate: number;
  delivered: number;
  cancelled: number;
  returned: number;
  totalOrders: number;
}

const StatsTab: React.FC<StatsTabProps> = ({
  deliveryRate,
  cancellationRate,
  returnRate,
  delivered,
  cancelled,
  returned,
  totalOrders,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {/* نسبة المرتجعات */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-[#dbd1f5] border-b rounded-t-lg border-[#dbd1f5] p-3">
          <p className="text-lg font-medium text-center text-gray-900">
            نسبة المرتجعات
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#ffffff] shadow-lg rounded-lg p-4 flex-1">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {returnRate}%
                </p>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#666666]">طلبات مرتجعة</span>
                <span className="font-medium text-gray-900">{returned}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#666666]">من إجمالي الطلبات</span>
                <span className="font-medium text-gray-900">{totalOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نسبة الإلغاء */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#dbd1f5] border-b rounded-t-lg border-[#dbd1f5] p-3">
          <p className="text-lg font-medium text-center text-gray-900">
            نسبة الإلغاء
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#ffffff] shadow-lg rounded-lg p-4 flex-1">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {cancellationRate}%
                </p>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#666666]">طلبات ملغية</span>
                <span className="font-medium text-gray-900">{cancelled}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#666666]">إجمالي الطلبات</span>
                <span className="font-medium text-gray-900">{totalOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* معدل التسليم */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#dbd1f5] border-b rounded-t-lg border-[#dbd1f5] p-3">
          <p className="text-lg font-medium text-center text-gray-900">
            معدل التسليم
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#ffffff] shadow-lg rounded-lg p-4 flex-1">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">
                  {deliveryRate}%
                </p>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <span className="text-[#666666]">تم التسليم</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
