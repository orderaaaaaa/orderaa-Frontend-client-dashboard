import { ManualOrderPayload } from '@/types/manual-order';

interface SelectedProductWithVariants {
  id: number;
  quantity: number;
  selectedVariants: Array<{ label: string; value: string }>;
}

export function buildManualOrderPayload(args: {
  utmSource: string;
  pageName: string;
  customer: {
    name: string;
    phoneNumbers: string[];
    address: string;
    notes?: string;
  };
  shipping: {
    shippingCompany: string;
    governorate: string;
    city: string;
    shippingCost: string;
    returnShippingCost?: string;
    shippingType: string;
    returnShipmentContent?: string;
  };
  paymentMethod: string;
  needsConfirmation: boolean;
  total?: string;
  packagingNotes?: string;
  selectedProducts: SelectedProductWithVariants[];
}): ManualOrderPayload {
  const {
    utmSource,
    pageName,
    customer,
    shipping,
    paymentMethod,
    needsConfirmation,
    total,
    packagingNotes,
    selectedProducts,
  } = args;

  return {
    utmSource,
    pageName,
    products: selectedProducts.map((p) => ({
      id: p.id,
      quantity: p.quantity,
      variants: p.selectedVariants,
    })),
    customer: {
      name: customer.name,
      phoneNumbers: customer.phoneNumbers.filter((p) => p.trim() !== ''),
      address: customer.address,
      notes: customer.notes,
    },
    shippingCost: Number(shipping.shippingCost) || 0,
    ...(shipping.returnShippingCost?.trim() && {
      returnShippingCost: Number(shipping.returnShippingCost),
    }),
    paymentMethod,
    status: needsConfirmation ? 'NEW_ORDER' : 'CONFIRMED',
    shippingCompany: shipping.shippingCompany,
    governorate: shipping.governorate,
    city: shipping.city,
    total: Number(total) || 0,
    shippingType: shipping.shippingType,
    ...(shipping.returnShipmentContent?.trim() && {
      returnShipmentContent: shipping.returnShipmentContent.trim(),
    }),
    ...(packagingNotes?.trim() && {
      packagingNotes: packagingNotes.trim(),
    }),
  };
}
