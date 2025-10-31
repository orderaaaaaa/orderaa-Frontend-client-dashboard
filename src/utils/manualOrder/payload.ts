import { ManualOrderPayload } from '@/types/manual-order';

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
  };
}


