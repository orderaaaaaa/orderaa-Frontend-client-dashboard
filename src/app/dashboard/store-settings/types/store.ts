export interface MerchantSettingsResponse {
  shippingPhoneNumber: string;
  canOpenShipment: boolean;
  employeeCanEditContent: boolean;
  defaultShipmentContent: string;
  defaultReturnShippingCost: number;
  language: language;
  cancellationReasons: string[];
  autoCancelAttempts: number;
  logo: string;
  url: string;
}

type language = 'ar' | 'en' | undefined;
