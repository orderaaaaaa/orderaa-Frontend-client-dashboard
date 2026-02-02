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
    phoneNumber: string;
    address: string;
    notes?: string;
  };
  shipping: {
    shippingCompany: string;
    governorate: string;
    city: string;
    shippingCost: string;
  };
  paymentMethod: string;
  needsConfirmation: boolean;
  selectedProducts: SelectedProductWithVariants[];
}): ManualOrderPayload {
  const {
    utmSource,
    pageName,
    customer,
    shipping,
    paymentMethod,
    needsConfirmation,
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
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      notes: customer.notes,
    },
    shippingCost: Number(shipping.shippingCost) || 0,
    paymentMethod,
    status: needsConfirmation ? 'NEW_ORDER' : 'CONFIRMED',
    shippingCompany: shipping.shippingCompany,
    governorate: shipping.governorate,
    city: shipping.city,
  };
}
