export interface Location {
  id?: number;
  name?: string;
}

export interface Order {
  id: number;
  code: string;
  status: string;
  totalCost: number;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phoneNumbers: string[];
  email?: string;
  numberOfOrders: number;
  latestOrder: Order | null;
  totalAmount: number;
  notes: string;
  isBlocked: boolean;

  governorate: string | null;
  city: string | null;
  area: string | null;
  address: string;

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

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  latestOrderStatus?: string;
}
