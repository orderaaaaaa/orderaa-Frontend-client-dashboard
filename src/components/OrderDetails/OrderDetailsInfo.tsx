import React, { useState } from "react";
import {
  User,
  Phone,
  MapPinned,
  Clock3,
  Package,
  Weight,
  Truck,
  CircleDollarSign,
  Edit2,
} from "lucide-react";
import { Order } from "@/types/orders";
import EditCustomerModal from "./EditCustomerModal";
import { updateCustomer } from "@/lib/api/order";

interface OrderDetailsInfoComponentProps {
  order: Order;
  onCustomerUpdate?: (updatedOrder: Order) => void;
}

function OrderDetailsInfoComponent({ order, onCustomerUpdate }: OrderDetailsInfoComponentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-semibold";

  // Format time from createdAt
  const createdDate = new Date(localOrder.createdAt);
  const formattedTime = createdDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleSaveCustomer = async (customerData: any) => {
    await updateCustomer(localOrder.customers.id, customerData);
    
    // Update local state
    const updatedOrder = {
      ...localOrder,
      customers: {
        ...localOrder.customers,
        ...customerData,
      },
    };
    setLocalOrder(updatedOrder);
    
    // Notify parent if callback provided
    if (onCustomerUpdate) {
      onCustomerUpdate(updatedOrder);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 font-medium p-4 bg-gray-50 mt-8 rounded-xl ">
        <div className="">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[#5D24E1] font-semibold">بيانات العميل</h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[#5D24E1] hover:text-[#4A1CB8] transition-colors p-1"
              title="تعديل بيانات العميل"
            >
              <Edit2 size={20} />
            </button>
          </div>
          <div className="grid grid-col-1 md:grid-cols-3 gap-6 ">
            <p className={tagStyle}>
              <User />
              {localOrder.customers.name}
            </p>
            <p className={tagStyle}>
              <Phone width={18} />
              {localOrder.customers.phoneNumber}
            </p>
            <p className={tagStyle}>
              <Phone width={18} />
              {localOrder.customers.altPhone || localOrder.customers.phoneNumber}
            </p>
            <p className={tagStyle}>
              <MapPinned width={18} />
              <span className={localOrder.customers.governorate ? '' : 'text-red-500'}>
                {localOrder.customers.governorate || 'غير محدد'}
              </span>
            </p>
            <p className={tagStyle}>
              <MapPinned width={18} />
              <span className={localOrder.customers.city ? '' : 'text-red-500'}>
                {localOrder.customers.city || 'غير محدد'}
              </span>
            </p>
            <p className={tagStyle}>
              {" "}
              <Clock3 width={18} />
              {formattedTime}
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-[#5D24E1] font-semibol mb-3">بيانات المنتج</h2>
          <div className="grid grid-col-1 md:grid-cols-3 gap-6 ">
            <p className={tagStyle}>
              {" "}
              <Package width={20} />
              {localOrder.order_products?.[0]?.products?.material || 'جلد'}
            </p>
            <p className={tagStyle}>
              <Weight width={18} />
              {localOrder.order_products?.[0]?.products?.weight || 'خفيف'}
            </p>
            <p className={tagStyle}>
              <Package width={20} />
              {localOrder.order_products?.[0]?.products?.manufactureCompany || 'مستورد'}
            </p>
            <p className={tagStyle}>
              <Truck width={20} />
              اراميكس
            </p>
            <p className={tagStyle}>
              <CircleDollarSign width={18} />
              {localOrder.totalCost} جنيه
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:grid-rows-1 gap-6">
          <div className="max-w-[500px]">
            <h3 className="mb-3">العنوان:</h3>
            <p className={tagStyle}>
              <span className={`max-w-3/4 ${localOrder.customers.address ? '' : 'text-red-500'}`}>
                {localOrder.customers.address || 'غير محدد'}
              </span>
            </p>
          </div>

          <div className="max-w-[500px]">
            <h3 className="mb-3">الملاحظات:</h3>

            <p className={tagStyle}>
              <span className="max-w-3/4">
                {localOrder.notes || 'لا توجد ملاحظات'}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-6 mb-3">
        <button className="py-1 px-10 border-1 rounded-2xl border-[#5D24E1] text-[#5D24E1] text-sm font-bold">
          متابعة
        </button>
        <button className="py-1 px-10 rounded-2xl bg-[#5D24E1] text-white text-sm font-bold">
          تأكيد
        </button>
      </div>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customerData={localOrder.customers}
        onSave={handleSaveCustomer}
      />
    </>
  );
}

export default OrderDetailsInfoComponent;
