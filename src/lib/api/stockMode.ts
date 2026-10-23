import api from './index';

export type StockModeValue = 'TRIAL' | 'ENFORCED';

export interface StockModeApiItem {
  mode: StockModeValue | null;
  stockTrackingStartedAt: string | null;
  stockLiveAt: string | null;
}

export interface NegativeBalanceVariantApi {
  variantId: number;
  productName: string;
  combinationKey: string;
  quantity: number;
}

export interface NegativeBalanceWarehouseApi {
  warehouseId: number;
  warehouseName: string;
  variants: NegativeBalanceVariantApi[];
}

export interface InFlightByStatusApi {
  status: string;
  count: number;
}

export interface GoLiveSummaryApi {
  negativeBalances: NegativeBalanceWarehouseApi[];
  inFlightOrderCount: number;
  inFlightByStatus: InFlightByStatusApi[];
}

export interface GoLiveResultApi {
  mode: 'ENFORCED';
  stockLiveAt: string;
}

export async function getStockMode(): Promise<StockModeApiItem> {
  const response = await api.get('/stock-mode');
  return response.data as StockModeApiItem;
}

export async function getGoLiveSummary(): Promise<GoLiveSummaryApi> {
  const response = await api.get('/stock-mode/go-live-summary');
  return response.data as GoLiveSummaryApi;
}

export async function postGoLive(): Promise<GoLiveResultApi> {
  const response = await api.post('/stock-mode/go-live');
  return response.data as GoLiveResultApi;
}
