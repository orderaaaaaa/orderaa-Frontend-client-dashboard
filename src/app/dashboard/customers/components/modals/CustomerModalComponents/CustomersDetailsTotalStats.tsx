import { useStatusLabel } from '@/hooks/useStatusLabel';
import { Calendar, Mail, Phone, ShoppingBag } from 'lucide-react';
import React from 'react';
import { TbMoneybag } from 'react-icons/tb';
import { getStatusColor } from '../../../lib/getBadgeColor';
import { Order } from '../../../types/customer';
import { CustomersDetailsTotalStatsProps } from '../../../types/CustomersDetailsModal';

function CustomersDetailsTotalStats({
  latestOrder,
  phoneNumbers,
  totalAmount,
  numberOfOrders,
  email,
  returned,
  delivered,
}: CustomersDetailsTotalStatsProps) {
  const { getStatusLabel } = useStatusLabel();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-[#dbd1f5] p-2 text-center text-gray-900 font-medium text-sm">
          آخر طلب
        </div>
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="font-bold text-sm">
              {latestOrder?.createdAt
                ? new Date(latestOrder.createdAt).toLocaleDateString()
                : '—'}
            </p>
          </div>
          {latestOrder && (
            <span
              className={`px-2 py-0.5 rounded-full text-[13px] font-bold ${getStatusColor(
                latestOrder.status
              )}`}
            >
              {getStatusLabel(latestOrder.status)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-[#dbd1f5] p-2 text-center text-gray-900 font-medium text-sm">
          عدد الطلبات
        </div>
        <div className="bg-white p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            <p className="text-xl font-bold">{numberOfOrders}</p>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {delivered} مؤكد • {returned} مرتجع
          </div>
        </div>
      </div>

      <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-[#dbd1f5] p-2 text-center text-gray-900 font-medium text-sm">
          إجمالي المشتريات
        </div>
        <div className="bg-white p-4">
          <div className="flex items-center gap-2">
            <TbMoneybag className="text-gray-600 w-5 h-5" />
            <p className="text-xl font-bold">{totalAmount.toLocaleString()}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">جنيه مصري</p>
        </div>
      </div>

      {/* تم إبقاء البطاقة الرابعة كما كانت في الكود الأصلي */}
      <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-[#dbd1f5] p-2 text-center text-gray-900 font-medium text-sm">
          معلومات التواصل
        </div>
        <div className="bg-white p-4">
          <div className="flex flex-col gap-2">
            {/* Phone Numbers Mapping */}
            {phoneNumbers.map((phone: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a
                  href={`tel:${phone}`}
                  className="font-bold text-sm hover:underline text-gray-900"
                >
                  {phone}
                </a>
              </div>
            ))}

            {/* Email Logic with Icon and Placeholder */}
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-gray-400" />
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="font-bold text-sm hover:underline text-gray-900"
                >
                  {email}
                </a>
              ) : (
                <span className="text-sm text-gray-400 italic">
                  لا يوجد بريد إلكتروني
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomersDetailsTotalStats;
