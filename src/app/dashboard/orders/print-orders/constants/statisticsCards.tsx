import {
  LiaBoxOpenSolid,
  LiaCheckCircleSolid,
  LiaFileAltSolid,
  LiaPrintSolid,
} from 'react-icons/lia';
import { PrintOrderStatistics } from '../types';

export function buildStatisticsCards(statistics: PrintOrderStatistics | null) {
  return [
    {
      key: 'confirmed',
      label: 'الطلبات المؤكدة',
      desc: 'جاهزة للطباعة',
      icon: <LiaCheckCircleSolid className="w-8 h-8 text-primary" />,
      value: statistics?.totalConfirmedOrders ?? 0,
    },
    {
      key: 'notPrinted',
      label: 'الطلبات الغير مطبوعة',
      desc: 'بحاجة للطباعة',
      icon: <LiaPrintSolid className="w-8 h-8 text-primary" />,
      value: statistics?.confirmedNotPrintedOrders ?? 0,
    },
    {
      key: 'printed',
      label: 'الطلبات المطبوعة',
      desc: 'تم الطباعة',
      icon: <LiaFileAltSolid className="w-8 h-8 text-primary" />,
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
