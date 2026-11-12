import React from 'react';
import { LiaFileInvoiceDollarSolid, LiaTruckSolid } from 'react-icons/lia';
import { z } from 'zod';
import { EditableTextField } from '../fields/EditableTextField';
import { PaymentMethodSelect } from '../fields/PaymentMethodSelect';
import { PaymentStatusSelect } from '../fields/PaymentStatusSelect';
import { ShippingTypeSelect } from '../fields/ShippingTypeSelect';
import { Order, OrderStatus, paymentStatusShown } from '@/types/orders';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE } from '@/types/shippingCompanies';
import { useI18n } from '@/i18n/I18nProvider';
import { ORDER_FIELD_LABELS } from '@/constants/orderFieldLabels';
import { PrepaidBadge } from '@/components/orders/PrepaidBadge';

// Validation schema for price fields - only numbers allowed
const priceSchema = z.string().refine(
  (val) => val === '' || /^\d*\.?\d*$/.test(val),
  { message: 'يجب إدخال أرقام فقط' }
);

const returnContentSchema = z.string().refine((v) => v.trim() !== '', 'اكتب محتوى شحنة المرتجع.');

const prepaidSchema = z.string().refine(
  (val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val),
  { message: 'أدخل مبلغاً صحيحاً بحد أقصى رقمين عشريين' }
);

const returnPriceSchema = z.string().refine(
  (val) => /^\d+(\.\d{1,2})?$/.test(val),
  { message: 'أدخل مبلغاً صحيحاً بحد أقصى رقمين عشريين' }
);

/**
 * Props for PricingSection component
 */
export interface PricingSectionProps {
  order: Order;
  onUpdate: (field: string, value: any) => Promise<Order>;
  onShippingTypeSelect?: (value: string) => void;
  pendingShippingType?: string | null;
  onSaveReturnContent?: (content: string) => Promise<void>;
  isCustomerReturn?: boolean;
  className?: string;
  readOnly?: boolean;
  fieldsReadOnly?: boolean;
}

/**
 * PricingSection Component
 *
 * Displays price and payment information section
 *
 * @param props - Component props
 */
export function PricingSection({
  order,
  onUpdate,
  onShippingTypeSelect,
  pendingShippingType,
  onSaveReturnContent,
  isCustomerReturn = false,
  className = '',
  readOnly = false,
  fieldsReadOnly = false,
}: PricingSectionProps) {
  // Every field here saves through PATCH /orders/:id (`orders:update`).
  const { hasPermission } = usePermissionCheck();
  const canEdit = hasPermission(PERMISSION_CODES.ORDERS_UPDATE) && !readOnly;
  const canEditFields = canEdit && !fieldsReadOnly;
  const priceLocked = order.shippingCompanyRef?.carrierSupportsUpdate === false;
  const returnPriceEditable =
    canEdit &&
    order.status !== OrderStatus.RETURNED_FINAL &&
    order.status !== OrderStatus.CANCELLED;
  const { t } = useI18n();

  // T8. Every amount is a decimal string from the API and is rendered as-is —
  // parsing it into a number to do arithmetic here would put money through a
  // float, and would also let this page disagree with the order card.
  const shippingDeduction = order.shippingCost ? String(order.shippingCost) : '0';

  return (
    <div className={`flex flex-col justify-start gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <h2 className="text-primary-text font-semibold">السعر و الدفع</h2>
        <PrepaidBadge prepaid={order.prepaid} />
      </div>
      {order.paidWithoutAmount && (
        <p className="text-xs text-muted-foreground">{t('prepaid.paidWithoutAmount')}</p>
      )}

      {order.isCollected && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-gray-200 bg-gray-50/70 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">المبلغ المحصل</span>
            <span className="text-sm font-bold text-gray-900">
              {order.collectedAmount} جنيه
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500">المبلغ المورد</span>
            <span className="text-sm font-bold text-green-700">
              {order.suppliedAmount} جنيه
            </span>
            {/* The 900 → 800 arithmetic stays legible instead of being a bare
                number. A zero deduction is stated rather than implied. */}
            <span className="text-[11px] text-gray-500">
              {order.collectedAmount} − {shippingDeduction} (شحن)
            </span>
          </div>

          {(order.prepaid ? order.prepaid.state === 'PARTIAL' : order.isPartiallyPaid) && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              مدفوع جزئياً — ما زال هناك مبلغ مستحق
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {isCustomerReturn && (
          <EditableTextField
            label={ORDER_FIELD_LABELS.returnPrice}
            value={order.returnPrice ?? undefined}
            icon={LiaFileInvoiceDollarSolid}
            inputType="number"
            validationSchema={returnPriceSchema}
            onSave={async (value) => {
              await onUpdate('returnPrice', Number(value));
            }}
            canEdit={returnPriceEditable}
          />
        )}
        <EditableTextField
          label="السعر"
          value={String(order.totalCost)}
          icon={LiaFileInvoiceDollarSolid}
          inputType="number"
          validationSchema={priceSchema}
          onSave={async (value) => {
            await onUpdate('totalCost', Number(value));
          }}
          canEdit={canEditFields && !priceLocked && !isCustomerReturn}
          readOnlyReason={priceLocked ? CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE : undefined}
        />
        <EditableTextField
          label={ORDER_FIELD_LABELS.prepaidAmount}
          value={order.prepaidAmount ?? undefined}
          icon={LiaFileInvoiceDollarSolid}
          inputType="number"
          validationSchema={prepaidSchema}
          onSave={async (value) => {
            await onUpdate('prepaidAmount', value === '' ? null : Number(value));
          }}
          canEdit={canEditFields && !priceLocked && !isCustomerReturn}
          readOnlyReason={priceLocked ? CARRIER_UPDATE_NOT_SUPPORTED_MESSAGE : undefined}
        />
        <EditableTextField
          label="سعر الشحن"
          value={order.shippingCost ? String(order.shippingCost) : undefined}
          icon={LiaTruckSolid}
          inputType="number"
          validationSchema={priceSchema}
          onSave={async (value) => {
            await onUpdate('shippingCost', Number(value));
          }}
          canEdit={canEditFields && !isCustomerReturn}
        />
        <ShippingTypeSelect
          value={pendingShippingType || order.shippingType}
          onChange={(value) => {
            if (onShippingTypeSelect) {
              onShippingTypeSelect(value);
            } else {
              onUpdate('shippingType', value);
            }
          }}
          canEdit={canEditFields}
        />
        {(() => {
          const effectiveType = pendingShippingType ?? order.shippingType;
          return effectiveType && effectiveType !== 'DELIVERY';
        })() && (
          <EditableTextField
            label="محتوى شحنة الاسترجاع"
            value={order.returnShipmentContent ?? undefined}
            inputType="text"
            validationSchema={returnContentSchema}
            onSave={async (value) => {
              if (onSaveReturnContent) {
                await onSaveReturnContent(value);
              } else {
                await onUpdate('returnShipmentContent', value);
              }
            }}
            canEdit={canEditFields}
          />
        )}
        <PaymentMethodSelect
          value={order.paymentMethod}
          onChange={async (value) => {
            await onUpdate('paymentMethod', value);
          }}
          canEdit={canEditFields && !isCustomerReturn}
        />
        <PaymentStatusSelect
          value={paymentStatusShown(order.prepaid, order.paymentStatus)}
          onChange={async (value) => {
            await onUpdate('paymentStatus', value);
          }}
          canEdit={false}
        />
      </div>
    </div>
  );
}
