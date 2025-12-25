export interface CustomerId {
  id: number;
  name: string;
  phoneNumbers: string[];
  email: string;
  numberOfOrders: number;
  latestOrder: Record<string, any>;
  totalAmount: number;
  notes: string[];
  isBlocked: boolean;
  governorate: Record<string, any>;
  city: Record<string, any>;
  address: Record<string, any>;
  area: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
