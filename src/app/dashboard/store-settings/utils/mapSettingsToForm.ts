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
    minStockLevel: settings.minStockLevel ?? ORDER_SETTINGS_DEFAULTS.minStockLevel,
    // `??`, not `||`: a merchant who set this to false must not be shown the
    // default `true` on reload.
    allowConfirmOutOfStock:
      settings.allowConfirmOutOfStock ??
      ORDER_SETTINGS_DEFAULTS.allowConfirmOutOfStock,
    maxStockLevel: settings.maxStockLevel ?? ORDER_SETTINGS_DEFAULTS.maxStockLevel,
  };
}
