import Http from '@/lib/api/http';
import {
  Employee,
  EmployeeFormData,
  PaginatedEmployeesResponse,
  EmployeeFilters,
  EmployeeSummary,
} from '@/schemas/employee.schema';
import { EmployeeAttendanceResponse } from '../types/attendance.types';

export const employeesApi = {
  getAll: () => Http.get<Employee[]>('/employees').then((res) => res.data),
  getFiltered: (filters: EmployeeFilters) => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.phoneNumber) params.append('phoneNumber', filters.phoneNumber);
    if (filters.email) params.append('email', filters.email);
    if (filters.accessLevel) params.append('accessLevel', filters.accessLevel);
    if (filters.department) params.append('department', filters.department);
    if (filters.performance) params.append('performance', filters.performance);
    // Omitted means both states, so only send it when explicitly narrowed.
    if (filters.isActive !== undefined)
      params.append('isActive', String(filters.isActive));
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return Http.get<PaginatedEmployeesResponse>(
      `/employees/filtered?${params.toString()}`
    ).then((res) => res.data);
  },
  getById: (id: number) =>
    Http.get<Employee>(`/employees/${id}`).then((res) => res.data),
  create: (data: EmployeeFormData) => {
    // Remove confirmPassword before sending to API; `roleIds` are held as
    // strings in the form and sent as the numeric ids CreateEmployeeDto expects.
    const { confirmPassword, roleIds, ...apiData } = data;
    return Http.post<Employee>('/employees', {
      ...apiData,
      ...(roleIds?.length ? { roleIds: roleIds.map(Number) } : {}),
    }).then((res) => res.data);
  },
  update: (id: number, data: Partial<EmployeeFormData>) => {
    // Remove confirmPassword if it exists before sending to API.
    // Roles are NOT part of PATCH /employees/:id — they go through
    // PUT /employees/:id/roles (see services/authorization.ts).
    const { confirmPassword, roleIds, ...apiData } = data;
    return Http.patch<Employee>(`/employees/${id}`, apiData).then(
      (res) => res.data
    );
  },
  updateStatus: (id: number, isOnline: boolean) => {
    return Http.patch<Employee>(`/employees/${id}/status`, { isOnline }).then(
      (res) => res.data
    );
  },
  updatePerformance: (
    id: number,
    data: { performanceScore: number; performanceChange: number }
  ) => {
    return Http.patch<Employee>(`/employees/${id}/performance`, data).then(
      (res) => res.data
    );
  },
  updateAttendance: (
    id: number,
    data: { workingDays: number; leaveDays: number }
  ) => {
    return Http.patch<Employee>(`/employees/${id}/attendance`, data).then(
      (res) => res.data
    );
  },
  // `/activation`, not `/status` — the latter is the online-presence route.
  setActivation: (id: number, isActive: boolean) => {
    return Http.patch<{ message: string; employee: Employee }>(
      `/employees/${id}/activation`,
      { isActive }
    ).then((res) => res.data);
  },
  getAttendance: (id: number, month: string) => {
    return Http.get<EmployeeAttendanceResponse>(
      `/employees/${id}/attendance?month=${month}`
    ).then((res) => res.data);
  },
  getSummary: () =>
    Http.get<EmployeeSummary>('/employees/summary').then((res) => res.data),
};
