import type { ReactNode } from 'react';

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
  forceActionable: (orderId: number) => void;
}

export interface ScannedOrdersTableProps {
  orders: ScannedOrder[];
  onRemove: (code: string) => void;
  flashingCode?: string | null;
  isScanLoading?: boolean;
  searchQuery?: string;
}

export interface ScannedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  scannedOrders: ScannedOrder[];
  actionableOrders: ScannedOrder[];
  actionableFilteredGroups: NonConfirmedGroup[];
  actionableFilteredOrders: ScannedOrder[];
  nonConfirmedGroups: NonConfirmedGroup[];
  onRemoveOrder: (code: string) => void;
  onForceActionable?: (orderId: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isScanLoading?: boolean;
  flashingCode?: string | null;
  actionsBar: ReactNode;
  showChangeProductMode?: boolean;
  isChangeProductMode?: boolean;
  onChangeProductBack?: () => void;
  packagingNotes?: Record<string, string>;
  onPackagingNoteChange?: (code: string, note: string) => void;
}
