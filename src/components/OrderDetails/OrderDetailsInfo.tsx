import React, { useState, useRef, useEffect } from "react";
import {
  LiaUserSolid,
  LiaPhoneSolid,
  LiaMapMarkerAltSolid,
  LiaClockSolid,
  LiaBoxSolid,
  LiaTruckSolid,
  LiaEditSolid,
  LiaCheckSolid,
  LiaTimesSolid,
  LiaAngleDownSolid,
  LiaFileInvoiceDollarSolid,
  LiaWeightHangingSolid,
  LiaBoxOpenSolid,
  LiaMoneyBillWaveSolid,
  LiaCreditCardSolid,
  LiaCheckCircle,
  LiaCommentDotsSolid,
  LiaBoltSolid,
  LiaBanSolid,
  LiaTimesCircleSolid,
  LiaCalendarAltSolid,
  LiaWhatsapp,
  LiaStopCircleSolid,
  LiaHourglassSolid,
  LiaPhoneSlashSolid,
  LiaLockSolid,
  LiaExchangeAltSolid,
} from "react-icons/lia";
import { Order } from "@/types/orders";
import { updateCustomer } from "@/lib/api/order";
import { Button } from "../ui/button";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import EditShippingModal, { ShippingData } from "./EditShippingModal";

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

  // Shipping modal state
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

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
    { label: 'مستعجل', action: 'urgent', icon: <LiaBoltSolid className="w-5 h-5" /> },
    { label: 'الغاء', action: 'cancel', icon: <LiaBanSolid className="w-5 h-5" /> },
    { label: 'رفض التعديل', action: 'reject_modification', icon: <LiaTimesCircleSolid className="w-5 h-5" /> },
    { label: 'تأجيل ساعات', action: 'postpone_hours', icon: <LiaHourglassSolid className="w-5 h-5" /> },
    { label: 'تأجيل أيام', action: 'postpone_days', icon: <LiaCalendarAltSolid className="w-5 h-5" /> },
    { label: 'متابعة واتساب', action: 'whatsapp_followup', icon: <LiaWhatsapp className="w-5 h-5" /> },
    { label: 'وقف التشغيل', action: 'stop_operation', icon: <LiaStopCircleSolid className="w-5 h-5" /> },
    { label: 'في انتظار الدفع', action: 'waiting_payment', icon: <LiaLockSolid className="w-5 h-5" /> },
  ];

  // Follow-up dropdown options
  const followUpOptions = [
    { label: 'لا يرد', action: 'no_answer', icon: <LiaPhoneSlashSolid className="w-5 h-5" /> },
    { label: 'مغلق', action: 'closed', icon: <LiaLockSolid className="w-5 h-5" /> },
    { label: 'مش بيجمع', action: 'not_collecting', icon: <LiaBanSolid className="w-5 h-5" /> },
    { label: 'فتح و قفل', action: 'open_close', icon: <LiaExchangeAltSolid className="w-5 h-5" /> },
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

  // Handle shipping data save
  const handleSaveShippingData = async (data: ShippingData) => {
    try {
      // Update customer with new shipping data
      await updateCustomer(localOrder.customers.id, {
        governorate: data.governorate,
        city: data.city,
        address: data.address,
      });

      const updatedOrder = {
        ...localOrder,
        shippingCompany: data.shippingCompany,
        customers: {
          ...localOrder.customers,
          governorate: data.governorate,
          city: data.city,
          address: data.address,
        },
      };

      setLocalOrder(updatedOrder);

      if (onCustomerUpdate) {
        onCustomerUpdate(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to update shipping data:', error);
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
          <Icon size={18} />
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
                  <LiaCheckSolid className="cursor-pointer w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <LiaTimesSolid className="cursor-pointer w-4 h-4 text-red-600" />
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
                  <LiaEditSolid className="w-4 h-4 text-[#5D24E1]" />
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
              icon={LiaUserSolid}
              value={localOrder.customers.name}
              label="اسم العميل"
            />

            <EditableField
              field="shippingCompany"
              icon={LiaTruckSolid}
              value={localOrder.shippingCompany}
              label="شركة الشحن"
            />

            <EditableField
              field="city"
              icon={LiaMapMarkerAltSolid}
              value={localOrder.customers.city}
              label="المدينة"
            />

            <EditableField
              field="governorate"
              icon={LiaMapMarkerAltSolid}
              value={localOrder.customers.governorate}
              label="المحافظة"
            />

            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">الوقت</p>
              <div className={tagStyle}>
                <LiaClockSolid size={18} />
                {formattedTime}
              </div>
            </div>

            <EditableField
              field="phoneNumber"
              icon={LiaPhoneSolid}
              value={localOrder.customers.phoneNumber}
              label="رقم الهاتف"
            />

            <EditableField
              field="altPhone"
              icon={LiaPhoneSolid}
              value={localOrder.customers.altPhone}
              label="رقم بديل"
            />

            <div className="md:col-span-4">
              <EditableField
                field="notes"
                icon={LiaCommentDotsSolid}
                value={localOrder.notes}
                label="ملاحظات"
              />
            </div>
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
              icon={LiaTruckSolid}
              value={localOrder.shippingCost ? String(localOrder.shippingCost) : undefined}
              label="سعر الشحن"
            />
            <EditableField
              field="paymentMethod"
              icon={LiaCreditCardSolid}
              value={localOrder.paymentMethod}
              label="طريقة الدفع"
            />
            <EditableField
              field="paymentStatus"
              icon={LiaMoneyBillWaveSolid}
              value={localOrder.paymentStatus}
              label="حالة الدفع"
            />
          </div>

        </div>

        {/* Shipping Section - Visually Separated */}
        <div className="bg-white px-1 border-t border-b border-[#E5E7EB] pt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#5D24E1] font-bold text-lg">بيانات الشحن</h2>
            <Button
              variant="ghost"
              onClick={() => setIsShippingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#5D24E1] text-[#5D24E1] rounded-lg hover:bg-purple-50 transition-colors font-bold"
            >
              تعديل
              <LiaEditSolid className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-col-1 md:grid-cols-4 gap-6">
            {/* View-only shipping fields */}
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">الشركة</p>
              <div className="flex gap-2 bg-gray-50 shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]">
                <LiaTruckSolid size={18} />
                <p className={!localOrder.shippingCompany ? 'text-red-500' : ''}>
                  {localOrder.shippingCompany || '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">المحافظة</p>
              <div className="flex gap-2 bg-gray-50 shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]">
                <LiaMapMarkerAltSolid size={18} />
                <p className={!localOrder.customers.governorate ? 'text-red-500' : ''}>
                  {localOrder.customers.governorate || '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">المنطقة</p>
              <div className="flex gap-2 bg-gray-50 shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]">
                <LiaMapMarkerAltSolid size={18} />
                <p className={!localOrder.customers.city ? 'text-red-500' : ''}>
                  {localOrder.customers.city || '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 md:col-span-4">
              <p className="font-bold text-[#121212]">العنوان بالتفصيل</p>
              <div className="flex gap-2 bg-gray-50 shadow-xs items-start py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000] min-h-[60px]">
                <LiaMapMarkerAltSolid size={18} className="mt-1" />
                <p className={!localOrder.customers.address ? 'text-red-500' : ''}>
                  {localOrder.customers.address || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-[#5D24E1] font-bold text-lg mt-6">بيانات المنتج</h2>
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
            icon={LiaBoxSolid}
            value={localOrder.packagingNotes}
            label="ملاحظه لقسم التغليف"
          />
        </div>
      </div>

      {/* Footer Buttons */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-4 px-6">
        <div className="flex gap-2 justify-center items-center sm:justify-end max-w-7xl mx-auto">
          {/* Arrow Dropdown Button */}
          <div className="relative" ref={arrowDropdownRef}>
            {/* Confirm Button */}
            <div className="flex flex-row gap-2">
              <Button
                variant="default"
                onClick={handleConfirmClick}
                className="py-2 px-10 rounded-2xl bg-[#5D24E1] text-white text-sm font-bold hover:bg-[#4B1BC4] transition-all duration-700 hover:scale-105 flex items-center gap-2"
              >
                <LiaCheckCircle className="w-5 h-5" />
                تأكيد
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsFollowUpDropdownOpen(!isFollowUpDropdownOpen);
                  setIsArrowDropdownOpen(false);
                }}
                className="py-2 px-10 border-2 rounded-2xl border-[#5D24E1] text-[#5D24E1] text-sm font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <LiaCommentDotsSolid className="w-5 h-5" />
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
                <LiaAngleDownSolid className={`w-5 h-5 text-[#5D24E1] transition-all ${isArrowDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Arrow Dropdown Menu */}
            {isArrowDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                {arrowOptions.map((option) => (
                  <Button
                    key={option.action}
                    variant="ghost"
                    onClick={() => handleActionClick(option.label, option.action)}
                    className="w-full px-4 py-3 text-right text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-end"
                  >
                    {option.label}
                    {option.icon}
                  </Button>
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
                  <Button
                    key={option.action}
                    variant="ghost"
                    onClick={() => handleActionClick(option.label, option.action)}
                    className="w-full px-4 py-3 text-right text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-end"
                  >
                    {option.label}
                    {option.icon}
                  </Button>
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

      {/* Edit Shipping Modal */}
      <EditShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onSave={handleSaveShippingData}
        initialData={{
          shippingCompany: localOrder.shippingCompany,
          governorate: localOrder.customers.governorate,
          city: localOrder.customers.city,
          address: localOrder.customers.address,
        }}
      />
    </>
  );
}

export default OrderDetailsInfoComponent;
