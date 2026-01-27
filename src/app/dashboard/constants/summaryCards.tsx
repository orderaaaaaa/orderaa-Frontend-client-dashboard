import {
  LiaUsersSolid,
  LiaCheckCircleSolid,
  LiaSyncAltSolid,
  LiaClipboardListSolid,
  LiaTimesCircleSolid,
  LiaCheckSquareSolid,
  LiaListAltSolid,
} from 'react-icons/lia';
import { DashboardSummary, SummaryCardConfig } from '../types';

export function buildActiveStoppedCards(
  data: DashboardSummary | null,
): SummaryCardConfig[] {
  return [
    {
      key: 'activeNow',
      label: 'نشطون الآن',
      value: data?.activeNow ?? 0,
      icon: <LiaUsersSolid className="w-6 h-6 text-green-600" />,
      iconBgClassName: 'bg-green-100',
    },
    {
      key: 'stoppedNow',
      label: 'متوقفون الآن',
      value: data?.stoppedNow ?? 0,
      icon: <LiaUsersSolid className="w-6 h-6 text-gray-500" />,
      iconBgClassName: 'bg-gray-100',
    },
  ];
}

export function buildOrderStatusCards(
  data: DashboardSummary | null,
): SummaryCardConfig[] {
  return [
    {
      key: 'confirmed',
      label: 'طلبات مؤكده',
      value: data?.confirmedOrders ?? 0,
      icon: <LiaCheckCircleSolid className="w-6 h-6 text-green-600" />,
      iconBgClassName: 'bg-green-100',
    },
    {
      key: 'followUp',
      label: 'طلبات متابعة',
      value: data?.followUpOrders ?? 0,
      icon: <LiaSyncAltSolid className="w-6 h-6 text-blue-600" />,
      iconBgClassName: 'bg-blue-100',
    },
    {
      key: 'incomplete',
      label: 'طلبات غير مكتمله',
      value: data?.incompleteOrders ?? 0,
      icon: <LiaClipboardListSolid className="w-6 h-6 text-orange-500" />,
      iconBgClassName: 'bg-orange-100',
    },
    {
      key: 'cancelled',
      label: 'طلبات ملغاة',
      value: data?.cancelledOrders ?? 0,
      icon: <LiaTimesCircleSolid className="w-6 h-6 text-red-500" />,
      iconBgClassName: 'bg-red-100',
    },
  ];
}

export function buildTotalsCards(
  data: DashboardSummary | null,
): SummaryCardConfig[] {
  return [
    {
      key: 'executed',
      label: 'إجمالي الطلبات المنفذة',
      value: data?.executedOrders ?? 0,
      icon: <LiaCheckSquareSolid className="w-6 h-6 text-green-600" />,
      iconBgClassName: 'bg-green-100',
    },
    {
      key: 'remaining',
      label: 'إجمالي الطلبات المتبقية',
      value: data?.remainingOrders ?? 0,
      icon: <LiaListAltSolid className="w-6 h-6 text-orange-500" />,
      iconBgClassName: 'bg-orange-100',
    },
  ];
}
