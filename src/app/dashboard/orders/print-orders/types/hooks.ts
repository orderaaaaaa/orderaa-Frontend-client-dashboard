import type { Order } from '@/types/orders';
import type { ScannedOrder, AddOrderInput, NonConfirmedGroup } from './components';

export interface UseScannedOrdersReturn {
  scannedOrders: ScannedOrder[];
  confirmedOrders: ScannedOrder[];
  actionableOrders: ScannedOrder[];
  actionableGroups: NonConfirmedGroup[];
  nonConfirmedGroups: NonConfirmedGroup[];
  addOrder: (order: AddOrderInput) => boolean;
  removeOrder: (code: string) => void;
  clearOrders: () => void;
  hasOrder: (code: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredOrders: ScannedOrder[];
  confirmedFilteredOrders: ScannedOrder[];
  actionableFilteredOrders: ScannedOrder[];
  actionableFilteredGroups: NonConfirmedGroup[];
}

export interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minCharLength?: number;
  maxCharLength?: number;
  avgTimeThreshold?: number;
  debounceTimeout?: number;
}

export interface UseBarcodeScannerReturn {
  lastScan: string | null;
  isScanning: boolean;
  scanCount: number;
}

export interface UsePrintOrderBulkProps {
  orders: Order[];
}

export interface UsePrintOrderBulkReturn {
  selectMode: boolean;
  setSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSelectMode: () => void;
  selectedOrderIds: number[];
  selectedOrders: Order[];
  selectAllMatchingFilters: boolean;
  handleOrderSelect: (orderId: number, checked: boolean) => void;
  handleSelectAllToggle: () => void;
  clearSelections: () => void;
}

export interface UseScannerFeedbackReturn {
  playSuccessSound: () => void;
  playErrorSound: () => void;
}
