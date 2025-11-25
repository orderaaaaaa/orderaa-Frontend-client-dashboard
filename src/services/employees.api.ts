import axios from 'axios';
import { EmployeeFormData, Employee, EmployeesResponse } from '@/schemas/employee.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface CreateEmployeeRequest {
  accessLevel: string;
  department: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  password: string;
  workingHours?: string;
}

export const employeesApi = {
  async getAll(token: string): Promise<Employee[]> {
    const response = await axios.get<Employee[]>(`${API_BASE_URL}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getById(token: string, id: number): Promise<Employee> {
    const response = await axios.get<Employee>(`${API_BASE_URL}/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async create(token: string, data: EmployeeFormData): Promise<Employee> {
    const requestData: CreateEmployeeRequest = {
      accessLevel: data.accessLevel,
      department: data.department,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email || undefined,
      address: data.address,
      password: data.password,
      workingHours: data.workingHours || undefined,
    };

    const response = await axios.post<Employee>(`${API_BASE_URL}/employees`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  async update(token: string, id: number, data: Partial<EmployeeFormData>): Promise<Employee> {
    const response = await axios.patch<Employee>(`${API_BASE_URL}/employees/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  async delete(token: string, id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};



