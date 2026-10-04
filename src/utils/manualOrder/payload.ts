import { ManualOrderPayload } from '@/types/manual-order';
import { shippingCompanyIdOf } from '@/lib/shippingCompanies';

interface SelectedProductWithVariants {
  id: number;
  quantity: number;
  attributeOptionIds: number[];
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
    shippingCompanyId: string;
    governorateOption: string;
    cityOption: string;
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
      attributeOptionIds: p.attributeOptionIds,
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
    shippingCompanyId: shippingCompanyIdOf(shipping.shippingCompanyId),
    governorateOption: shipping.governorateOption,
    cityOption: shipping.cityOption,
    total: Number(total) || 0,
    shippingType: shipping.shippingType,
    ...(shipping.returnShipmentContent?.trim() && {
      returnShipmentContent: shipping.returnShipmentContent.trim(),
    }),
    ...(packagingNotes?.trim() && {
      packagingNote: packagingNotes.trim(),
    }),
  };
}
