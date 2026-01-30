export type OrderProps = {
  platform: string;
  pageName: string;
  onPlatformChange: (v: string) => void;
  onPageNameChange: (v: string) => void;
  errors?: { platform?: string; pageName?: string };
};

export type OrderDetailsProps = {
  errors?: { products?: string };
};

export type ClientInformationProps = {
  customerName: string;
  phoneNumber: string;
  governorate: string;
  area: string;
  address: string;
  notes: string;
  onCustomerNameChange: (v: string) => void;
  onPhoneNumberChange: (v: string) => void;
  onGovernorateChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  errors?: {
    customerName?: string;
    phoneNumber?: string;
    governorate?: string;
    area?: string;
    address?: string;
    notes?: string;
  };
};

export type ShippingAndPaymentProps = {
  shipping: boolean;
  shippingCost: string;
  includeShipping: boolean;
  paymentMethod: string;
  needsConfirmation: boolean;
  onShippingChange: (v: boolean) => void;
  onShippingCostChange: (v: string) => void;
  onIncludeShippingChange: (v: boolean) => void;
  onPaymentMethodChange: (v: string) => void;
  onNeedsConfirmationChange: (v: boolean) => void;
  errors?: {
    shippingCost?: string;
    paymentMethod?: string;
  };
};
