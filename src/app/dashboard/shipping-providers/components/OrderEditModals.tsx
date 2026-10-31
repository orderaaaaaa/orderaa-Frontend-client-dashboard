'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import EditShippingModal, { type ShippingData } from '@/components/OrderDetails/EditShippingModal';
import {
  CUSTOMER_PHONE_INVALID_CODE,
  CUSTOMER_PHONE_TAKEN_CODE,
  customerPhoneErrorCodeOf,
  useAddShipmentCustomerPhone,
  useUpdateShipmentAddress,
  useUpdateShipmentPrice,
  useUpdateShipmentReturnCost,
} from '@/services/shippingProviders';
import type { ShipmentAddressBody, ShipmentRowBase } from '@/types/shippingProviders';

export type OrderEditKind = 'address' | 'price' | 'returnCost' | 'phone';

const PRICE_PATTERN = /^\d*\.?\d*$/;
const LIGHT_PHONE_PATTERN = /^\+?\d+$/;

const PHONE_ERROR_MESSAGES: Record<string, string> = {
  [CUSTOMER_PHONE_TAKEN_CODE]: 'هذا الرقم مسجل لعميل آخر',
  [CUSTOMER_PHONE_INVALID_CODE]: 'رقم الهاتف غير صالح',
};

const normalizePhoneInput = (raw: string): string =>
  raw
    .trim()
    .replace(/[\s-]/g, '')
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0));

interface OrderEditModalProps {
  kind: OrderEditKind;
  orderId: number;
  shippingCompanyId: number;
  row: ShipmentRowBase;
  carrierSupportsUpdate: boolean | undefined;
  onClose: () => void;
}

const shippingDataOf = (row: ShipmentRowBase, shippingCompanyId: number): ShippingData => ({
  shippingCompanyId,
  governorate: row.governorate ?? undefined,
  city: row.city ?? undefined,
  governorateOption: row.governorateOption,
  cityOption: row.cityOption,
  address: row.address ?? undefined,
  returnShippingCost: row.returnShippingCost ?? undefined,
  availableFrom: row.availableFrom ?? undefined,
  availableTo: row.availableTo ?? undefined,
});

const addressBodyOf = (data: ShippingData, row: ShipmentRowBase): ShipmentAddressBody => {
  const pickChanged =
    (data.governorateOption ?? null) !== (row.governorateOption ?? null) ||
    (data.cityOption ?? null) !== (row.cityOption ?? null);
  return {
    ...(pickChanged && data.governorateOption
      ? {
          governorateOption: data.governorateOption,
          ...(data.cityOption ? { cityOption: data.cityOption } : {}),
        }
      : {}),
    ...(data.address !== undefined ? { address: data.address } : {}),
  };
};

function ShipmentAddressModal({
  orderId,
  shippingCompanyId,
  row,
  onClose,
}: Omit<OrderEditModalProps, 'kind' | 'carrierSupportsUpdate'>) {
  const updateAddress = useUpdateShipmentAddress(shippingCompanyId);

  const handleSave = async (data: ShippingData) => {
    await updateAddress.mutateAsync({ orderId, body: addressBodyOf(data, row) });
  };

  return (
    <EditShippingModal
      isOpen
      onClose={onClose}
      onSave={handleSave}
      initialData={shippingDataOf(row, shippingCompanyId)}
      orderId={orderId}
      customerHasPhone={row.customer.phones.length > 0}
      sections={['location', 'address']}
      title="تغيير العنوان"
    />
  );
}

function ShipmentReturnCostModal({
  orderId,
  shippingCompanyId,
  row,
  carrierSupportsUpdate,
  onClose,
}: Omit<OrderEditModalProps, 'kind'>) {
  const updateReturnCost = useUpdateShipmentReturnCost(shippingCompanyId);

  const handleSave = async (data: ShippingData) => {
    if (data.returnShippingCost === undefined) return;
    await updateReturnCost.mutateAsync({
      orderId,
      body: { returnShippingCost: data.returnShippingCost },
    });
  };

  return (
    <EditShippingModal
      isOpen
      onClose={onClose}
      onSave={handleSave}
      initialData={shippingDataOf(row, shippingCompanyId)}
      orderId={orderId}
      customerHasPhone={row.customer.phones.length > 0}
      carrierSupportsUpdate={carrierSupportsUpdate}
      sections={['returnCost']}
      title="تكلفة المرتجع"
    />
  );
}

function ShipmentPriceModal({
  orderId,
  shippingCompanyId,
  row,
  onClose,
}: Omit<OrderEditModalProps, 'kind' | 'carrierSupportsUpdate'>) {
  const [value, setValue] = useState(row.totalCost === null ? '' : String(row.totalCost));
  const updatePrice = useUpdateShipmentPrice(shippingCompanyId);

  const numeric = Number(value);
  const isFormatValid = value === '' || (PRICE_PATTERN.test(value) && /\d/.test(value));
  const isValid = value !== '' && isFormatValid && Number.isFinite(numeric) && numeric >= 0;

  const handleConfirm = async () => {
    if (!isValid) return;
    await updatePrice
      .mutateAsync({ orderId, body: { totalCost: numeric } })
      .then(onClose)
      .catch(() => undefined);
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="تغيير السعر"
      onConfirm={handleConfirm}
      confirmText="حفظ"
      confirmDisabled={!isValid || numeric === row.totalCost}
      isLoading={updatePrice.isPending}
      maxWidth="md:max-w-md"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="shipment-price-input" className="font-bold text-foreground">
          إجمالي مبلغ الطلب (جنيه)
        </label>
        <Input
          id="shipment-price-input"
          type="text"
          inputMode="decimal"
          dir="ltr"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="أدخل السعر"
          error={isFormatValid ? undefined : 'يجب إدخال أرقام فقط'}
        />
      </div>
    </BaseModal>
  );
}

function ShipmentCustomerPhoneModal({
  orderId,
  shippingCompanyId,
  row,
  onClose,
}: Omit<OrderEditModalProps, 'kind' | 'carrierSupportsUpdate'>) {
  const [value, setValue] = useState('');
  const [serverErrorCode, setServerErrorCode] = useState<string | null>(null);
  const addPhone = useAddShipmentCustomerPhone(shippingCompanyId);

  const phoneNumber = normalizePhoneInput(value);
  const isFormatValid = LIGHT_PHONE_PATTERN.test(phoneNumber);
  const errorText =
    serverErrorCode !== null
      ? PHONE_ERROR_MESSAGES[serverErrorCode]
      : value !== '' && !isFormatValid
        ? 'أدخل رقم هاتف صحيح'
        : undefined;

  const handleConfirm = async () => {
    if (!isFormatValid) return;
    setServerErrorCode(null);
    await addPhone
      .mutateAsync({ orderId, body: { phoneNumber } })
      .then(onClose)
      .catch((error: unknown) => {
        setServerErrorCode(customerPhoneErrorCodeOf(error));
      });
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="إضافة رقم هاتف"
      onConfirm={handleConfirm}
      confirmText="إضافة"
      confirmDisabled={!isFormatValid}
      isLoading={addPhone.isPending}
      maxWidth="md:max-w-md"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-foreground">أرقام العميل الحالية</span>
          {row.customer.phones.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {row.customer.phones.map((phone) => (
                <li key={phone} dir="ltr" className="text-sm text-foreground">
                  {phone}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد أرقام مسجلة</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="shipment-customer-phone-input" className="font-bold text-foreground">
            رقم الهاتف الجديد
          </label>
          <Input
            id="shipment-customer-phone-input"
            type="tel"
            inputMode="tel"
            dir="ltr"
            value={value}
            onChange={(event) => {
              setServerErrorCode(null);
              setValue(event.target.value);
            }}
            placeholder="01xxxxxxxxx"
            error={errorText}
          />
        </div>
      </div>
    </BaseModal>
  );
}

export function OrderEditModal({
  kind,
  orderId,
  shippingCompanyId,
  row,
  carrierSupportsUpdate,
  onClose,
}: OrderEditModalProps) {
  if (kind === 'address') {
    return (
      <ShipmentAddressModal orderId={orderId} shippingCompanyId={shippingCompanyId} row={row} onClose={onClose} />
    );
  }
  if (kind === 'returnCost') {
    return (
      <ShipmentReturnCostModal
        orderId={orderId}
        shippingCompanyId={shippingCompanyId}
        row={row}
        carrierSupportsUpdate={carrierSupportsUpdate}
        onClose={onClose}
      />
    );
  }
  if (kind === 'price') {
    return <ShipmentPriceModal orderId={orderId} shippingCompanyId={shippingCompanyId} row={row} onClose={onClose} />;
  }
  return (
    <ShipmentCustomerPhoneModal orderId={orderId} shippingCompanyId={shippingCompanyId} row={row} onClose={onClose} />
  );
}
