import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  MoreVertical,
  Flag,
} from 'lucide-react';
import {
  customersTableData,
  statusColors,
  activityTypeColors,
} from '../constants/CustomerTableData';

export default function CustomerTable() {
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const toggleCheckbox = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleAllCheckboxes = () => {
    if (selectedCustomers.length === customersTableData.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customersTableData.map((customer) => customer.id));
    }
  };

  return (
    <div className=" w-[98%] rounded-lg shadow-md">
      {/* Toggle Checkbox Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setShowCheckboxes(!showCheckboxes)}
          className="px-4 py-2 bg-[#5d24e1] text-white rounded-lg hover:bg-[#4a1db3] transition-colors font-medium"
        >
          {showCheckboxes ? 'إخفاء علامات التحديد' : 'إظهار علامات التحديد'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-right bg-[#7849E614]">
              {showCheckboxes && (
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedCustomers.length === customersTableData.length
                    }
                    onChange={toggleAllCheckboxes}
                    className="w-5 h-5 cursor-pointer accent-[#5d24e1]"
                  />
                </th>
              )}
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                العميل
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                التواصل
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                عدد الطلبات
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                اخر طلب
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                الحالة
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                النشارات
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                إجمالي المشتريات
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customersTableData.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {showCheckboxes && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => toggleCheckbox(customer.id)}
                      className="w-5 h-5 cursor-pointer accent-[#5d24e1]"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    {customer.flagged && (
                      <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                    )}
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.code}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-2 flex-row-reverse text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-row-reverse text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 flex-row-reverse justify-end">
                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {customer.orderCount}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 flex-row-reverse justify-end">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {customer.lastOrderDate}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[customer.status]
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      activityTypeColors[customer.activityType]
                    }`}
                  >
                    {customer.activityType} {customer.activityIcon}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">
                    {customer.totalSpent}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
