export type ManualOrderProduct = {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
};

export type ManualOrderCustomer = {
  name: string;
  phoneNumber: string;
  governorate: string;
  area: string;
  address: string;
  notes: string;
};

export type ManualOrderPayload = {
  platform: string;
  pageName: string;
  customer: ManualOrderCustomer;
  products: ManualOrderProduct[];
  shipping?: {
    enabled: boolean;
    cost?: number;
  };
  paymentMethod?: string;
  needsConfirmation?: boolean;
};


