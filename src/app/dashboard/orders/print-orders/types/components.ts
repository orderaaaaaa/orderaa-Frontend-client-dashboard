import type { Order } from '@/types/orders';

export interface ScannedOrder {
  id: number;
  code: string;
  status: string;
  scannedAt: Date;
  cancelReason?: string | null;
  packagingWarning?: string | null;
  printCount?: number;
}

export interface AddOrderInput {
  id: number;
  code: string;
  status: string;
  cancelReason?: string | null;
  packagingWarning?: string | null;
  printCount?: number;
}

export interface NonConfirmedGroup {
  status: string;
  orders: ScannedOrder[];
}

export interface OrderActionCallbacks {
  onPrepared?: () => void;
  onAwaitingPackaging?: () => void;
  onCallAgain?: () => void;
  onChangeProduct?: () => void;
}

export type PositionType = 'fixed' | 'sticky' | 'absolute' | 'static';

export interface PrintOrdersActionsBarProps extends OrderActionCallbacks {
  selectedOrders?: Order[];
  position?: PositionType;
  className?: string;
  isAllSelected?: boolean;
  totalStoreOrders?: number;
  isLoading?: boolean;
  forceShow?: boolean;
  disableActions?: boolean;
  isChangeProductMode?: boolean;
  hideAwaitingPackaging?: boolean;
}

export interface ScannedOrdersTableProps {
  orders: ScannedOrder[];
  onRemove: (code: string) => void;
  flashingCode?: string | null;
  isScanLoading?: boolean;
  searchQuery?: string;
}

export interface ScannedOrdersModalProps extends OrderActionCallbacks {
  isOpen: boolean;
  onClose: () => void;
  scannedOrders: ScannedOrder[];
  confirmedOrders: ScannedOrder[];
  actionableOrders: ScannedOrder[];
  actionableFilteredGroups: NonConfirmedGroup[];
  nonConfirmedGroups: NonConfirmedGroup[];
  onRemoveOrder: (code: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredOrders: ScannedOrder[];
  confirmedFilteredOrders: ScannedOrder[];
  actionableFilteredOrders: ScannedOrder[];
  isLoading: boolean;
  isScanLoading?: boolean;
  flashingCode?: string | null;
  isChangeProductMode?: boolean;
  packagingNotes?: Record<string, string>;
  onPackagingNoteChange?: (code: string, note: string) => void;
  onChangeProductSubmit?: () => void;
}
