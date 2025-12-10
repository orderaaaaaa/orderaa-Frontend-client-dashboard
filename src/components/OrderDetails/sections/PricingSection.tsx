import React from 'react';
import { LiaFileInvoiceDollarSolid, LiaTruckSolid } from 'react-icons/lia';
import { EditableTextField } from '../fields/EditableTextField';
import { PaymentMethodSelect } from '../fields/PaymentMethodSelect';
import { PaymentStatusSelect } from '../fields/PaymentStatusSelect';
import { Order } from '@/types/orders';

/**
 * Props for PricingSection component
 */
export interface PricingSectionProps {
  order: Order;
  onUpdate: (field: string, value: any) => Promise<Order>;
  className?: string;
}

/**
 * PricingSection Component
 *
 * Displays price and payment information section
 *
 * @param props - Component props
 */
export function PricingSection({ order, onUpdate, className = '' }: PricingSectionProps) {
  return (
    <div className={`flex flex-col justify-start gap-2 ${className}`}>
      <h2 className="text-[#5D24E1] font-semibold">السعر و الدفع</h2>
      <div className="grid grid-col-1 md:grid-cols-4 gap-6">
        <EditableTextField
          label="السعر"
          value={String(order.totalCost)}
          icon={LiaFileInvoiceDollarSolid}
          onSave={async (value) => {
            await onUpdate('totalCost', value);
          }}
        />
        <EditableTextField
          label="سعر الشحن"
          value={order.shippingCost ? String(order.shippingCost) : undefined}
          icon={LiaTruckSolid}
          onSave={async (value) => {
            await onUpdate('shippingCost', value);
          }}
        />
        <PaymentMethodSelect
          value={order.paymentMethod}
          onChange={async (value) => {
            await onUpdate('paymentMethod', value);
          }}
        />
        <PaymentStatusSelect
          value={order.paymentStatus}
          onChange={async (value) => {
            await onUpdate('paymentStatus', value);
          }}
        />
      </div>
    </div>
  );
}
