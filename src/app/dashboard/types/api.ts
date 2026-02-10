export interface DailySummaryResponse {
  onlineEmployeesCount: number;
  offlineEmployeesCount: number;
  confirmedOrdersCount: number;
  attemptedOrdersCount: number;
  notCompletedOrdersCount: number;
  cancelledOrdersCount: number;
  deliveredCount: number;
  remainingOrdersCount: number;
  averageFirstActionTimeMinutes: number;
}

export interface AttemptedResponse {
  count: number;
  percentage: number;
  byNotes: {
    note: string;
    count: number;
    percentage: number;
  }[];
}

export interface RemainingResponse {
  count: number;
  percentage: number;
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface CancelledResponse {
  count: number;
  percentage: number;
  byReason: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  orders: {
    id: number;
    code: string;
    customer: {
      name: string;
    };
    cancelReason: string;
    cancelNote: string | null;
  }[];
}

export interface HourlyEntry {
  hour: number;
  count: number;
}

export interface HourlyChartResponse {
  confirmed: HourlyEntry[];
  cancelled: HourlyEntry[];
  attempted: HourlyEntry[];
  uncompleted: HourlyEntry[];
}

export interface ByStatusResponse {
  statuses: {
    status: string;
    count: number;
    percentage: number;
  }[];
  totalOrders: number;
  percentage: number;
}

export interface AttemptConversionResponse {
  conversionByAttempts: {
    attemptCount: number;
    totalOrders: number;
    confirmedOrders: number;
    conversionRate: number;
  }[];
}

export interface EditRejectedProductsResponse {
  totalOrders: number;
  percentage: number;
  products: {
    productId: number;
    productName: string;
    totalCount: number;
    variants: {
      variant: { label: string; value: string }[];
      count: number;
      percentage: number;
    }[];
  }[];
}

export interface EmployeesListResponse {
  count: number;
  employees: {
    employeeId: number;
    employeeName: string;
    totalOnlineTimeMinutes: number;
    actionsCount: number;
    lastActionAt?: string;
    performance: {
      totalActions: number;
      byStatus: {
        status: string;
        count: number;
        percentage: number;
      }[];
    };
  }[];
}
