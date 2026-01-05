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
}

type language = 'ar' | 'en' | undefined;
