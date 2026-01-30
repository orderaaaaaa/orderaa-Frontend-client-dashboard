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

export type EmployeeStatus = 'active' | 'stopped';

export interface EmployeeStatusRow {
  id: number;
  name: string;
  status: EmployeeStatus;
  lastInactivityDuration: string;
  totalInactivityToday: number;
  totalAttempts: number;
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

export interface StopTimeRange {
  from: string;
  to: string;
}

export interface EmployeeStopDetailData {
  [key: string]: unknown;
  id: number;
  employeeId: number;
  status: EmployeeStatus;
  stopTimes: StopTimeRange[];
  totalStopToday: string;
  totalAttempts: number;
}

export interface CancelledOrderDetail {
  [key: string]: unknown;
  id: number;
  orderCode: string;
  customerName: string;
  cancelReason: string;
  notes: string;
}
