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

  const handleTimeChange = async (availableFrom: string, availableTo: string) => {
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
      console.error('Failed to update customer name:', error);
      toast.error('فشل في تحديث اسم العميل');
      throw error;
    }
  };

  return (
    <div className={className}>
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
    </div>
  );
}
