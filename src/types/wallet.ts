// ========================
// Wallet Types
// ========================

export interface WalletBalance {
  balance: string;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  reference: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface WalletChargeOption {
  id: number;
  title: string;
  description: string | null;
  amount: string;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TopUpSession {
  sessionUrl: string;
  sessionId: string;
  amount: string;
  currency: string;
  expiresAt: string;
}

// ========================
// Billing Types
// ========================

export interface BillingInfo {
  wallet: WalletBalance;
  subscription: ActiveSubscription | null;
  orders: {
    total: number;
    shadowed: number;
    processed: number;
  };
  availableOrderCapacity: number | 'unlimited';
}

// ========================
// Subscription & Plan Types
// ========================

export type PlanType = 'PER_ORDER' | 'UNLIMITED';

export interface Plan {
  id: number;
  title: string;
  description: string | null;
  type: PlanType;
  currency: string;
  subscriptionPrice: string | null;
  pricePerOrder: string | null;
  durationDays: number;
  isActive: boolean;
}

export interface ActiveSubscription {
  id: number;
  merchantId: number;
  planId: number;
  plan: Plan;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  subscriptionId: number | null;
  newBalance: string;
}
