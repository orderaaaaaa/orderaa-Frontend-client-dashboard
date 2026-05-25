import React, { useState } from 'react';
import { Copy, TriangleAlert, History } from 'lucide-react';
import { Order, OrderLockedBy } from '@/types/orders';
import { toast } from 'react-toastify';
import CustomerOrdersModal from '@/components/orders/CustomerOrdersModal';
import OrderHistoryModal from './OrderHistoryModal';
import OrderLockedBanner from './OrderLockedBanner';
import { getTimeAgo } from '@/utils/timeAgo';
import { If, Then } from 'react-if';
import { getRemainingTime } from '@/utils/getRemainingTime';

interface OrderDetailsCardIdProps {
  order: Order;
  isLockedByOther?: boolean;
  lockedBy?: OrderLockedBy | null;
}

const OrderDetailsCardId = ({
  order,
  isLockedByOther,
  lockedBy,
}: OrderDetailsCardIdProps) => {
  const [copied, setCopied] = useState(false);
  const [isCustomerOrdersModalOpen, setIsCustomerOrdersModalOpen] =
    useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const createdDate = new Date(order.createdAt);
  const timeAgo = getTimeAgo(order.createdAt);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('تم نسخ الكود بنجاح');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('تم نسخ الكود بنجاح');
      } catch {
        toast.error('فشل في نسخ الكود');
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div>
      <div className="max-xl:mb-20">
        <div className="flex sm:justify-between flex-col sm:flex-row">
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="flex gap-3 text-xl items-center font-bold mb-1">
              <Copy
                onClick={() => handleCopy(order.code)} // Pass order code here
                className="w-4 h-4 text-[#7038f3] cursor-pointer"
                role="button"
              />
              {/* order code */}
              {order.code}
              <History
                onClick={() => setIsHistoryModalOpen(true)}
                className="bg-[#F6F2FC] w-6 h-6 cursor-pointer p-1 rounded-full text-primary border-1 border-[#CBB5FD]"
              />
            </h3>
            <p className="text-xs font-bold sm:mr-7 mb-4">
              {createdDate.toLocaleDateString('ar-EG')} <span>{timeAgo}</span>
            </p>
            <If condition={order.postponedUntil}>
              <Then>
                <p className="flex items-center gap-1 text-sm md:text-base font-bold  mb-4 bg-amber-50 py-2 px-3 rounded-2xl text-amber-500">
                  <TriangleAlert />
                  <span>
                    {getRemainingTime(order.postponedUntil)} علي التاجيل
                  </span>
                </p>
              </Then>
            </If>
            <If condition={(order.shipping_ids?.length ?? 0) > 0 || !!order.shippingId}>
              <Then>
                <div className="flex flex-wrap gap-2 mb-2">
                  {order.shipping_ids && order.shipping_ids.length > 0 ? (
                    order.shipping_ids.map((entry) => (
                      <div
                        key={entry.id}
                        className={
                          entry.isActive
                            ? 'flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 shadow-sm'
                            : 'flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5'
                        }
                      >
                        <Copy
                          onClick={() => handleCopy(entry.shippingId)}
                          className={
                            entry.isActive
                              ? 'w-3.5 h-3.5 text-emerald-700 cursor-pointer shrink-0'
                              : 'w-3.5 h-3.5 text-gray-500 cursor-pointer shrink-0'
                          }
                          role="button"
                        />
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm">كود الشحن</span>
                          <span
                            className={
                              entry.isActive
                                ? 'text-sm font-bold text-emerald-800'
                                : 'text-sm font-semibold text-gray-700'
                            }
                          >
                            {entry.shippingId}
                          </span>
                          {entry.shippingCompany && (
                            <span className="text-[11px] font-normal text-gray-500">
                              {entry.shippingCompany}
                            </span>
                          )}
                        </div>
                        <span
                          className={
                            entry.isActive
                              ? 'inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[10px] font-medium px-2 py-0.5'
                              : 'inline-flex items-center gap-1 rounded-full bg-gray-200 text-gray-600 text-[10px] font-medium px-2 py-0.5'
                          }
                        >
                          <span
                            className={
                              entry.isActive
                                ? 'w-1.5 h-1.5 rounded-full bg-white'
                                : 'w-1.5 h-1.5 rounded-full bg-gray-400'
                            }
                          />
                          {entry.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
                      <Copy
                        onClick={() => handleCopy(order.shippingId!)}
                        className="w-3.5 h-3.5 text-[#7038f3] cursor-pointer shrink-0"
                        role="button"
                      />
                      <div className="flex flex-col leading-tight">
                        <span className="text-[10px] text-gray-500">كود الشحن</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {order.shippingId}
                        </span>
                        {order.shippingCompany && (
                          <span className="text-[11px] font-normal text-gray-500">
                            {order.shippingCompany}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Then>
            </If>
          </div>
          <div className="">
            <div className="flex flex-col sm:flex-row xl:flex-row gap-2 sm:px-5">
              {isLockedByOther && lockedBy && (
                <OrderLockedBanner lockedBy={lockedBy} />
              )}
              {(order?.customers?.totalCustomerOrders ?? 0) > 1 && (
                <button
                  className="cursor-pointer bg-[#F6F2FC] text-white border-1 border-[#CBB5FD] !rounded-r-3xl p-2 px-4"
                  onClick={() => setIsCustomerOrdersModalOpen(true)}
                >
                  <h3 className="flex gap-2 text-sm items-center font-semibold mb-1 text-primary relative ">
                    <TriangleAlert className="w-5 text-yellow-500" />
                    <p className="bg-red-600 absolute top-[-3px] right-[-4px] w-3 h-3 text-[8px] text-center rounded-full text-white">
                      {order?.customers?.totalCustomerOrders}
                    </p>
                    هذا العميل قام بالطلب اكثر من مره
                  </h3>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {/* {copied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-white shadow-md rounded-lg px-4 py-2 flex items-center gap-2 border border-[rgba(0,0,0,0.06)]"
        >
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-gray-800">تم النسخ</span>
        </div>
      )} */}

      {/* Customer Orders Modal */}
      <CustomerOrdersModal
        isOpen={isCustomerOrdersModalOpen}
        onClose={() => setIsCustomerOrdersModalOpen(false)}
        customerPhone={order.customers.phone_numbers?.[0]}
        customerName={order.customers.name}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        events={order.order_events || []}
      />
    </div>
  );
};

export default OrderDetailsCardId;
