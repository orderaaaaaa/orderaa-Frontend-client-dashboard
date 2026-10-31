import type { OrderStatus } from '@/types/orders';

export type CustomerReturnUnitState =
  'SELECTABLE' | 'IN_RETURN' | 'IN_EXCHANGE';

export type CustomerReturnUnitHolder = {
  orderId: number;
  code: string;
  status: OrderStatus;
};

export type CustomerReturnUnit = {
  orderProductId: number;
  productName: string;
  variantLabel: string | null;
  sku: string | null;
  price: number;
  imageUrl: string | null;
  state: CustomerReturnUnitState;
  holder: CustomerReturnUnitHolder | null;
};

export type CustomerReturnSourceOrder = {
  id: number;
  code: string;
  status: OrderStatus;
  createdAt: string;
  shippingCompanyName: string | null;
  units: CustomerReturnUnit[];
};

export type CustomerReturnLastAddress = {
  governorateOption: string;
  cityOption: string;
  address: string;
};

export type CustomerReturnCustomer = {
  id: number;
  name: string;
  phoneNumbers: string[];
  lastAddress: CustomerReturnLastAddress | null;
};

export type CustomerReturnCarrierSupport = {
  shippingCompanyId: number;
  name: string;
  supported: boolean;
  reason: string | null;
};

export type CustomerReturnCandidates = {
  customer: CustomerReturnCustomer;
  orders: CustomerReturnSourceOrder[];
  carrierSupport: CustomerReturnCarrierSupport[];
};

export type CreateCustomerReturnPayload = {
  customerId: number;
  orderProductIds: number[];
  confirm: boolean;
  shippingCompanyId?: number;
  governorateOption?: string;
  cityOption?: string;
  address?: string;
  phoneNumbers?: string[];
  notes?: string;
};

export type CreateCustomerReturnResponse = {
  id: number;
  code: string;
  status: OrderStatus;
  refundValue: number;
  unitsCount: number;
};
