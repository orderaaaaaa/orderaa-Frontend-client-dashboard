export interface MerchantSettingsResponse {
  shippingPhoneNumber: string;
  canOpenShipment: boolean;
  employeeCanEditContent: boolean;
  defaultShipmentContent: string;
  defaultReturnShippingCost: number;
  language: language;
  cancellationReasons: string[];
  utmSources: string[];
  autoCancelAttempts: number;
  logo: string;
  url: string;
  reservationType: 'ON_CREATION' | 'ON_CONFIRMED';
  allowNegativeReservation: boolean;
  minStockLevel: number | null;
  maxStockLevel: number | null;
  pageNames: string[];
}

type language = 'ar' | 'en' | undefined;
