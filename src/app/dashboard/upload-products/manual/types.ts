export type OrderProps = {
  utmSource: string;
  pageName: string;
  onUtmSourceChange: (v: string) => void;
  onPageNameChange: (v: string) => void;
  errors?: { utmSource?: string; pageName?: string };
};

export type OrderDetailsProps = {
  errors?: { products?: string };
};

export type ClientInformationProps = {
  name: string;
  phoneNumber: string;
  address: string;
  notes: string;
  onNameChange: (v: string) => void;
  onPhoneNumberChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  errors?: {
    name?: string;
    phoneNumber?: string;
    address?: string;
    notes?: string;
  };
};

export type ShippingSectionProps = {
  shippingCompany: string;
  governorate: string;
  city: string;
  shippingCost: string;
  onShippingCompanyChange: (v: string) => void;
  onGovernorateChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onShippingCostChange: (v: string) => void;
  errors?: {
    shippingCompany?: string;
    governorate?: string;
    city?: string;
    shippingCost?: string;
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
