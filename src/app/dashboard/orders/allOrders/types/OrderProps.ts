export interface OrderCardProps {
  id: number;
  code: string;
  name: string;
  phoneNumbers: string[];
  government: string;
  items: string[];
  price: number;
  trys: number;
  status: string;
  city: string;
  address: string;
  alert: number;
  select: boolean;
  isSelected?: boolean;
  shippingId?: string;
  onSelectionChange?: (checked: boolean) => void;
  createdAt?: string;
  postponedUntil?: string;
  repeatCount?: number;
  onRepeatClick?: () => void;
  filterParams?: string;
  cancelReason?: string | null;
  cancelNotes?: string | null;
}
