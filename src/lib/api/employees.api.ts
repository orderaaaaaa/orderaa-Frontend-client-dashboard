import { api } from '@/lib/api/axios';
import { Employee, EmployeeFormData, PaginatedEmployeesResponse, EmployeeFilters } from '@/schemas/employee.schema';

export const employeesApi = {
  getAll: () => api.get<Employee[]>('/employees').then((res) => res.data),
  getFiltered: (filters: EmployeeFilters) => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.phoneNumber) params.append('phoneNumber', filters.phoneNumber);
    if (filters.email) params.append('email', filters.email);
    if (filters.accessLevel) params.append('accessLevel', filters.accessLevel);
    if (filters.department) params.append('department', filters.department);
    if (filters.performance) params.append('performance', filters.performance);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return api.get<PaginatedEmployeesResponse>(`/employees/filtered?${params.toString()}`).then((res) => res.data);
  },
  getById: (id: number) =>
    api.get<Employee>(`/employees/${id}`).then((res) => res.data),
  create: (data: EmployeeFormData) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...apiData } = data;
    return api.post<Employee>('/employees', apiData).then((res) => res.data);
  },
  update: (id: number, data: Partial<EmployeeFormData>) => {
    // Remove confirmPassword if it exists before sending to API
    const { confirmPassword, ...apiData } = data;
    return api
      .patch<Employee>(`/employees/${id}`, apiData)
      .then((res) => res.data);
  },
  updateStatus: (id: number, isOnline: boolean) => {
    return api
      .patch<Employee>(`/employees/${id}/status`, { isOnline })
      .then((res) => res.data);
  },
  updatePerformance: (id: number, data: { performanceScore: number; performanceChange: number }) => {
    return api
      .patch<Employee>(`/employees/${id}/performance`, data)
      .then((res) => res.data);
  },
  updateAttendance: (id: number, data: { workingDays: number; leaveDays: number }) => {
    return api
      .patch<Employee>(`/employees/${id}/attendance`, data)
      .then((res) => res.data);
  },
  delete: (id: number) => api.delete(`/employees/${id}`),
};
