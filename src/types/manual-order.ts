export type ManualOrderProduct = {
  id: number;
  quantity: number;
  attributeOptionIds: number[];
  sourceIndex?: number;
};

export type ManualOrderCustomer = {
  name: string;
  phoneNumbers: string[];
  address: string;
  notes?: string;
};

export type ManualOrderPayload = {
  utmSource: string;
  pageName: string;
  products: ManualOrderProduct[];
  customer: ManualOrderCustomer;
  shippingCost: number;
  returnShippingCost?: number;
  paymentMethod: string;
  status: 'NEW_ORDER' | 'CONFIRMED';
  shippingCompanyId: number | null;
  governorateOption: string;
  cityOption: string;
  total: number;
  shippingType: string;
  returnShipmentContent?: string;
  packagingNote?: string;
};
