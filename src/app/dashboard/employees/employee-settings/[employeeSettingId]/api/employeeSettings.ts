import http from '@/lib/api/http';
import { Employee } from '../types/employee';

export async function getEmpByID(id: string): Promise<Employee> {
  const { data } = await http.get<Employee>(`/employees/${id}`);
  return data;
}

export async function updateEmpByID(
  id: string,
  updates: Partial<Employee>
): Promise<Employee> {
  // Whitelist only editable fields to avoid sending server-managed data
  const safeUpdates = {
    accessLevel: updates.accessLevel,
    department: updates.department,
    fullName: updates.fullName,
    phoneNumber: updates.phoneNumber,
    email: updates.email,
    address: updates.address,
    password: updates.password,
    workingHours: updates.workingHours,
  };

  const { data } = await http.patch<Employee>(`/employees/${id}`, safeUpdates);
  return data;
}
