import { IconType } from 'react-icons';
import {
  MdOutlineFiberNew,
  MdCheckCircleOutline,
  MdLoop,
  MdOutlinePayments,
  MdOutlineCalendarMonth,
  MdReceiptLong,
  MdOutlinePhoneCallback,
  MdOutlineInventory2,
  MdOutlineCancel,
  MdErrorOutline,
  MdQuestionMark,
  MdOutlineLocalShipping,
  MdOutlineBlock,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { FaBoxesPacking } from 'react-icons/fa6';

import {
  Repeat,
  Clock3,
  PhoneCall,
  Copy,
  CircleDollarSign,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import { HiOutlineReceiptRefund } from 'react-icons/hi';
// Import the original color function
import { getStatusColor } from '@/app/dashboard/customers/lib/getBadgeColor';
import { LuPenOff } from 'react-icons/lu';
import {
  LiaBanSolid,
  LiaRedoAltSolid,
  LiaWarehouseSolid,
} from 'react-icons/lia';

interface StatusBadgeConfig {
  classes: string;
  Icon: IconType;
}

export const STATUS_ICONS: Record<string, IconType> = {
  TRIED_TO_REACH_CUSTOMER: Repeat,
  WAITING_FOR_PAYMENT: MdOutlinePayments,
  ON_HOLD: Clock3,
  CALLED_CUSTOMER_AGAIN: PhoneCall,
  CANCELLED: MdOutlineCancel,
  UNCOMPLETED: MdErrorOutline,
  CONFIRMED: MdCheckCircleOutline,
  WAITING_FOR_PACKAGING: FaBoxesPacking,
  PREPARED: MdOutlineInventory2,
  EDIT_REJECTED: LuPenOff,
  WHATSAPP: FaWhatsapp,
  WHATSAPP_CONFIRMED: FaWhatsapp,
  SHIPPED: MdOutlineLocalShipping,
  RETURNED: Copy,
  DELIVERED: ClipboardCheck,
  DOWN_PAYMENT: CircleDollarSign,
  MISSING: MdQuestionMark,
  NEW_ORDER: MdOutlineFiberNew,
  STOPPED: MdOutlineBlock,
  CALL_AGAIN: MdOutlinePhoneCallback,
  POSTPONED: MdOutlineCalendarMonth,
  REGISTERED: MdCheckCircleOutline,
  ATTEMPTED: MdLoop,
  RETURNED_DELIVERED: HiOutlineReceiptRefund,
  RETURNED_COLLECTED: HiOutlineReceiptRefund,
  RETURNED_SETTLED: HiOutlineReceiptRefund,
  RETURNED_FINAL: LiaBanSolid,
  REPORTS: FileText,
  SHIPPING: MdOutlineLocalShipping,
  WITH_DRIVER: MdOutlineLocalShipping,
  COLLECTED: CircleDollarSign,
  WAITING_FOR_APPROVAL: Clock3,

  // Frontend-only legacy keys — not OrderStatus members.
  PARTIAL_DELIVERY: MdReceiptLong,
  FINAL_RETURN: LiaBanSolid,
  RETURN_RESEND_PENDING: LiaRedoAltSolid,
  RETURN_WAREHOUSE: LiaWarehouseSolid,
};

export const getStatusBadgeConfig = (status: string): StatusBadgeConfig => {
  return {
    classes: getStatusColor(status),
    Icon: STATUS_ICONS[status] || MdOutlineFiberNew,
  };
};
