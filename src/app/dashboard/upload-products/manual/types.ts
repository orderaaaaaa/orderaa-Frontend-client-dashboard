export type OrderProps = {
  utmSource: string;
  pageName: string;
  onUtmSourceChange: (v: string) => void;
  onPageNameChange: (v: string) => void;
  errors?: { utmSource?: string; pageName?: string };
};

export type OrderDetailsProps = {
  total: string;
  packagingNotes: string;
  onTotalChange: (v: string) => void;
  onPackagingNotesChange: (v: string) => void;
  errors?: { products?: string; total?: string };
};

export type ClientInformationProps = {
  name: string;
  phoneNumbers: string[];
  address: string;
  notes: string;
  onNameChange: (v: string) => void;
  onPhoneNumbersChange: (v: string[]) => void;
  onAddressChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  errors?: {
    name?: string;
    phoneNumbers?: string;
    address?: string;
    notes?: string;
  };
};

export type ShippingSectionProps = {
  shippingCompany: string;
  governorate: string;
  city: string;
  shippingCost: string;
  shippingType: string;
  returnShipmentContent: string;
  onShippingCompanyChange: (v: string) => void;
  onGovernorateChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onShippingCostChange: (v: string) => void;
  onShippingTypeChange: (v: string) => void;
  onReturnShipmentContentChange: (v: string) => void;
  errors?: {
    shippingCompany?: string;
    governorate?: string;
    city?: string;
    shippingCost?: string;
    shippingType?: string;
    returnShipmentContent?: string;
  };
};

export type PaymentSectionProps = {
  paymentMethod: string;
  onPaymentMethodChange: (v: string) => void;
  errors?: { paymentMethod?: string };
};

export type ConfirmationSectionProps = {
  needsConfirmation: boolean;
  onNeedsConfirmationChange: (v: boolean) => void;
};
