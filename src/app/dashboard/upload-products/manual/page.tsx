'use client';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import ClientInformation from './ClientInformation';
import Order from './Order';
import OrderDetails from './OrderDetails';
import ShippingAndPayment from './ShippingAndPayment';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import Products from './Products';
import { buildManualOrderPayload } from '@/utils/manualOrder/payload';
import {
  validateManualOrder,
  ManualFormErrors as ManualFormErrorsType,
} from '@/utils/manualOrder/validation';
import { createManualOrder } from '@/lib/api/manualOrdersApi';

type ManualFormErrors = ManualFormErrorsType;

function Manual() {
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );

  // Order source
  const [orderSource, setOrderSource] = useState<{
    platform: string;
    pageName: string;
  }>({
    platform: '',
    pageName: '',
  });

  // Client information
  const [customer, setCustomer] = useState<{
    customerName: string;
    phoneNumber: string;
    governorate: string;
    area: string;
    address: string;
    notes: string;
  }>({
    customerName: '',
    phoneNumber: '',
    governorate: '',
    area: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<ManualFormErrors>({});

  const handleSubmit = async () => {
    const productsMapped = selectedProducts.map((p) => ({
      productId: p.id,
      variantId: p.variant?.id,
      quantity: 1,
      price: Number(p.price) || 0,
    }));

    const nextErrors = validateManualOrder(
      {
        platform: orderSource.platform,
        pageName: orderSource.pageName,
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        governorate: customer.governorate,
        area: customer.area,
        address: customer.address,
        notes: customer.notes,
      },
      productsMapped
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = buildManualOrderPayload({
      platform: orderSource.platform,
      pageName: orderSource.pageName,
      customerName: customer.customerName,
      phoneNumber: customer.phoneNumber,
      governorate: customer.governorate,
      area: customer.area,
      address: customer.address,
      notes: customer.notes,
      selectedProducts,
    });

    await createManualOrder(payload);
  };

  return (
    <>
      <div className="flex flex-col gap-[26px]">
        <Order
          platform={orderSource.platform}
          pageName={orderSource.pageName}
          onPlatformChange={(v) =>
            setOrderSource((prev) => ({ ...prev, platform: v }))
          }
          onPageNameChange={(v) =>
            setOrderSource((prev) => ({ ...prev, pageName: v }))
          }
          errors={{ platform: errors.platform, pageName: errors.pageName }}
        />
        <OrderDetails />
        {errors.products && (
          <div className="px-6" dir="rtl">
            <p className="text-red-500 text-sm">{errors.products}</p>
          </div>
        )}
        {selectedProducts.length > 0 && <Products />}

        <ClientInformation
          customerName={customer.customerName}
          phoneNumber={customer.phoneNumber}
          governorate={customer.governorate}
          area={customer.area}
          address={customer.address}
          notes={customer.notes}
          onCustomerNameChange={(v) =>
            setCustomer((prev) => ({ ...prev, customerName: v }))
          }
          onPhoneNumberChange={(v) =>
            setCustomer((prev) => ({ ...prev, phoneNumber: v }))
          }
          onGovernorateChange={(v) =>
            setCustomer((prev) => ({ ...prev, governorate: v }))
          }
          onAreaChange={(v) => setCustomer((prev) => ({ ...prev, area: v }))}
          onAddressChange={(v) =>
            setCustomer((prev) => ({ ...prev, address: v }))
          }
          onNotesChange={(v) => setCustomer((prev) => ({ ...prev, notes: v }))}
          errors={{
            customerName: errors.customerName,
            phoneNumber: errors.phoneNumber,
            governorate: errors.governorate,
            area: errors.area,
            address: errors.address,
            notes: errors.notes,
          }}
        />
        <ShippingAndPayment />
        <div className="flex justify-end ml-6">
          <button
            onClick={handleSubmit}
            className="flex py-2 gap-2 text-md cursor-pointer bg-[#5D24E1] items-center text-white w-40 px-5 rounded-full font-bold"
          >
            {' '}
            <Plus className="font-bold w-6 h-6" />
            إضافة طلب
          </button>
        </div>
      </div>
    </>
  );
}

export default Manual;
