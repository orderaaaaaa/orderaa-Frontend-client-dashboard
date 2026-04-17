import type { Order } from '@/types/orders';

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
