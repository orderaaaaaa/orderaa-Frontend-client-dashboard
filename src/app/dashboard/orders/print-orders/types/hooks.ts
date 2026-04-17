import type { Order } from '@/types/orders';

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
