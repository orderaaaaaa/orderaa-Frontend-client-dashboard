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
  name: string;
  phoneNumbers: string[];
  governorate: string;
  city: string;
  address: string;
  email?: string;
  isBlocked: boolean;
  notes?: string;
}
