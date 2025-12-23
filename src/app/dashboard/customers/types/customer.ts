export interface Location {
  id?: number;
  name?: string;
}

export interface Order {
  id?: number;
  totalAmount?: number;
  createdAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  phoneNumbers: string[];
  email: string;
  numberOfOrders: number;
  latestOrder: Order;
  totalAmount: number;
  notes: string[];
  isBlocked: boolean;
  governorate: Location;
  city: Location;
  address: Location;
  area: Location;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCustomers {
  data: Customer[];
  meta: PaginationMeta;
}

export type OrderStatus =
  | 'NEW_ORDER'
  | 'ATTEMPTED'
  | 'WAITING_FOR_PAYMENT'
  | 'WHATSAPP'
  | 'POSTPONED'
  | 'CALL_AGAIN'
  | 'STOPPED'
  | 'CANCELLED'
  | 'UNCOMPLETED'
  | 'CONFIRMED'
  | 'PREPARED'
  | 'SHIPPING'
  | 'RETURNED_DELIVERED'
  | 'DELIVERED'
  | 'PARTIAL_DELIVERY'
  | 'MISSING';

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  latestOrderStatus?: OrderStatus;
}
