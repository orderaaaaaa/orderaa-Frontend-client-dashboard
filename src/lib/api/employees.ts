import api from './index';

export interface EmployeeApiItem {
  id: number;
  accessLevel: string;
  department: string;
  address: string;
  workingHours: string | null;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export async function getEmployees(): Promise<EmployeeApiItem[]> {
  const response = await api.get<EmployeeApiItem[]>('/employees');
  return response.data;
}
