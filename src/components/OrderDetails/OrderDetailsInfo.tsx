import React, { useState } from "react";
import {
  User,
  Phone,
  MapPinned,
  Clock3,
  Package,
  Truck,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Order } from "@/types/orders";
import { updateCustomer } from "@/lib/api/order";
import { Button } from "../ui/button";
import { LiaFileInvoiceDollarSolid, LiaBoxSolid, LiaWeightHangingSolid, LiaBoxOpenSolid } from "react-icons/lia";

interface OrderDetailsInfoComponentProps {
  order: Order;
  onCustomerUpdate?: (updatedOrder: Order) => void;
}

type EditableField = 'name' | 'city' | 'governorate' | 'phoneNumber' | 'altPhone' | 'address' | 'notes' | 'shippingCompany' | 'totalCost' | 'material' | 'weight' | 'countryOfManufacture' | 'packagingNotes' | null;

function OrderDetailsInfoComponent({ order, onCustomerUpdate }: OrderDetailsInfoComponentProps) {
  const [localOrder, setLocalOrder] = useState(order);
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  // Format time from createdAt
  const createdDate = new Date(localOrder.createdAt);
  const formattedTime = createdDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleStartEdit = (field: EditableField, currentValue: string | undefined) => {
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    const updateData: any = {};
    updateData[editingField] = tempValue;

    try {
      // Fields that are on the order object
      const orderFields = ['notes', 'totalCost', 'shippingCompany', 'material', 'weight', 'countryOfManufacture', 'packagingNotes'];

      if (orderFields.includes(editingField)) {
        // Update order fields - you may need to add an API call for this
        const updatedOrder = {
          ...localOrder,
          [editingField]: tempValue,
        };
        setLocalOrder(updatedOrder);

        if (onCustomerUpdate) {
          onCustomerUpdate(updatedOrder);
        }
      } else {
        // Update customer fields
        await updateCustomer(localOrder.customers.id, updateData);

        const updatedOrder = {
          ...localOrder,
          customers: {
            ...localOrder.customers,
            ...updateData,
          },
        };
        setLocalOrder(updatedOrder);

        if (onCustomerUpdate) {
          onCustomerUpdate(updatedOrder);
        }
      }

      setEditingField(null);
      setTempValue('');
    } catch (error) {
      console.error('Failed to update field:', error);
    }
  };

  // Editable field component
  const EditableField = ({
    field,
    icon: Icon,
    value,
    placeholder = 'غير محدد',
    className = ''
  }: {
    field: EditableField;
    icon: any;
    value: string | undefined;
    placeholder?: string;
    className?: string;
  }) => {
    const isEditing = editingField === field;
    const displayValue = value || placeholder;
    const isEmpty = !value;

    return (
      <div className={`${tagStyle} ${className} relative`}>
        <Icon width={18} />
        {isEditing ? (
          <>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1 border border-[#5D24E1] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D24E1]"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={handleSaveField}
                className="p-1 hover:bg-green-100 rounded transition-colors"
              >
                <Check className="cursor-pointer w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="cursor-pointer w-4 h-4 text-red-600" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-full flex items-center justify-between">
              <p className={isEmpty ? 'text-red-500' : ''}>{displayValue}</p>
              <button
                onClick={() => handleStartEdit(field, value)}
                className="cursor-pointer p-1 hover:bg-purple-100 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4 text-[#5D24E1]" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 font-medium p-4 bg-gray-50 mt-8 rounded-xl mb-24">
        <div className="">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[#5D24E1] font-semibold">بيانات العميل</h2>
          </div>
          <div className="grid grid-col-1 md:grid-cols-4 gap-6 ">
            <EditableField
              field="name"
              icon={User}
              value={localOrder.customers.name}
              placeholder="اسم العميل"
            />

            <EditableField
              field="shippingCompany"
              icon={Truck}
              value={(localOrder as any).shippingCompany}
              placeholder="شركة الشحن"
            />

            <EditableField
              field="city"
              icon={MapPinned}
              value={localOrder.customers.city}
              placeholder="غير محدد"
            />

            <EditableField
              field="governorate"
              icon={MapPinned}
              value={localOrder.customers.governorate}
              placeholder="غير محدد"
            />

            <div className={tagStyle}>
              <Clock3 width={18} />
              {formattedTime}
            </div>

            <EditableField
              field="phoneNumber"
              icon={Phone}
              value={localOrder.customers.phoneNumber}
              placeholder="رقم الهاتف"
            />

            <EditableField
              field="altPhone"
              icon={Phone}
              value={localOrder.customers.altPhone}
              placeholder="رقم بديل"
            />
          </div>
        </div>
        <div className="flex flex-col justify-start gap-2">
          <h2 className="text-[#5D24E1] font-semibold">السعر</h2>
          <div className="grid grid-col-1 md:grid-cols-4 gap-6 ">
            <EditableField
              field="totalCost"
              icon={LiaFileInvoiceDollarSolid}
              value={String(localOrder.totalCost)}
              placeholder="السعر"
            />
          </div>

        </div>
        <div className="flex flex-col justify-start gap-2">
          <h2 className="text-[#5D24E1] font-bold text-lg">بيانات الشحن</h2>
          <div className="grid grid-col-1 md:grid-cols-4 gap-6 ">
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">العنوان:</p>
              <EditableField
                field="address"
                icon={MapPinned}
                value={localOrder.customers.address}
                placeholder="غير محدد"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">ملاحظات:</p>
              <EditableField
                field="notes"
                icon={Package}
                value={localOrder.notes}
                placeholder="لا توجد ملاحظات"
              />
            </div>
          </div>
        </div>

        <h2 className="text-[#5D24E1] font-bold text-lg">بيانات المنتج</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:grid-rows-1 gap-6">
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[#121212]">الخامة</p>
            <EditableField
              field="material"
              icon={LiaBoxSolid}
              value={(localOrder as any).material}
              placeholder="الخامة"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[#121212]">الوزن</p>
            <EditableField
              field="weight"
              icon={LiaWeightHangingSolid}
              value={(localOrder as any).weight}
              placeholder="الوزن"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[#121212]">بلد التصنيع</p>
            <EditableField
              field="countryOfManufacture"
              icon={LiaBoxOpenSolid}
              value={(localOrder as any).countryOfManufacture}
              placeholder="بلد التصنيع"
            />
          </div>

          <div className="max-w-[500px]">
            <h3 className="font-bold text-[#121212] mb-3">ملاحظه لقسم التغليف</h3>
            <EditableField
              field="packagingNotes"
              icon={Package}
              value={(localOrder as any).packagingNotes}
              placeholder="لا توجد ملاحظات لقسم التغليف"
            />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-4 px-6">
        <div className="flex gap-2 justify-center sm:justify-end max-w-7xl mx-auto">
          <Button variant="outline" className="py-2 px-10 border-2 rounded-2xl border-[#5D24E1] text-[#5D24E1] text-sm font-bold hover:bg-purple-50 transition-colors">
            متابعة
          </Button>
          <Button variant="default" className="py-2 px-10 rounded-2xl bg-[#5D24E1] text-white text-sm font-bold hover:bg-[#4B1BC4] transition-colors">
            تأكيد
          </Button>
        </div>
      </div>

    </>
  );
}

export default OrderDetailsInfoComponent;
