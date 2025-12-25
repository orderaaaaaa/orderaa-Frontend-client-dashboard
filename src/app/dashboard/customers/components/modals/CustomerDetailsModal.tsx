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
  // Cast the hook response to use your Customer interface + orders array
  const { data, isLoading, isError, refetch } = useCustomer(customerId) as {
    data: (Customer & { orders: Order[] }) | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const [activeTab, setActiveTab] = useState<'orders' | 'stats' | 'notes'>(
    'orders'
  );

  useEffect(() => {
    if (isOpen && customerId) {
      refetch();
    }
  }, [isOpen, customerId, refetch]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto relative">
          <div className="flex justify-center items-center h-64 mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto relative">
          <div className="p-6 text-center py-20 text-red-600">
            حدث خطأ أثناء تحميل البيانات
          </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      dir="rtl"
    >
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto relative">
        <button
          onClick={onClose}
          className="p-2 absolute hover:bg-gray-100 rounded-lg left-3 top-3 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <If condition={data.isBlocked}>
                <Then>
                  <ImBlocked className="text-red-500 w-6 h-6" />
                </Then>
              </If>
              <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 p-5 bg-[#f4f4f4] mb-5 rounded-sm">
            <button className="cursor-pointer flex gap-2 items-center bg-[#5d24e1] text-white px-4 py-2 rounded-md text-lg font-normal">
              <LiaWhatsapp /> إرسال الواتساب
            </button>
            <button className="cursor-pointer flex gap-2 items-center bg-white px-4 py-2 rounded-md text-lg font-normal">
              <FiMail /> إرسال البريد
            </button>
            <button className="cursor-pointer flex gap-2 items-center bg-white px-4 py-2 rounded-md text-lg font-normal">
              <BsFiletypeCsv /> تصدير
            </button>
          </div>

          {/* Contact and Overview Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col h-full border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-[#dbd1f5] p-3 text-center text-gray-900 font-medium">
                معلومات التواصل
              </div>
              <div className="bg-white p-4 flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {data.phoneNumbers[0] || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-medium truncate">
                    {data.email || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-[#dbd1f5] p-3 text-center text-gray-900 font-medium">
                عدد الطلبات
              </div>
              <div className="bg-white p-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-gray-400" />
                  <p className="text-2xl font-bold">{data.numberOfOrders}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {delivered} مؤكد • {returned} مرتجع
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-[#dbd1f5] p-3 text-center text-gray-900 font-medium">
                إجمالي المشتريات
              </div>
              <div className="bg-white p-4 flex-1">
                <div className="flex items-center gap-2">
                  <TbMoneybag className="text-gray-600 w-5 h-5" />
                  <p className="text-2xl font-bold">
                    {data.totalAmount.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">جنيه مصري</p>
              </div>
            </div>

            <div className="flex flex-col h-full border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-[#dbd1f5] p-3 text-center text-gray-900 font-medium">
                آخر طلب
              </div>
              <div className="bg-white p-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="font-bold">
                    {data.latestOrder?.createdAt
                      ? new Date(
                          data.latestOrder.createdAt
                        ).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                {data.latestOrder && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
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

          {/* Navigation */}
          <div className="flex gap-1 mb-6 p-1.5 bg-gray-100 rounded-full">
            {['orders', 'stats', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2.5 rounded-full text-center font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#5d24e1] text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'orders'
                  ? 'سجل الطلبات'
                  : tab === 'stats'
                  ? 'الإحصائيات'
                  : 'الملاحظات'}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          {activeTab === 'orders' && <OrdersTab orders={data.orders} />}
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
          {activeTab === 'notes' && (
            <NotesTab
              /* Fix for string vs string[] error: ensure notes is always an array */
              notes={Array.isArray(data.notes) ? data.notes : [data.notes]}
              createdAt={data.createdAt}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
