import { ManualOrderPayload } from '@/types/manual-order';

type ShippingPayment = {
  shipping: boolean;
  shippingCost: string;
  includeShipping: boolean;
  paymentMethod: string;
  needsConfirmation: boolean;
};

export function buildManualOrderPayload(args: {
  platform: string;
  pageName: string;
  customerName: string;
  phoneNumber: string;
  governorate: string;
  area: string;
  address: string;
  notes: string;
  selectedProducts: Array<{
    id: number;
    price: string;
    variant?: { id?: number };
  }>;
  shippingPayment?: ShippingPayment;
}): ManualOrderPayload {
  const {
    platform,
    pageName,
    customerName,
    phoneNumber,
    governorate,
    area,
    address,
    notes,
    selectedProducts,
    shippingPayment,
  } = args;

  return {
    platform,
    pageName,
    customer: {
      name: customerName,
      phoneNumber,
      governorate,
      area,
      address,
      notes,
    },
    products: selectedProducts.map((p) => ({
      productId: p.id,
      variantId: p.variant?.id,
      quantity: 1,
      price: Number(p.price) || 0,
    })),
    ...(shippingPayment?.shipping && {
      shipping: {
        enabled: true,
        cost: Number(shippingPayment.shippingCost) || 0,
      },
    }),
    ...(shippingPayment?.includeShipping && {
      paymentMethod: shippingPayment.paymentMethod,
    }),
    ...(shippingPayment?.needsConfirmation && {
      needsConfirmation: true,
    }),
  };
}


