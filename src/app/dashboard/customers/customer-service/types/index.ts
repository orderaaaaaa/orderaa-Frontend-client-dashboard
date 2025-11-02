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
