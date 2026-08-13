import { OrderSettingsFormData } from './store';

export const ORDER_SETTINGS_DEFAULTS: OrderSettingsFormData = {
  language: 'ar',
  cancellationReasons: [],
  utmSources: [],
  pageNames: [],
  canOpenShipment: false,
  employeeCanEditContent: true,
  shippingPhoneNumber: '',
  defaultShipmentContent: '',
  defaultReturnShippingCost: 0,
  autoCancelAttempts: 0,
  logo: undefined,
  url: '',
  minStockLevel: null,
  maxStockLevel: null,
};
