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
  minStockLevel: number | null;
  /** T27: may an agent confirm an order whose variants are out of stock? */
  allowConfirmOutOfStock: boolean;
  maxStockLevel: number | null;
  pageNames: string[];
}

type language = 'ar' | 'en' | undefined;
