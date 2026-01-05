import { IconType } from 'react-icons';
import {
  MdOutlineFiberNew,
  MdLoop,
  MdOutlinePayments,
  MdOutlineCalendarMonth,
  MdOutlinePhoneCallback,
  MdOutlineBlock,
  MdOutlineCancel,
  MdOutlineInventory2,
  MdOutlineLocalShipping,
  MdCheckCircleOutline,
  MdErrorOutline,
  MdAssignmentReturn,
  MdPriceCheck,
  MdQuestionMark,
  MdReceiptLong,
} from 'react-icons/md';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { FaWhatsapp } from 'react-icons/fa';

// Import the original color function
import { getStatusColor } from '@/app/dashboard/customers/lib/getBadgeColor';

interface StatusBadgeConfig {
  classes: string;
  Icon: IconType;
}

const STATUS_ICONS: Record<string, IconType> = {
  NEW_ORDER: MdOutlineFiberNew,
  CONFIRMED: MdCheckCircleOutline,
  ATTEMPTED: MdLoop,
  WAITING_FOR_PAYMENT: MdOutlinePayments,
  POSTPONED: MdOutlineCalendarMonth,
  PARTIAL_DELIVERY: MdReceiptLong,
  WHATSAPP: FaWhatsapp,
  CALL_AGAIN: MdOutlinePhoneCallback,
  PREPARED: MdOutlineInventory2,
  EDIT_REJECTED: IoMdCloseCircleOutline,
  STOPPED: MdOutlineBlock,
  CANCELLED: MdOutlineCancel,
  UNCOMPLETED: MdErrorOutline,
  MISSING: MdQuestionMark,
  SHIPPING: MdOutlineLocalShipping,
  RETURNED_DELIVERED: MdAssignmentReturn,
  DELIVERED: MdPriceCheck,
};

export const getStatusBadgeConfig = (status: string): StatusBadgeConfig => {
  return {
    classes: getStatusColor(status),
    Icon: STATUS_ICONS[status] || MdOutlineFiberNew,
  };
};
