import type { SelectedProduct } from '@/store/productDropdownStore';
import type { MissingOrderDetail, MissingOrderFormat } from '@/types/missing-orders';
import type { RecoverOrderFormData } from '../schema';

export interface MissingOrderPrefillResult {
  defaultValues: RecoverOrderFormData;
  initialProducts: SelectedProduct[];
  highlightFields: string[];
}

const PAYLOAD_TOTAL_FIELD_BY_FORMAT: Partial<Record<MissingOrderFormat, string>> = {
  SHOPIFY: 'total_price',
  EASYORDER: 'total_cost',
};

export function extractPayloadTotal(
  rawPayload: unknown,
  format: MissingOrderFormat | null,
): string {
  if (!rawPayload || typeof rawPayload !== 'object') return '';
  if (format === null) return '';

  const key = PAYLOAD_TOTAL_FIELD_BY_FORMAT[format];
  if (!key) return '';

  const field = (rawPayload as Record<string, unknown>)[key];
  if (typeof field !== 'string' && typeof field !== 'number') return '';

  const parsed = Number(field);
  return Number.isFinite(parsed) ? String(parsed) : '';
}

export function buildMissingOrderPrefill(
  row: MissingOrderDetail,
): MissingOrderPrefillResult {
  const phoneNumbers = [row.phone, row.altPhone].filter(
    (p): p is string => !!p && p.trim() !== '',
  );

  const defaultValues: RecoverOrderFormData = {
    orderSource: {
      utmSource: row.utmSource ?? '',
      pageName: '',
    },
    customer: {
      name: row.customerName ?? '',
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : [''],
      address: row.address ?? '',
      notes: row.notes ?? '',
    },
    shipping: {
      shippingCompanyId: '',
      governorateOption: '',
      cityOption: '',
      shippingCost: '',
      returnShippingCost: '',
      shippingType: '',
      returnShipmentContent: '',
    },
    payment: {
      paymentMethod: 'CASH',
      paymentStatus: row.paymentStatus ?? 'CASH_ON_DELIVERY',
      prepaidAmount: row.prepaidAmount ?? '',
    },
    needsConfirmation: false,
    total: extractPayloadTotal(row.rawPayload, row.format),
    packagingNotes: '',
  };

  const initialProducts: SelectedProduct[] = row.products
    .filter((product) => product.productId !== null)
    .map((product) => ({
      id: product.productId as number,
      name: product.productName ?? product.name ?? '',
      price: String(product.price ?? 0),
      image: product.image ?? '',
      quantity: product.quantity ?? 1,
      selectedVariants: product.attributeOptionIds
        ? product.variants
            .filter(
              (variant): variant is { attribute: string; option: string } =>
                variant.attribute !== null && variant.option !== null,
            )
            .map((variant) => ({
              attribute: variant.attribute,
              option: variant.option,
            }))
        : [],
      attributeOptionIds: product.attributeOptionIds ?? [],
    }));

  const requiredPaths: { path: string; value: string }[] = [
    { path: 'customer.name', value: defaultValues.customer.name },
    { path: 'customer.address', value: defaultValues.customer.address },
    { path: 'shipping.shippingCompanyId', value: defaultValues.shipping.shippingCompanyId },
    {
      path: 'shipping.governorateOption',
      value: defaultValues.shipping.governorateOption,
    },
    { path: 'shipping.cityOption', value: defaultValues.shipping.cityOption },
    {
      path: 'shipping.returnShippingCost',
      value: defaultValues.shipping.returnShippingCost ?? '',
    },
    { path: 'shipping.shippingType', value: defaultValues.shipping.shippingType },
  ];

  const highlightFields = requiredPaths
    .filter((field) => !field.value)
    .map((field) => field.path);

  return { defaultValues, initialProducts, highlightFields };
}
