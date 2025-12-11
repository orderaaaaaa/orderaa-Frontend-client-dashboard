import React, { useState } from 'react';
import { LiaUserSolid } from 'react-icons/lia';
import { EditableTextField } from '../fields/EditableTextField';
import { PhoneNumberList } from '../fields/PhoneNumberList';
import { TimeRangeField } from '../fields/TimeRangeField';
import { Order } from '@/types/orders';


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
  const [timeFrom, setTimeFrom] = useState<Date | null>(null);
  const [timeTo, setTimeTo] = useState<Date | null>(null);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[#5D24E1] font-semibold">بيانات العميل</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EditableTextField
          label="اسم العميل"
          value={order.customers.name}
          icon={LiaUserSolid}
          onSave={async (value) => {
            await onUpdate('customers.name', value);
          }}
        />

        <TimeRangeField
          timeFrom={timeFrom}
          timeTo={timeTo}
          onTimeFromChange={setTimeFrom}
          onTimeToChange={setTimeTo}
        />

        <PhoneNumberList
          customerId={order.customers.id}
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
