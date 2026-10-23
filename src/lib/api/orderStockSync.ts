import api from './index';
import type {
  OrderStockRepairResult,
  PreparedDriftPage,
} from '@/types/orderStockSync';

export const getPreparedDrift = async (
  page: number,
  pageSize: number
): Promise<PreparedDriftPage> => {
  const response = await api.get<PreparedDriftPage>(
    '/stock-movements/orders/prepared-drift',
    { params: { page, pageSize } }
  );
  return response.data;
};

export const repairOrderStock = async (
  orderId: number
): Promise<OrderStockRepairResult> => {
  const response = await api.post<OrderStockRepairResult>(
    `/stock-movements/orders/${orderId}/repair`
  );
  return response.data;
};
