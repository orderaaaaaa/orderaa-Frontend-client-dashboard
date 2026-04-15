'use client';

import BaseModal from '@/components/ui/base-modal';

interface ProductChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

const mockLogs = [
  {
    id: 1,
    changeType: 'SWAP_PRODUCT' as const,
    oldProductName: 'قميص أبيض',
    newProductName: 'قميص أزرق',
    employeeName: 'أحمد محمد',
    priceDifference: 50,
    createdAt: '2026-04-05T10:30:00Z',
  },
  {
    id: 2,
    changeType: 'MODIFY_VARIANT' as const,
    oldProductName: 'بنطلون جينز',
    newProductName: 'بنطلون جينز',
    employeeName: 'سارة أحمد',
    priceDifference: 0,
    createdAt: '2026-04-06T14:15:00Z',
  },
  {
    id: 3,
    changeType: 'SWAP_PRODUCT' as const,
    oldProductName: 'حذاء رياضي',
    newProductName: 'حذاء كلاسيك',
    employeeName: 'محمد علي',
    priceDifference: -30,
    createdAt: '2026-04-07T09:00:00Z',
  },
];

const changeTypeLabels: Record<string, string> = {
  SWAP_PRODUCT: 'تغيير',
  MODIFY_VARIANT: 'تعديل',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProductChangeLogModal({
  isOpen,
  onClose,
  orderId,
}: ProductChangeLogModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`سجل تغييرات المنتجات - طلب #${orderId}`}
      showFooter={false}
      maxWidth="md:max-w-[850px]"
    >
      <div className="overflow-x-auto" dir="rtl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-right px-4 py-3 font-bold text-gray-700">التاريخ</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700">الموظف</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700">نوع التغيير</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700">المنتج القديم</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700">المنتج الجديد</th>
              <th className="text-right px-4 py-3 font-bold text-gray-700">فرق السعر</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-600">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-3 font-medium text-[#1E1E1E]">{log.employeeName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      log.changeType === 'SWAP_PRODUCT'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {changeTypeLabels[log.changeType]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.oldProductName}</td>
                <td className="px-4 py-3 font-medium text-[#1E1E1E]">{log.newProductName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      log.priceDifference > 0
                        ? 'text-green-600'
                        : log.priceDifference < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {log.priceDifference > 0 ? '+' : ''}{log.priceDifference} جنيه
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mockLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد تغييرات مسجلة لهذا الطلب
          </div>
        )}
      </div>
    </BaseModal>
  );
}
