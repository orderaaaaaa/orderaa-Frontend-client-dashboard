'use client';

import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { useCustomer } from '../../hooks/useGetCustomerId';
import OrdersTab from '../tabs/OrdersTab';
import StatsTab from '../tabs/StatsTab';
import NotesTab from '../tabs/NotesTab';
import { If, Then } from 'react-if';
import { FiMail } from 'react-icons/fi';
import { ImBlocked } from 'react-icons/im';
import { LiaWhatsapp } from 'react-icons/lia';
import { BsFiletypeCsv } from 'react-icons/bs';
import { TbMoneybag } from 'react-icons/tb';
import { Customer, Order } from '../../types/customer';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getStatusColor } from '../../lib/getBadgeColor';

interface CustomerDetailsModalProps {
  customerId?: number;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customerId,
  isOpen,
  onClose,
}) => {
  const { data, isLoading, isError, refetch } = useCustomer(customerId) as {
    data: (Customer & { orders: Order[] }) | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // تم تغيير التبويب الافتراضي هنا إلى 'stats'
  const [activeTab, setActiveTab] = useState<'orders' | 'stats' | 'notes'>(
    'stats'
  );
  const { getStatusLabel } = useStatusLabel();

  useEffect(() => {
    if (isOpen && customerId) {
      refetch();
    }
  }, [isOpen, customerId, refetch]);

  const handleWhatsappClick = () => {
    if (data?.phoneNumbers?.[0]) {
      const cleanNumber = data.phoneNumbers[0].replace(/\D/g, '');
      const formattedNumber = cleanNumber.startsWith('2')
        ? cleanNumber
        : `2${cleanNumber}`;
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (data?.email) {
      window.location.href = `mailto:${data.email}`;
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1]"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-10 text-center text-red-600">
          حدث خطأ أثناء تحميل البيانات
        </div>
      </div>
    );
  }

  const orders = data.orders || [];
  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;
  const returned = orders.filter(
    (o) => o.status === 'RETURNED_DELIVERED'
  ).length;

  const deliveryRate =
    totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;
  const cancellationRate =
    totalOrders > 0 ? Math.round((cancelled / totalOrders) * 100) : 0;
  const returnRate =
    totalOrders > 0 ? Math.round((returned / totalOrders) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 md:p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="p-2 absolute hover:bg-gray-100 rounded-lg left-3 top-3 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 md:p-8">
          <div className="mb-6 mt-4 md:mt-0">
            <div className="flex items-center gap-3">
              <If condition={data.isBlocked}>
                <Then>
                  <ImBlocked className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
                </Then>
              </If>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {data.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 p-3 md:p-5 bg-[#f4f4f4] mb-5 rounded-md">
            <button
              onClick={handleWhatsappClick}
              className="flex-1 min-w-[140px] justify-center cursor-pointer flex gap-2 items-center bg-[#5d24e1] text-white px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-[#4a1cb5] transition-colors"
            >
              <LiaWhatsapp className="text-xl" /> <span>واتساب</span>
            </button>
            <button
              onClick={handleEmailClick}
              className="flex-1 min-w-[140px] justify-center cursor-pointer flex gap-2 items-center bg-white border border-gray-200 px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-gray-50 transition-colors"
            >
              <FiMail /> <span>بريد</span>
            </button>
            <button className="flex-1 min-w-[140px] justify-center cursor-pointer flex gap-2 items-center bg-white border border-gray-200 px-4 py-2 rounded-md text-sm md:text-base font-medium hover:bg-gray-50 transition-colors">
              <BsFiletypeCsv /> <span>تصدير</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-[#dbd1f5] p-2 text-center text-gray-900 font-medium text-sm">
                آخر طلب
              </div>
              <div className="bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="font-bold text-sm">
                    {data.latestOrder?.createdAt
                      ? new Date(
                          data.latestOrder.createdAt
                        ).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                {data.latestOrder && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[13px] font-bold ${getStatusColor(
                      data.latestOrder.status
                    )}`}
                  >
                    {getStatusLabel(data.latestOrder.status)}
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
                  <p className="text-xl font-bold">{data.numberOfOrders}</p>
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
                  <p className="text-xl font-bold">
                    {data.totalAmount.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">جنيه مصري</p>
              </div>
            </div>

            {/* تم إبقاء البطاقة الرابعة كما كانت في الكود الأصلي */}
            <div className="flex flex-col border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-[#dbd1f5] p-2 text-center text-gray-900 font-medium text-sm">
                آخر طلب
              </div>
              <div className="bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="font-bold text-sm">
                    {data.latestOrder?.createdAt
                      ? new Date(
                          data.latestOrder.createdAt
                        ).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                {data.latestOrder && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      data.latestOrder.status === 'DELIVERED'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {data.latestOrder.status === 'DELIVERED'
                      ? 'تم التوصيل'
                      : data.latestOrder.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation - تم إعادة ترتيب المصفوفة لتكون الإحصائيات هي الأولى */}
          <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg md:rounded-full">
            {['stats', 'orders', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2 rounded-lg md:rounded-full text-center text-xs md:text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#5d24e1] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'stats'
                  ? 'الإحصائيات'
                  : tab === 'orders'
                  ? 'سجل الطلبات'
                  : 'الملاحظات'}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === 'stats' && (
              <StatsTab
                deliveryRate={deliveryRate}
                cancellationRate={cancellationRate}
                returnRate={returnRate}
                totalOrders={totalOrders}
                delivered={delivered}
                cancelled={cancelled}
                returned={returned}
              />
            )}
            {activeTab === 'orders' && <OrdersTab orders={data.orders} />}
            {activeTab === 'notes' && (
              <NotesTab
                notes={
                  Array.isArray(data.notes)
                    ? data.notes
                    : data.notes
                    ? [data.notes]
                    : []
                }
                createdAt={data.createdAt}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
