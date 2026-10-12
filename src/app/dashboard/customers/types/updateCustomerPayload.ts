export interface UpdateCustomerPayload {
  id: number;
  name?: string;
  phoneNumbers?: string[];
  governorate?: string;
  city?: string;
  address?: string;
  area?: string;
  email?: string;
  isBlocked?: boolean;
  notes?: string;
}

export interface UpdateCustomerResponse {
  id: number;
  name: string;
  email: string | null;
  isBlocked: boolean;
  notes: string[];
  blockedUntil: string | null;
  merchantId: number;
  createdAt: string;
  updatedAt: string;
}
