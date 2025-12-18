import React from 'react';
import { LiaUserSolid } from 'react-icons/lia';
import { EditableTextField } from '../fields/EditableTextField';
import { PhoneNumberList } from '../fields/PhoneNumberList';
import { TimeRangeField } from '../fields/TimeRangeField';
import { Order } from '@/types/orders';
import { useUpdateCustomer } from '@/services/orders';
import { toast } from 'react-toastify';

export interface CustomerDataSectionProps {
  order: Order;
  onUpdate: (field: string, value: any) => Promise<Order>;
  onPhoneUpdate?: (phoneNumber: string, altPhone?: string) => void;
  className?: string;
}

export function CustomerDataSection({
  order,
  onUpdate,
  onPhoneUpdate,
  className = '',
}: CustomerDataSectionProps) {
  const updateCustomerMutation = useUpdateCustomer();

  const handleTimeFromChange = async (time: string) => {
    await onUpdate('timeFrom', time);
  };

  const handleTimeToChange = async (time: string) => {
    await onUpdate('timeTo', time);
  };

  const handleCustomerNameUpdate = async (name: string) => {
    try {
      await updateCustomerMutation.mutateAsync({
        customerId: order.customers.id,
        data: { name },
      });

      toast.success('تم تحديث اسم العميل بنجاح');
    } catch (error) {
      console.error('Failed to update customer name:', error);
      toast.error('فشل في تحديث اسم العميل');
      throw error;
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[#5D24E1] font-semibold">بيانات العميل</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        <EditableTextField
          label="اسم العميل"
          value={order.customers.name}
          icon={LiaUserSolid}
          onSave={handleCustomerNameUpdate}
        />

        <TimeRangeField
          timeFrom={order.timeFrom}
          timeTo={order.timeTo}
          onTimeFromChange={handleTimeFromChange}
          onTimeToChange={handleTimeToChange}
        />

        <PhoneNumberList
          customerId={order.customers.id}
          orderId={order.id}
          phoneNumber={order.customers.phoneNumber}
          altPhone={order.customers.altPhone}
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
    </div>
  );
}
