import type { ReactNode } from 'react';

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
  failingProductIndex?: number | null;
  incompleteLines?: ReadonlyMap<number, readonly string[]>;
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
    phoneNumberItems?: (string | undefined)[];
    address?: string;
    notes?: string;
  };
};

export type CarrierSupportState = {
  supported: boolean;
  reason: string | null;
};

export type ShippingSectionProps = {
  mode?: 'new' | 'return';
  carrierSupport?: Record<string, CarrierSupportState>;
  idPrefix?: string;
  locationHint?: ReactNode;
  shippingCompanyId: string;
  governorateOption: string;
  cityOption: string;
  shippingCost: string;
  returnShippingCost: string;
  shippingType: string;
  returnShipmentContent: string;
  onShippingCompanyChange: (v: string) => void;
  onGovernorateOptionChange: (v: string) => void;
  onCityOptionChange: (v: string) => void;
  onShippingCostChange: (v: string) => void;
  onReturnShippingCostChange: (v: string) => void;
  onShippingTypeChange: (v: string) => void;
  onReturnShipmentContentChange: (v: string) => void;
  errors?: {
    shippingCompanyId?: string;
    governorateOption?: string;
    cityOption?: string;
    shippingCost?: string;
    returnShippingCost?: string;
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
  description?: string;
  needsConfirmation: boolean;
  onNeedsConfirmationChange: (v: boolean) => void;
  className?: string;
  switchClassName?: string;
};
