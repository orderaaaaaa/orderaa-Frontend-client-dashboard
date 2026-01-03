import { Order } from './customer';

export interface CustomersDetailsTotalStatsProps {
  latestOrder: Order | null;
  phoneNumbers: string[];
  totalAmount: number;
  numberOfOrders: number;
  email?: string;
  returned: number;
  delivered: number;
}

export interface StatsTabProps {
  deliveryRate: number;
  cancellationRate: number;
  returnRate: number;
  delivered: number;
  cancelled: number;
  returned: number;
  totalOrders: number;
}

export interface CustomersDetailsShareProps {
  email?: string;
  phoneNumbers: string[];
}

export interface NotesTabProps {
  notes: string[];
  createdAt: string;
}

export interface CustomersDetailsHeaderProps {
  isBlocked: boolean;
  username: String;
}
