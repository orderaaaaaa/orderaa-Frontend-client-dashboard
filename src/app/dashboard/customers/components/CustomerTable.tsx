import React from 'react';
import { Phone, Mail, Calendar, ShoppingBag, MoreVertical } from 'lucide-react';
import { useGetCustomers } from '../hooks/useGetCustomers';

const TABLE_HEADERS = [
  { label: 'العميل', align: 'right' },
  { label: 'التواصل', align: 'right' },
  { label: 'عدد الطلبات', align: 'center' },
  { label: 'اخر طلب', align: 'center' },
  { label: 'الحالة', align: 'center' },
  { label: 'النشارات', align: 'center' },
  { label: 'إجمالي المشتريات', align: 'center' },
  { label: 'الإجراءات', align: 'center' },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    نشط: 'bg-green-50 text-green-700 border border-green-200',
    'تم التوصيل': 'bg-green-50 text-green-700 border border-green-200',
    'تم الشحن': 'bg-blue-50 text-blue-700 border border-blue-200',
    ملغي: 'bg-red-50 text-red-700 border border-red-200',
    مرتجع: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
};

const getActivityColor = (activity: string) => {
  const colors: Record<string, string> = {
    'Loyal Buyer': 'bg-green-50 text-green-600 border border-green-200',
    'bulk buyer': 'bg-purple-50 text-purple-600 border border-purple-200',
    'Window shopper': 'bg-purple-50 text-purple-600 border border-purple-200',
    'No Show': 'bg-red-50 text-red-600 border border-red-200',
  };
  return colors[activity] || 'bg-gray-50 text-gray-600 border border-gray-200';
};

export default function CustomerTable() {
  const { data, isLoading, isError, error } = useGetCustomers({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-gray-600">جاري التحميل...</div>
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
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" dir="rtl">
          <thead>
            <tr className="bg-[#F8F7FC] border-b border-gray-200">
              {TABLE_HEADERS.map((header, index) => (
                <th
                  key={index}
                  className={`px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap text-${header.align}`}
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
                    <div className="text-sm text-gray-500 mt-0.5">
                      #{customer.id}
                    </div>
                  </div>
                </td>

                {/* التواصل */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2 items-end min-w-[180px]">
                    {customer.phoneNumbers.slice(0, 1).map((phone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <span className="font-medium">{phone}</span>
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-medium">{customer.email}</span>
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </td>

                {/* عدد الطلبات */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                    <span className="font-semibold text-gray-900 text-base">
                      {customer.numberOfOrders}
                    </span>
                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                  </div>
                </td>

                {/* اخر طلب */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                    <span className="text-sm text-gray-700 font-medium">
                      {customer.latestOrder?.createdAt
                        ? new Date(customer.latestOrder.createdAt)
                            .toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })
                            .replace(/\//g, '/ ')
                        : '-'}
                    </span>
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                </td>

                {/* الحالة */}
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                      customer.isBlocked ? 'محظور' : 'نشط'
                    )}`}
                  >
                    {customer.isBlocked ? 'محظور' : 'نشط'}
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
                    {customer.totalAmount.toLocaleString('ar-EG')} جنيه
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
