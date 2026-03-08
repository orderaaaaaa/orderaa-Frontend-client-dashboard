import React, { useState } from 'react';
import { LiaUserSolid } from 'react-icons/lia';
import { EditableTextField } from '../fields/EditableTextField';
import { PhoneNumberList } from '../fields/PhoneNumberList';
import { TimeRangeField } from '../fields/TimeRangeField';
import { Order } from '@/types/orders';
import { useUpdateCustomer } from '@/services/orders';
import { toast } from 'react-toastify';
import { If, Then } from 'react-if';
import { MdBlock } from 'react-icons/md';
import BaseModal from '@/components/ui/base-modal';

export interface CustomerDataSectionProps {
  order: Order;
  onUpdate: (field: string, value: any) => Promise<Order>;
  onPhoneUpdate?: (phoneNumbers: string[]) => void;
  className?: string;
}

export function CustomerDataSection({
  order,
  onUpdate,
  onPhoneUpdate,
  className = '',
}: CustomerDataSectionProps) {
  const updateCustomerMutation = useUpdateCustomer();
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const handleTimeChange = async (
    availableFrom: string,
    availableTo: string
  ) => {
    await onUpdate('availableTime', { availableFrom, availableTo });
  };

  const handleCustomerNameUpdate = async (name: string) => {
    try {
      await updateCustomerMutation.mutateAsync({
        customerId: order.customers.id,
        data: { name },
      });

      toast.success('تم تحديث اسم العميل بنجاح');
    } catch (error) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as any).response?.data?.message
          : null;
      toast.error(message || 'فشل في تحديث اسم العميل');
      throw error;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-3 left-3">
        <If condition={order.customers.isBlocked}>
          <Then>
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="flex items-center gap-1 p-1 px-3 bg-[#f4e2e2] border-2 border-[#eed0d1] rounded-sm cursor-pointer hover:bg-[#f0d4d4] transition-colors"
            >
              <MdBlock size={18} className="text-[#dc0201]" />
              <span className="text-[#dc0201] text-sm lg:text-base font-medium">
                العميل محظور
              </span>
            </button>
          </Then>
        </If>
      </div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-primary font-semibold">بيانات العميل</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EditableTextField
          label="اسم العميل"
          value={order.customers.name}
          icon={LiaUserSolid}
          onSave={handleCustomerNameUpdate}
        />

        <TimeRangeField
          timeFrom={order.availableFrom || order.timeFrom}
          timeTo={order.availableTo || order.timeTo}
          onTimeChange={handleTimeChange}
        />

        <PhoneNumberList
          customerId={order.customers.id}
          orderId={order.id}
          phoneNumbers={order.customers.phone_numbers}
          onUpdate={onPhoneUpdate}
        />

        <div className="md:col-span-4">
          <EditableTextField
            label="ملاحظات"
            value={order.notes}
            onSave={async (value) => {
              await onUpdate('notes', value);
            }}
            multiline
          />
        </div>
      </div>

      <BaseModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title="ملاحظات العميل"
        showFooter={false}
      >
        <div className="flex flex-col gap-3">
          {order.customers.notes && (Array.isArray(order.customers.notes) ? order.customers.notes.length > 0 : order.customers.notes.trim().length > 0) ? (
            Array.isArray(order.customers.notes) ? (
              order.customers.notes.map((note, index) => (
                <p key={index} className="text-base text-[#1F1F1F] whitespace-pre-wrap">{note}</p>
              ))
            ) : (
              <p className="text-base text-[#1F1F1F] whitespace-pre-wrap">{order.customers.notes}</p>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <MdBlock size={40} className="text-gray-300" />
              <p className="text-base text-gray-400">لا توجد ملاحظات لهذا العميل</p>
            </div>
          )}
        </div>
      </BaseModal>
    </div>
  );
}
