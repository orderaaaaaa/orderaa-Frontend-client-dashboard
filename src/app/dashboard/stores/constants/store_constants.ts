import { LiaStoreAltSolid, LiaBoxSolid } from 'react-icons/lia';
import { TbMoneybag } from 'react-icons/tb';
import { HiOutlineReceiptRefund } from 'react-icons/hi';
import { IoBarChartOutline } from 'react-icons/io5';

export interface StoreCardConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STORE_CARDS: StoreCardConfig[] = [
  {
    id: 'total-stores',
    title: 'إجمالي عدد المتاجر',
    icon: LiaStoreAltSolid,
  },
  {
    id: 'total-sales',
    title: 'إجمالي المبيعات',
    icon: TbMoneybag,
  },
  {
    id: 'total-revenue',
    title: 'إجمالي الإيرادات',
    icon: IoBarChartOutline,
  },
  {
    id: 'delivery-rate',
    title: 'متوسط نسبة التسليم',
    icon: LiaBoxSolid,
  },
  {
    id: 'customer-retention',
    title: 'معدل ارتداد العملاء',
    icon: HiOutlineReceiptRefund,
  },
];
