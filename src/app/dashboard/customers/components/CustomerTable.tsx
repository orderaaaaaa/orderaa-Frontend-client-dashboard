import React from 'react';
import { Phone, Mail, Calendar, ShoppingBag, MoreVertical } from 'lucide-react';
import { LiaWhatsapp, LiaCalendarAltSolid } from 'react-icons/lia';
import { GoMail } from 'react-icons/go';
import { useGetCustomers } from '../hooks/useGetCustomers';
import { TABLE_HEADERS } from '../constants/CustomerHeaders';
import { If, Then } from 'react-if';
import { getStatusColor } from '../lib/getBadgeColor';
import { getActivityColor } from '../lib/getActivityColor';

export default function CustomerTable() {
  const { data, isLoading, isError, error } = useGetCustomers({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-red-600">
          حدث خطأ في تحميل البيانات: {error?.message}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[97%] mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="bg-[#f1eefa]">
              {TABLE_HEADERS.map((header, index) => (
                <th
                  key={index}
                  className={`px-4 py-4 md:text-md font-medium text-gray-700 whitespace-nowrap text-${header.align}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* العميل */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-base">
                      {customer.name}
                    </div>
                  </div>
                </td>

                {/* التواصل */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {customer.phoneNumbers.slice(0, 1).map((phone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 md:text-md text-gray-800"
                      >
                        <LiaWhatsapp className="w-6 h-6 text-gray-600" />
                        <span className="font-medium">{phone}</span>
                      </div>
                    ))}
                    <If condition={customer.email}>
                      <Then>
                        <div className="flex items-center gap-2 md:text-md text-gray-800">
                          <GoMail className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{customer.email}</span>
                        </div>
                      </Then>
                    </If>
                  </div>
                </td>

                {/* عدد الطلبات */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md">
                    <ShoppingBag className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900 text-lg">
                      {customer.numberOfOrders}
                    </span>
                  </div>
                </td>

                {/* اخر طلب */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 px-3 rounded-md">
                    <LiaCalendarAltSolid className="w-5 h-5 text-gray-500" />

                    <span className="md:text-md text-gray-800 font-medium">
                      {customer.latestOrder?.createdAt
                        ? new Date(customer.latestOrder.createdAt)
                            .toLocaleDateString('eng', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })
                            .replace(/\//g, '/ ')
                        : '-'}
                    </span>
                  </div>
                </td>

                {/* الحالة */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${getStatusColor(
                      customer.latestOrder?.status
                    )}`}
                  >
                    {customer.latestOrder?.status ?? '—'}
                  </span>
                </td>

                {/* النشارات */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${getActivityColor(
                      'Loyal Buyer'
                    )}`}
                  >
                    <span>🏆</span>
                    <span>Loyal Buyer</span>
                  </span>
                </td>

                {/* إجمالي المشتريات */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span className="font-bold text-gray-900 text-base">
                    {customer.totalAmount} جنيه
                  </span>
                </td>

                {/* الإجراءات */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center justify-center">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
