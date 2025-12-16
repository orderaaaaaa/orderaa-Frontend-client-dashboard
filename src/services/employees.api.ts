import { api } from '@/lib/api/axios';
import { Employee, EmployeeFormData } from '@/schemas/employee.schema';

export const employeesApi = {
  getAll: () => api.get<Employee[]>('/employees').then((res) => res.data),
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
  delete: (id: number) => api.delete(`/employees/${id}`),
};
