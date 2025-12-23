import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { EmployeeFormData } from '@/schemas/employee.schema';
import { Employee } from '@/schemas/employee.schema';

export interface EmployeeCardProps {
  employee: Employee;
}

export type EmployeeFormFieldsProps = {
  register: UseFormRegister<EmployeeFormData>;
  errors: FieldErrors<EmployeeFormData>;
  watch: UseFormWatch<EmployeeFormData>;
  setValue: UseFormSetValue<EmployeeFormData>;
};

