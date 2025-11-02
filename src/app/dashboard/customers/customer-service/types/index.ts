export interface EmployeeData {
  label: string;
  بوستينا: number;
  سارة: number;
  ليان: number;
}

export interface DataPoint {
  label: string;
  value1: number;
  value2: number;
  value3: number;
}

export type RangeType = 'day' | 'week' | 'month' | 'year';

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export interface Bar {
  current: number;
  total: number;
}

export interface ConfirmationAttemptData {
  label: string;
  value: number;
  color: string;
}

export interface CallDurationData {
  label: string;
  value: number;
}

export interface CallDistributionData {
  label: string;
  value: number;
}

export interface EmployeePerformanceData {
  label: string;
  value: number;
}

export interface EmployeeStats {
  id: number;
  name: string;
  totalCalls: number;
  confirmedCalls: number;
  breakDuration: string;
  workHours: string;
}

export interface StopHour {
  id: number;
  value: number;
  from: string;
  to: string;
  total: string;
}

export interface Region {
  name: string;
  percent: number;
  value: number;
}
