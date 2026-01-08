import { OrderSettingsFormData } from '../schemas/store';

const EMPTY_STRING_EXCLUDE_FIELDS: readonly (keyof OrderSettingsFormData)[] = [
  'shippingPhoneNumber',
  'defaultShipmentContent',
];

export function sanitizeOrderSettings(
  data: OrderSettingsFormData
): Partial<OrderSettingsFormData> {
  const result: Partial<OrderSettingsFormData> = {};

  (Object.keys(data) as (keyof OrderSettingsFormData)[]).forEach((key) => {
    const value = data[key];

    if (value === undefined || value === null) return;

    if (value === '' && EMPTY_STRING_EXCLUDE_FIELDS.includes(key)) {
      return;
    }

    result[key] = value;
  });

  return result;
}
