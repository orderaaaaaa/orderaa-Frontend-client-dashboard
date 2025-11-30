import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Order } from '@/types/orders';
import { getOrders } from '@/lib/api/order';
import OrderCard from '../OrderCard';
import { Button } from '@/components/ui/button';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerPhone: string;
  customerName: string;
}

export default function CustomerOrdersModal({
  isOpen,
  onClose,
  customerPhone,
  customerName,
}: CustomerOrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !customerPhone) return;

    const fetchCustomerOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrders({
          customerPhone: customerPhone,
          limit: 1000,
          page: 1,
        });
        
        setOrders(response.data);
      } catch (err) {
        setError('فشل في تحميل طلبات العميل');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
  }, [isOpen, customerPhone]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-[#5D24E1]/5 to-[#682fee]/5">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 4L24 21H4L14 4Z" fill="#DC2626" stroke="#DC2626" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M14 11V15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="14" cy="18" r="1" fill="white"/>
              </svg>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xs font-bold text-white">{orders.length}</span>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">جميع طلبات العميل</h2>
              <p className="text-sm text-gray-600 mt-1">
                {customerName && customerName !== 'غير محدد' ? customerName + ' - ' : ''}
                <span dir="ltr" className="inline-block">{customerPhone}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="cursor-pointer w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5D24E1] mx-auto"></div>
                <p className="mt-4 text-gray-600 text-lg">جاري تحميل الطلبات...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-500 text-lg">لا توجد طلبات لهذا العميل</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  select={false}
                  isSelected={false}
                  id={order.id}
                  code={order.code}
                  name={order.customers.name}
                  phone={order.customers.phoneNumber}
                  altPhone={order.customers.altPhone}
                  government={order.customers.governorate || 'غير محدد'}
                  items={order.order_products.map(
                    (op: any) =>
                      `${op.products.name}${op.products.size ? ` - ${op.products.size}` : ''
                      }${op.products.color ? ` - ${op.products.color}` : ''}`
                  )}
                  price={order.totalCost}
                  trys={order.numberOfTriesToReach}
                  status={order.status}
                  city={order.customers.area || order.customers.city || 'غير محدد'}
                  alert={0}
                  createdAt={order.createdAt}
                  repeatCount={orders.length}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#5D24E1] text-white rounded-full hover:bg-[#682fee] transition-colors font-medium"
            >
              إغلاق
            </Button>
            <p className="text-sm text-gray-600">
              إجمالي الطلبات: <span className="font-bold text-[#5D24E1]">{orders.length}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

