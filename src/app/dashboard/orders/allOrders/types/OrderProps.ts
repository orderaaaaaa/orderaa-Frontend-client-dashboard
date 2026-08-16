import { OrderState, OrderProductVariantInfo, ShippingType } from '@/types/orders';

export interface OrderCardProps {
  id: number;
  code: string;
  name: string;
  phoneNumbers: string[];
  government: string;
  items?: string[];
  itemSkus?: (string | null)[];
  productVariants?: OrderProductVariantInfo[];
  price: number;
  shippingType?: ShippingType;
  trys: number;
  status: string;
  city: string;
  address: string;
  isBlocked?: boolean;
  customerNotes?: string | string[];
  alert: number;
  select: boolean;
  isSelected?: boolean;
  shippingId?: string;
  shippingCompany?: string;
  onSelectionChange?: (checked: boolean) => void;
  createdAt?: string;
  postponedUntil?: string | null;
  repeatCount?: number;
  onRepeatClick?: () => void;
  filterParams?: string;
  cancelReason?: string | null;
  cancelNotes?: string | null;
  /** T8: decimal strings from the API, shown as-is. */
  collectedAmount?: string | null;
  isCollected?: boolean;
  isPartiallyPaid?: boolean;
  isPrinted?: boolean;
  printCount?: number;
  disableNavigation?: boolean;
  hideCustomerInfo?: boolean;
  showAllItems?: boolean;
  states?: OrderState[];
}
