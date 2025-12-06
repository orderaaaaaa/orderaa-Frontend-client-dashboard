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
  LiaPlusSolid,
  LiaTrashSolid,
} from "react-icons/lia";
import { Order } from "@/types/orders";
import { updateCustomer } from "@/lib/api/order";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import EditShippingModal, { ShippingData } from "./EditShippingModal";
import SimpleConfirmationModal from "./SimpleConfirmationModal";
import BaseModal from "@/components/ui/base-modal";
import {
  UrgentModal,
  CancelOrderModal,
  StopOperationModal,
  PostponeHoursModal,
  PostponeDaysModal,
  AddColorProductModal,
} from "./ActionModals";

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

  // Action modals state
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isStopOperationModalOpen, setIsStopOperationModalOpen] = useState(false);
  const [isPostponeHoursModalOpen, setIsPostponeHoursModalOpen] = useState(false);
  const [isPostponeDaysModalOpen, setIsPostponeDaysModalOpen] = useState(false);
  const [isAddColorProductModalOpen, setIsAddColorProductModalOpen] = useState(false);

  // Simple confirmation modals
  const [isRejectModificationConfirmOpen, setIsRejectModificationConfirmOpen] = useState(false);
  const [isWaitingPaymentConfirmOpen, setIsWaitingPaymentConfirmOpen] = useState(false);

  // Packaging notes modal
  const [isPackagingNotesModalOpen, setIsPackagingNotesModalOpen] = useState(false);
  const [newPackagingNote, setNewPackagingNote] = useState('');

  // Phone number management
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([
    localOrder.customers.phoneNumber,
    ...(localOrder.customers.altPhone ? [localOrder.customers.altPhone] : [])
  ]);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState<number | null>(null);
  const [editingPhoneIndex, setEditingPhoneIndex] = useState<number | null>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  // Time range state
  const [timeFrom, setTimeFrom] = useState<Date | null>(null);
  const [timeTo, setTimeTo] = useState<Date | null>(null);

  const arrowDropdownRef = useRef<HTMLDivElement>(null);
  const followUpDropdownRef = useRef<HTMLDivElement>(null);

  const tagStyle =
    "flex gap-2 bg-white shadow-xs items-center py-2 px-2 rounded-[5px] font-bold text-[15px] text-[#000000]";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (arrowDropdownRef.current && !arrowDropdownRef.current.contains(event.target as Node)) {
        setIsArrowDropdownOpen(false);
        setIsWhatsappAccordionOpen(false);
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

  // State for WhatsApp accordion in dropdown
  const [isWhatsappAccordionOpen, setIsWhatsappAccordionOpen] = useState(false);

  // Follow-up dropdown options
  const followUpOptions = [
    { label: 'لا يرد', action: 'no_answer', icon: <LiaPhoneSlashSolid className="w-5 h-5" /> },
    { label: 'مغلق', action: 'closed', icon: <LiaLockSolid className="w-5 h-5" /> },
    { label: 'مش بيجمع', action: 'not_collecting', icon: <LiaBanSolid className="w-5 h-5" /> },
    { label: 'فتح و قفل', action: 'open_close', icon: <LiaExchangeAltSolid className="w-5 h-5" /> },
  ];

  // Arrow dropdown options
  const arrowOptions = [
    { label: 'مستعجل', action: 'urgent', icon: <LiaBoltSolid className="w-5 h-5" />, hasSubOptions: false },
    { label: 'الغاء', action: 'cancel', icon: <LiaBanSolid className="w-5 h-5" />, hasSubOptions: false },
    { label: 'رفض التعديل', action: 'reject_modification', icon: <LiaTimesCircleSolid className="w-5 h-5" />, hasSubOptions: false },
    { label: 'تأجيل ساعات', action: 'postpone_hours', icon: <LiaHourglassSolid className="w-5 h-5" />, hasSubOptions: false },
    { label: 'تأجيل أيام', action: 'postpone_days', icon: <LiaCalendarAltSolid className="w-5 h-5" />, hasSubOptions: false },
    {
      label: 'متابعة واتساب',
      action: 'whatsapp_followup',
      icon: <LiaWhatsapp className="w-5 h-5" />,
      hasSubOptions: true,
      subOptions: [
        { label: 'إرسال صورة على الطبيعة', action: 'send_natural_image' },
        { label: 'إرسال فيديو على الطبيعة', action: 'send_natural_video' },
        { label: 'إرسال صور بروفيشنال', action: 'send_professional_images' },
        { label: 'إرسال صور لون معين بروفيشنال', action: 'send_professional_color' },
        { label: 'إرسال صورة لون معين على الطبيعة', action: 'send_natural_color' },
      ]
    },
    { label: 'وقف التشغيل', action: 'stop_operation', icon: <LiaStopCircleSolid className="w-5 h-5" />, hasSubOptions: false },
    { label: 'في انتظار الدفع', action: 'waiting_payment', icon: <LiaLockSolid className="w-5 h-5" />, hasSubOptions: false },
  ];


  const handleActionClick = (label: string, action: string, hasSubOptions?: boolean) => {
    // If it has sub-options (WhatsApp), toggle accordion instead of closing dropdown
    if (hasSubOptions && action === 'whatsapp_followup') {
      setIsWhatsappAccordionOpen(!isWhatsappAccordionOpen);
      return;
    }

    setIsArrowDropdownOpen(false);
    setIsWhatsappAccordionOpen(false);

    // Handle different actions
    switch (action) {
      case 'urgent':
        setIsUrgentModalOpen(true);
        break;
      case 'cancel':
        setIsCancelModalOpen(true);
        break;
      case 'stop_operation':
        setIsStopOperationModalOpen(true);
        break;
      case 'reject_modification':
        setIsRejectModificationConfirmOpen(true);
        break;
      case 'postpone_hours':
        setIsPostponeHoursModalOpen(true);
        break;
      case 'postpone_days':
        setIsPostponeDaysModalOpen(true);
        break;
      case 'waiting_payment':
        setIsWaitingPaymentConfirmOpen(true);
        break;
      default:
        // Fallback to old confirmation dialog
        setConfirmationDialog({
          isOpen: true,
          title: `تأكيد ${label}`,
          message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
          action,
        });
    }
  };

  const handleWhatsappSubOptionClick = (action: string, label: string) => {
    setIsArrowDropdownOpen(false);
    setIsWhatsappAccordionOpen(false);

    // Handle color image requests - open color selection modal
    if (action === 'send_professional_color' || action === 'send_natural_color') {
      setIsAddColorProductModalOpen(true);
    } else {
      // For all other WhatsApp options, open confirmation dialog
      setConfirmationDialog({
        isOpen: true,
        title: `تأكيد ${label}`,
        message: `هل أنت متأكد من ${label} للعميل عبر واتساب؟`,
        action: action,
      });
    }
  };

  const handleFollowUpClick = (label: string, action: string) => {
    setIsFollowUpDropdownOpen(false);
    setConfirmationDialog({
      isOpen: true,
      title: `تأكيد ${label}`,
      message: `هل أنت متأكد من ${label} لهذا الطلب؟`,
      action: action,
    });
  };

  const handleConfirmAction = () => {
    // TODO: Add API call to update order status based on confirmationDialog.action
    console.log('Confirmed action:', confirmationDialog.action);
    // You can add API call here based on the action
  };

  // Handler functions for each action modal
  const handleUrgentConfirm = (data: { shippingCompany?: string; urgentDate: string }) => {
    console.log('Urgent order confirmed:', data);
    // TODO: Add API call to mark order as urgent
    setIsUrgentModalOpen(false);
  };

  const handleCancelOrderConfirm = (data: { reason: string; notes: string }) => {
    console.log('Order cancelled:', data);
    // TODO: Add API call to cancel order
    setIsCancelModalOpen(false);
  };

  const handleStopOperationConfirm = (notes: string) => {
    console.log('Operation stopped:', notes);
    // TODO: Add API call to stop operation
    setIsStopOperationModalOpen(false);
  };

  const handlePostponeHoursConfirm = (data: { duration?: '30min' | '1hour' | '2hours'; time?: Date }) => {
    console.log('Order postponed:', data);
    // TODO: Add API call to postpone order by hours/duration
    setIsPostponeHoursModalOpen(false);
  };

  const handlePostponeDaysConfirm = (data: { duration?: '1day' | '2days' | '3days' | 'week'; date?: Date }) => {
    console.log('Order postponed:', data);
    // TODO: Add API call to postpone order by days/duration
    setIsPostponeDaysModalOpen(false);
  };


  const handleAddColorProductConfirm = (color: string) => {
    console.log('Color product selected:', color);
    // TODO: Add logic to send color image via WhatsApp
    setIsAddColorProductModalOpen(false);
  };

  const handleRejectModificationConfirm = () => {
    console.log('Modification rejected');
    // TODO: Add API call to reject modification
    setIsRejectModificationConfirmOpen(false);
  };

  const handleWaitingPaymentConfirm = () => {
    console.log('Waiting for payment');
    // TODO: Add API call to mark order as waiting for payment
    setIsWaitingPaymentConfirmOpen(false);
  };

  const handleConfirmClick = () => {
    setConfirmationDialog({
      isOpen: true,
      title: 'تأكيد الطلب',
      message: 'هل أنت متأكد من تأكيد هذا الطلب؟',
      action: 'confirm',
    });
  };

  // Payment method options
  const paymentMethodOptions = [
    { value: 'كاش', label: 'كاش' },
    { value: 'فيزا', label: 'فيزا' },
    { value: 'انستا باي', label: 'انستا باي' },
    { value: 'محفظة الكترونيه', label: 'محفظة الكترونيه' },
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: 'دفع عند الاستلام', label: 'دفع عند الاستلام' },
    { value: 'مدفوع', label: 'مدفوع' },
  ];

  // Phone number handlers
  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleAddPhone = () => {
    setNewPhoneNumber('');
    setEditingPhoneIndex(phoneNumbers.length);
    setIsPhoneDropdownOpen(null);
  };

  const handleEditPhone = (index: number) => {
    setNewPhoneNumber(phoneNumbers[index]);
    setEditingPhoneIndex(index);
    setIsPhoneDropdownOpen(null);
  };

  const handleRemovePhone = async (index: number) => {
    const updatedPhones = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(updatedPhones);

    // Update customer with new phone numbers
    try {
      await updateCustomer(localOrder.customers.id, {
        phoneNumber: updatedPhones[0] || '',
        altPhone: updatedPhones[1] || undefined,
      });

      const updatedOrder = {
        ...localOrder,
        customers: {
          ...localOrder.customers,
          phoneNumber: updatedPhones[0] || '',
          altPhone: updatedPhones[1] || undefined,
        },
      };
      setLocalOrder(updatedOrder);
      if (onCustomerUpdate) {
        onCustomerUpdate(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to update phone numbers:', error);
    }
  };

  const handleSavePhone = async () => {
    if (!newPhoneNumber.trim()) return;

    const updatedPhones = [...phoneNumbers];
    if (editingPhoneIndex !== null) {
      if (editingPhoneIndex >= phoneNumbers.length) {
        // Adding new phone
        updatedPhones.push(newPhoneNumber);
      } else {
        // Editing existing phone
        updatedPhones[editingPhoneIndex] = newPhoneNumber;
      }
    }

    setPhoneNumbers(updatedPhones);
    setEditingPhoneIndex(null);
    setNewPhoneNumber('');

    // Update customer with new phone numbers
    try {
      await updateCustomer(localOrder.customers.id, {
        phoneNumber: updatedPhones[0] || '',
        altPhone: updatedPhones[1] || undefined,
      });

      const updatedOrder = {
        ...localOrder,
        customers: {
          ...localOrder.customers,
          phoneNumber: updatedPhones[0] || '',
          altPhone: updatedPhones[1] || undefined,
        },
      };
      setLocalOrder(updatedOrder);
      if (onCustomerUpdate) {
        onCustomerUpdate(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to update phone numbers:', error);
    }
  };

  const handleCancelPhoneEdit = () => {
    setEditingPhoneIndex(null);
    setNewPhoneNumber('');
  };

  // Packaging notes handler
  const handleAddPackagingNote = async () => {
    if (!newPackagingNote.trim()) return;

    const updatedNotes = localOrder.packagingNotes
      ? `${localOrder.packagingNotes}\n${newPackagingNote}`
      : newPackagingNote;

    const updatedOrder = {
      ...localOrder,
      packagingNotes: updatedNotes,
    };
    setLocalOrder(updatedOrder);
    setNewPackagingNote('');
    setIsPackagingNotesModalOpen(false);

    if (onCustomerUpdate) {
      onCustomerUpdate(updatedOrder);
    }
  };

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
    icon?: any;
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
        <div className={`${tagStyle} relative overflow-hidden`}>
          {Icon && <Icon size={18} />}
          {isEditing ? (
            <>
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1 border border-[#5D24E1] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D24E1] min-w-0 max-w-full"
                autoFocus
                style={{ maxWidth: 'calc(100% - 60px)' }}
              />
              <div className="flex gap-1 flex-shrink-0">
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
              <div className="w-full flex items-start justify-between min-w-0">
                <p className={`${isEmpty ? 'text-red-500' : ''} truncate flex-1 min-w-0`}>{displayValue}</p>
                <button
                  onClick={() => handleStartEdit(field, value)}
                  className="cursor-pointer p-1 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
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

            {/* <EditableField
              field="shippingCompany"
              icon={LiaTruckSolid}
              value={localOrder.shippingCompany}
              label="شركة الشحن"
            /> */}

            {/* <EditableField
              field="city"
              icon={LiaMapMarkerAltSolid}
              value={localOrder.customers.city}
              label="المدينة"
            /> */}

            {/* <EditableField
              field="governorate"
              icon={LiaMapMarkerAltSolid}
              value={localOrder.customers.governorate}
              label="المحافظة"
            /> */}

            {/* Time Range */}
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">الوقت</p>
              <div className={`${tagStyle} relative`}>
                <LiaClockSolid size={18} />
                <div className="flex items-center gap-2 flex-1">
                  <DatePicker
                    selected={timeFrom}
                    onChange={setTimeFrom}
                    placeholder="من"
                    showTimeSelect={true}
                    showTimeSelectOnly={true}
                    dateFormat="h:mm aa"
                    timeCaption="الوقت"
                    showIcon={false}
                    className="flex-1 border-none shadow-none bg-transparent p-0 h-auto font-bold text-[15px] text-[#000000]"
                  />
                  <span className="text-[#5F5E5E]">-</span>
                  <DatePicker
                    selected={timeTo}
                    onChange={setTimeTo}
                    placeholder="إلى"
                    showTimeSelect={true}
                    showTimeSelectOnly={true}
                    dateFormat="h:mm aa"
                    timeCaption="الوقت"
                    showIcon={false}
                    className="flex-1 border-none shadow-none bg-transparent p-0 h-auto font-bold text-[15px] text-[#000000]"
                  />
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-[#121212]">أرقام الهاتف</p>
              <div className="space-y-2">
                {phoneNumbers.map((phone, index) => (
                  <div key={index} className="relative" ref={index === 0 ? phoneDropdownRef : null}>
                    {editingPhoneIndex === index ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="tel"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          className="flex-1 border border-[#5D24E1] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D24E1]"
                          autoFocus
                        />
                        <button
                          onClick={handleSavePhone}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                        >
                          <LiaCheckSolid className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={handleCancelPhoneEdit}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <LiaTimesSolid className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <div className={`${tagStyle} relative`}>
                        <LiaPhoneSolid size={18} />
                        <button
                          onClick={() => handlePhoneCall(phone)}
                          className="flex-1 text-right hover:text-[#5D24E1] transition-colors"
                        >
                          {phone}
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setIsPhoneDropdownOpen(isPhoneDropdownOpen === index ? null : index)}
                            className="p-1 hover:bg-purple-100 rounded transition-colors"
                          >
                            <LiaEditSolid className="w-4 h-4 text-[#5D24E1]" />
                          </button>
                          {isPhoneDropdownOpen === index && (
                            <div className="absolute bottom-full mb-2 right-0 min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50" dir="rtl">
                              <button
                                onClick={() => handlePhoneCall(phone)}
                                className="w-full px-4 py-2 text-right text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 justify-start"
                              >
                                <LiaPhoneSolid className="w-4 h-4" />
                                اتصال
                              </button>
                              <button
                                onClick={() => handleEditPhone(index)}
                                className="w-full px-4 py-2 text-right text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 justify-start"
                              >
                                <LiaEditSolid className="w-4 h-4" />
                                تعديل
                              </button>
                              {phoneNumbers.length > 1 && (
                                <button
                                  onClick={() => handleRemovePhone(index)}
                                  className="w-full px-4 py-2 text-right text-sm hover:bg-red-50 transition-colors flex items-center gap-2 justify-start text-red-600"
                                >
                                  <LiaTrashSolid className="w-4 h-4" />
                                  حذف
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {editingPhoneIndex === phoneNumbers.length && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="tel"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                      className="flex-1 border border-[#5D24E1] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#5D24E1]"
                      autoFocus
                    />
                    <button
                      onClick={handleSavePhone}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <LiaCheckSolid className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={handleCancelPhoneEdit}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <LiaTimesSolid className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
                {editingPhoneIndex !== phoneNumbers.length && (
                  <button
                    onClick={handleAddPhone}
                    className="flex items-center gap-2 text-[#5D24E1] text-sm font-bold hover:text-[#4B1BC4] transition-colors"
                  >
                    <LiaPlusSolid className="w-4 h-4" />
                    إضافة رقم هاتف
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-4">
              <EditableField
                field="notes"
                // icon={LiaCommentDotsSolid}
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
            {/* Payment Method Dropdown */}
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">طريقة الدفع</p>
              <div className={`${tagStyle} relative`}>
                <LiaCreditCardSolid size={18} />
                <Select
                  value={localOrder.paymentMethod || ''}
                  onValueChange={async (value) => {
                    const updatedOrder = {
                      ...localOrder,
                      paymentMethod: value,
                    };
                    setLocalOrder(updatedOrder);
                    if (onCustomerUpdate) {
                      onCustomerUpdate(updatedOrder);
                    }
                  }}
                >
                  <SelectTrigger className="w-full border-none shadow-none h-auto p-0 bg-transparent">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Status Dropdown */}
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#121212]">حالة الدفع</p>
              <div className={`${tagStyle} relative`}>
                <LiaMoneyBillWaveSolid size={18} />
                <Select
                  value={localOrder.paymentStatus || ''}
                  onValueChange={async (value) => {
                    const updatedOrder = {
                      ...localOrder,
                      paymentStatus: value,
                    };
                    setLocalOrder(updatedOrder);
                    if (onCustomerUpdate) {
                      onCustomerUpdate(updatedOrder);
                    }
                  }}
                >
                  <SelectTrigger className="w-full border-none shadow-none h-auto p-0 bg-transparent">
                    <SelectValue placeholder="اختر حالة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white pt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#5D24E1] font-bold text-lg">بيانات الشحن</h2>
            <Button
              variant="ghost"
              onClick={() => setIsShippingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#5D24E1] rounded-lg hover:bg-purple-50 transition-colors font-bold"
            >
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

        {/* Packaging Notes Section */}
        <div className="flex flex-col gap-2 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-[#5D24E1] font-bold text-lg">ملاحظات التغليف</h2>
            <Button
              variant="ghost"
              onClick={() => setIsPackagingNotesModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#5D24E1] rounded-lg hover:bg-purple-50 transition-colors font-bold"
            >
              <LiaPlusSolid className="w-4 h-4" />
              إضافة ملاحظة
            </Button>
          </div>
          {localOrder.packagingNotes && (
            <div className={`${tagStyle} min-h-[60px]`}>
              <LiaBoxSolid size={18} />
              <p className="flex-1 whitespace-pre-wrap">{localOrder.packagingNotes}</p>
            </div>
          )}
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
                  if (!isArrowDropdownOpen) {
                    setIsWhatsappAccordionOpen(false);
                  }
                }}
                className="w-9 h-9 p-0 rounded-full border-2 border-[#5D24E1] hover:bg-purple-50 transition-colors"
              >
                <LiaAngleDownSolid className={`w-5 h-5 text-[#5D24E1] transition-all ${isArrowDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Follow-up Dropdown Menu */}
            {isFollowUpDropdownOpen && (
              <div className="absolute bottom-full mb-2 right-0 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50" dir="rtl">
                {followUpOptions.map((option) => (
                  <Button
                    key={option.action}
                    variant="ghost"
                    onClick={() => handleFollowUpClick(option.label, option.action)}
                    className="w-full px-4 py-3 text-right text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-start"
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Arrow Dropdown Menu */}
            {isArrowDropdownOpen && (
              <div className="absolute bottom-full mb-2 right-0 min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50" dir="rtl">
                {arrowOptions.map((option) => (
                  <div key={option.action}>
                    {/* Main Option Button */}
                    <Button
                      variant="ghost"
                      onClick={() => handleActionClick(option.label, option.action, option.hasSubOptions)}
                      className="w-full px-4 py-3 text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-start"
                    >
                      <div className="flex flex-row items-center justify-between gap-2 w-full">
                        <div className="flex flex-row items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                        <div className="">
                          {option.hasSubOptions && (
                            <LiaAngleDownSolid
                              className={`w-4 h-4 transition-transform ${isWhatsappAccordionOpen && option.action === 'whatsapp_followup' ? 'rotate-180' : ''
                                }`}
                            />
                          )}
                        </div>
                      </div>
                    </Button>

                    {/* Sub-options Accordion */}
                    {option.hasSubOptions && option.subOptions && isWhatsappAccordionOpen && option.action === 'whatsapp_followup' && (
                      <div className="bg-white " dir="rtl">
                        {option.subOptions.map((subOption) => (
                          <button
                            key={subOption.action}
                            onClick={() => handleWhatsappSubOptionClick(subOption.action, subOption.label)}
                            className="w-full px-8 py-2.5 text-right text-xs cursor-pointer hover:bg-purple-50 transition-colors flex items-center justify-start"
                          >
                            {subOption.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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

      {/* Action Modals */}
      <UrgentModal
        isOpen={isUrgentModalOpen}
        onClose={() => setIsUrgentModalOpen(false)}
        onConfirm={handleUrgentConfirm}
      />

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrderConfirm}
      />

      <StopOperationModal
        isOpen={isStopOperationModalOpen}
        onClose={() => setIsStopOperationModalOpen(false)}
        onConfirm={handleStopOperationConfirm}
      />

      <PostponeHoursModal
        isOpen={isPostponeHoursModalOpen}
        onClose={() => setIsPostponeHoursModalOpen(false)}
        onConfirm={handlePostponeHoursConfirm}
      />

      <PostponeDaysModal
        isOpen={isPostponeDaysModalOpen}
        onClose={() => setIsPostponeDaysModalOpen(false)}
        onConfirm={handlePostponeDaysConfirm}
      />

      <AddColorProductModal
        isOpen={isAddColorProductModalOpen}
        onClose={() => setIsAddColorProductModalOpen(false)}
        onSave={handleAddColorProductConfirm}
        currentProductColors={localOrder.order_products?.map(op => op.products.color).filter(Boolean) as string[]}
      />

      {/* Simple Confirmation Modals */}
      <SimpleConfirmationModal
        isOpen={isRejectModificationConfirmOpen}
        onClose={() => setIsRejectModificationConfirmOpen(false)}
        onConfirm={handleRejectModificationConfirm}
        title="رفض التعديل"
        message="هل أنت متأكد من رفض التعديل لهذا الطلب؟"
      />

      <SimpleConfirmationModal
        isOpen={isWaitingPaymentConfirmOpen}
        onClose={() => setIsWaitingPaymentConfirmOpen(false)}
        onConfirm={handleWaitingPaymentConfirm}
        title="في انتظار الدفع"
        message="هل أنت متأكد من تحديد الطلب كـ في انتظار الدفع؟"
      />

      {/* Packaging Notes Modal */}
      <BaseModal
        isOpen={isPackagingNotesModalOpen}
        onClose={() => {
          setIsPackagingNotesModalOpen(false);
          setNewPackagingNote('');
        }}
        title="إضافة ملاحظة للتغليف"
        onConfirm={handleAddPackagingNote}
        confirmText="حفظ"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[#1F1F1F]">الملاحظة</label>
            <textarea
              value={newPackagingNote}
              onChange={(e) => setNewPackagingNote(e.target.value)}
              placeholder="أدخل ملاحظة للتغليف..."
              className="w-full border border-[#ECECEC] rounded-lg px-4 py-3 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
            />
          </div>
        </div>
      </BaseModal>
    </>
  );
}

export default OrderDetailsInfoComponent;
