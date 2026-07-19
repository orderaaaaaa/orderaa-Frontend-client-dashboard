import { OrderSettingsFormData } from '../schemas/store';
import { ORDER_SETTINGS_DEFAULTS } from '../schemas/store.defaults';

export function mapSettingsToForm(
  settings: Partial<OrderSettingsFormData> & { logo?: string }
): OrderSettingsFormData {
  return {
    ...ORDER_SETTINGS_DEFAULTS,
    ...settings,
    logo: settings.logo ?? undefined,
    language: settings.language ?? 'ar',
    cancellationReasons: settings.cancellationReasons ?? [],
    utmSources: settings.utmSources ?? [],
    pageNames: settings.pageNames ?? [],
    canOpenShipment: settings.canOpenShipment ?? false,
    employeeCanEditContent: settings.employeeCanEditContent ?? false,
    defaultReturnShippingCost: settings.defaultReturnShippingCost ?? 0,
    autoCancelAttempts: settings.autoCancelAttempts ?? 0,
    url: settings.url ?? '',
    reservationType: settings.reservationType ?? ORDER_SETTINGS_DEFAULTS.reservationType,
    allowNegativeReservation: settings.allowNegativeReservation ?? ORDER_SETTINGS_DEFAULTS.allowNegativeReservation,
    minStockLevel: settings.minStockLevel ?? ORDER_SETTINGS_DEFAULTS.minStockLevel,
    maxStockLevel: settings.maxStockLevel ?? ORDER_SETTINGS_DEFAULTS.maxStockLevel,
  };
}
