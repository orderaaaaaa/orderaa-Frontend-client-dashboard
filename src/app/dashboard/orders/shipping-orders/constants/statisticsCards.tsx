import {
  LiaBoxOpenSolid,
  LiaBoxSolid,
  LiaShippingFastSolid,
  LiaTruckMovingSolid,
} from 'react-icons/lia';
// TODO: Update the import path to point to shipping-orders types when available
import { PrintOrderStatistics } from '../../print-orders/types';

export function buildStatisticsCards(statistics: PrintOrderStatistics | null) {
  //TODO: Update the statistics fields to match shipping orders context when available
  return [
    {
      key: 'confirmed',
      label: 'طلبات مُغلفه',
      desc: 'جاهزة للشحن',
      icon: <LiaBoxSolid className="w-8 h-8 text-primary" />,
      value: statistics?.totalConfirmedOrders ?? 0,
    },
    {
      key: 'notPrinted',
      label: 'شحن داخلي',
      desc: 'تم شحنها داخلياً',
      icon: <LiaTruckMovingSolid className="w-8 h-8 text-primary" />,
      value: statistics?.confirmedNotPrintedOrders ?? 0,
    },
    {
      key: 'printed',
      label: 'شحن محافظات',
      desc: 'تم شحنها لمحافظات',
      icon: <LiaShippingFastSolid className="w-8 h-8 text-primary" />,
      value: statistics?.confirmedPrintedOrders ?? 0,
    },
    {
      key: 'prepared',
      label: 'الطلبات المحضرة',
      desc: 'جاهزة للشحن',
      icon: <LiaBoxOpenSolid className="w-8 h-8 text-primary" />,
      value: statistics?.totalPreparedOrders ?? 0,
    },
  ];
}
