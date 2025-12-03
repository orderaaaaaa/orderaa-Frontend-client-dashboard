import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
} from "lucide-react";
import { Order } from "@/types/orders";
import { updateCustomer } from "@/lib/api/order";
import { Button } from "../ui/button";
import { LiaFileInvoiceDollarSolid, LiaBoxSolid, LiaWeightHangingSolid, LiaBoxOpenSolid } from "react-icons/lia";
import { Banknote, CreditCard } from "lucide-react";
import ActionConfirmationDialog from "./ActionConfirmationDialog";

interface OrderDetailsInfoComponentProps {
  order: Order;
  onCustomerUpdate?: (updatedOrder: Order) => void;
}

type EditableField = 'name' | 'city' | 'governorate' | 'phoneNumber' | 'altPhone' | 'address' | 'notes' | 'shippingCompany' | 'totalCost' | 'shippingCost' | 'material' | 'weight' | 'countryOfManufacture' | 'packagingNotes' | 'paymentMethod' | 'paymentStatus' | null;

function OrderDetailsInfoComponent({ order, onCustomerUpdate }: OrderDetailsInfoComponentProps) {
  const [localOrder, setLocalOrder] = useState(order);
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [tempValue, setTempValue] = useState<string>('');

  // Dropdown and confirmation dialog state
  const [isArrowDropdownOpen, setIsArrowDropdownOpen] = useState(false);
  const [isFollowUpDropdownOpen, setIsFollowUpDropdownOpen] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: '',
  });

  const arrowDropdownRef = useRef<HTMLDivElement>(null);
  const followUpDropdownRef = useRef<HTMLDivElement>(null);

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (arrowDropdownRef.current && !arrowDropdownRef.current.contains(event.target as Node)) {
        setIsArrowDropdownOpen(false);
      }
      if (followUpDropdownRef.current && !followUpDropdownRef.current.contains(event.target as Node)) {
        setIsFollowUpDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Arrow dropdown options
  const arrowOptions = [
    { label: 'مستعجل', action: 'urgent' },
    { label: 'الغاء', action: 'cancel' },
    { label: 'رفض التعديل', action: 'reject_modification' },
    { label: 'تأجيل ساعات', action: 'postpone_hours' },
    { label: 'تأجيل أيام', action: 'postpone_days' },
    { label: 'متابعة واتساب', action: 'whatsapp_followup' },
    { label: 'وقف التشغيل', action: 'stop_operation' },
    { label: 'في انتظار الدفع', action: 'waiting_payment' },
  ];

  // Follow-up dropdown options
  const followUpOptions = [
    { label: 'لا يرد', action: 'no_answer' },
    { label: 'مغلق', action: 'closed' },
    { label: 'مش بيجمع', action: 'not_collecting' },
    { label: 'فتح و قفل', action: 'open_close' },
  ];

  const handleActionClick = (label: string, action: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: `تأكيد ${label}`,
      message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
      action,
    });
    setIsArrowDropdownOpen(false);
    setIsFollowUpDropdownOpen(false);
  };

  const handleConfirmAction = () => {
    // TODO: Add API call to update order status based on confirmationDialog.action
    console.log('Confirmed action:', confirmationDialog.action);
    // You can add API call here based on the action
  };

  const handleConfirmClick = () => {
    setConfirmationDialog({
      isOpen: true,
      title: 'تأكيد الطلب',
      message: 'هل أنت متأكد من تأكيد هذا الطلب؟',
      action: 'confirm',
    });
  };

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
      const orderFields = ['notes', 'totalCost', 'shippingCost', 'shippingCompany', 'material', 'weight', 'countryOfManufacture', 'packagingNotes', 'paymentMethod', 'paymentStatus'];

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
    label,
    className = ''
  }: {
    field: EditableField;
    icon: any;
    value: string | undefined;
    label: string;
    className?: string;
  }) => {
    const isEditing = editingField === field;
    const isEmpty = !value;
    const displayValue = isEmpty ? '-' : value;

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <p className="font-bold text-[#121212]">{label}</p>
        <div className={`${tagStyle} relative`}>
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
              <div className="w-full flex items-start justify-between">
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
              label="اسم العميل"
            />

            <EditableField
              field="shippingCompany"
              icon={Truck}
              value={localOrder.shippingCompany}
              label="شركة الشحن"
            />

            <EditableField
              field="city"
              icon={MapPinned}
              value={localOrder.customers.city}
              label="المدينة"
            />

            <EditableField
              field="governorate"
              icon={MapPinned}
              value={localOrder.customers.governorate}
              label="المحافظة"
            />

            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">الوقت</p>
              <div className={tagStyle}>
                <Clock3 width={18} />
                {formattedTime}
              </div>
            </div>

            <EditableField
              field="phoneNumber"
              icon={Phone}
              value={localOrder.customers.phoneNumber}
              label="رقم الهاتف"
            />

            <EditableField
              field="altPhone"
              icon={Phone}
              value={localOrder.customers.altPhone}
              label="رقم بديل"
            />
          </div>
        </div>
        <div className="flex flex-col justify-start gap-2">
          <h2 className="text-[#5D24E1] font-semibold">السعر و الدفع</h2>
          <div className="grid grid-col-1 md:grid-cols-4 gap-6 ">
            <EditableField
              field="totalCost"
              icon={LiaFileInvoiceDollarSolid}
              value={String(localOrder.totalCost)}
              label="السعر"
            />
            <EditableField
              field="shippingCost"
              icon={Truck}
              value={localOrder.shippingCost ? String(localOrder.shippingCost) : undefined}
              label="سعر الشحن"
            />
            <EditableField
              field="paymentMethod"
              icon={CreditCard}
              value={localOrder.paymentMethod}
              label="طريقة الدفع"
            />
            <EditableField
              field="paymentStatus"
              icon={Banknote}
              value={localOrder.paymentStatus}
              label="حالة الدفع"
            />
          </div>

        </div>
        <div className="flex flex-col justify-start gap-2">
          <h2 className="text-[#5D24E1] font-bold text-lg">بيانات الشحن</h2>
          <div className="grid grid-col-1 md:grid-cols-4 gap-6 ">
            <EditableField
              field="address"
              icon={MapPinned}
              value={localOrder.customers.address}
              label="العنوان"
            />
            <EditableField
              field="notes"
              icon={Package}
              value={localOrder.notes}
              label="ملاحظات"
            />
          </div>
        </div>

        <h2 className="text-[#5D24E1] font-bold text-lg">بيانات المنتج</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:grid-rows-1 gap-6">
          <EditableField
            field="material"
            icon={LiaBoxSolid}
            value={localOrder.material}
            label="الخامة"
          />
          <EditableField
            field="weight"
            icon={LiaWeightHangingSolid}
            value={localOrder.weight}
            label="الوزن"
          />
          <EditableField
            field="countryOfManufacture"
            icon={LiaBoxOpenSolid}
            value={localOrder.countryOfManufacture}
            label="بلد التصنيع"
          />
          <EditableField
            field="packagingNotes"
            icon={Package}
            value={localOrder.packagingNotes}
            label="ملاحظه لقسم التغليف"
          />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-4 px-6">
        <div className="flex gap-2 justify-center items-center sm:justify-end max-w-7xl mx-auto">
          {/* Arrow Dropdown Button */}
          <div className="relative" ref={arrowDropdownRef}>
            {/* Confirm Button */}
            <div className="flex flex-row gap-2">
              <Button
                variant="default"
                onClick={handleConfirmClick}
                className="py-2 px-10 rounded-2xl bg-[#5D24E1] text-white text-sm font-bold hover:bg-[#4B1BC4] transition-colors"
              >
                تأكيد
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsFollowUpDropdownOpen(!isFollowUpDropdownOpen);
                  setIsArrowDropdownOpen(false);
                }}
                className="py-2 px-10 border-2 rounded-2xl border-[#5D24E1] text-[#5D24E1] text-sm font-bold hover:bg-purple-50 transition-colors"
              >
                متابعة
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsArrowDropdownOpen(!isArrowDropdownOpen);
                  setIsFollowUpDropdownOpen(false);
                }}
                className="w-9 h-9 p-0 rounded-full border-2 border-[#5D24E1] hover:bg-purple-50 transition-colors"
              >
                <ChevronDown className={`w-5 h-5 text-[#5D24E1] transition-all ${isArrowDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Arrow Dropdown Menu */}
            {isArrowDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                {arrowOptions.map((option) => (
                  <button
                    key={option.action}
                    onClick={() => handleActionClick(option.label, option.action)}
                    className="w-full px-4 py-3 text-right text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up Button with Dropdown */}
          <div className="relative" ref={followUpDropdownRef}>


            {/* Follow-up Dropdown Menu */}
            {isFollowUpDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                {followUpOptions.map((option) => (
                  <button
                    key={option.action}
                    onClick={() => handleActionClick(option.label, option.action)}
                    className="w-full px-4 py-3 text-right text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Confirmation Dialog */}
      <ActionConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog({ ...confirmationDialog, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
      />
    </>
  );
}

export default OrderDetailsInfoComponent;
