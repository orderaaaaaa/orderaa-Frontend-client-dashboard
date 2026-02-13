import { ReactNode } from 'react';
import type { SplineAreaChartSeries } from '@/components/ui/charts/SplineAreaChart';

export interface DashboardSummary {
  activeNow: number;
  stoppedNow: number;
  confirmedOrders: number;
  followUpOrders: number;
  incompleteOrders: number;
  cancelledOrders: number;
  executedOrders: number;
  remainingOrders: number;
}

export interface SummaryCardConfig {
  key: string;
  label: string;
  value: number;
  icon: ReactNode;
  iconBgClassName: string;
  onClick?: () => void;
}

export interface CallDurationItem {
  key: string;
  label: string;
  value: string;
  chartCategories: string[];
  chartSeries: SplineAreaChartSeries[];
}

export interface OrderStatusDistributionItem {
  label: string;
  value: number;
  color: string;
}

export interface ConfirmationAttemptsData {
  categories: string[];
  values: number[];
}

export type EmployeeStatus = 'online' | 'offline';

export interface EmployeeStatusRow {
  id: number;
  name: string;
  status: EmployeeStatus;
  totalPauseTime: string;
  totalPausesInDay: number;
  totalCallCenterActions: number;
  totalWorkingHours: string;
}

export interface EmployeeModalData {
  [key: string]: unknown;
  id: number;
  name: string;
  status: EmployeeStatus;
  totalWorkHours: string;
  attempts: number;
}

export interface FollowUpModalData {
  [key: string]: unknown;
  id: number;
  status: string;
  count: number;
  percentage: string;
}

export interface EmployeeStopDetailData {
  [key: string]: unknown;
  id: number;
  employeeId: number;
  employeeName: string;
  status: EmployeeStatus;
  totalWorkingHours: string;
  totalPausesInDay: number;
  totalPauseTime: string;
  totalCallCenterActions: number;
}

export interface CancelledOrderDetail {
  [key: string]: unknown;
  id: number;
  orderCode: string;
  customerName: string;
  cancelReason: string;
  notes: string;
}

export interface FirstAttemptData {
  minutes: number;
}

export interface PostponedOrderContentItem {
  [key: string]: unknown;
  id: number;
  variant1: string;
  variant2: string;
  productName: string;
  quantity: number;
  percentage: number;
}

export interface EmployeePerformanceMetric {
  [key: string]: unknown;
  id: number;
  label: string;
  count: number;
  percentage: number;
}

export interface EmployeePerformanceData {
  employeeId: number;
  employeeName: string;
  metrics: EmployeePerformanceMetric[];
}

export * from './api';
