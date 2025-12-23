export interface Employee {
  id: string;
  accessLevel: string;
  department: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  password: string;
  workingHours: string;
  createdAt?: string;
  updatedAt?: string;
  // Server-only/derived fields (not meant to be sent back on update)
  merchantId?: number;
  userId?: number;
  isOnline?: boolean;
  lastActiveAt?: string | null;
  performanceScore?: number;
  performanceChange?: number;
  workingDaysThisMonth?: number;
  leaveDaysThisMonth?: number;
}
