export type ManualOrderProduct = {
  id: number;
  quantity: number;
  attributeOptionIds: number[];
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
  shippingCompany: string;
  governorate: string;
  city: string;
  total: number;
  shippingType: string;
  returnShipmentContent?: string;
  packagingNotes?: string;
};
