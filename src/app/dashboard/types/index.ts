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
