'use client';

import { useMemo } from 'react';
import {
  SummaryStatCard,
  SummaryStatCardSkeleton,
} from '@/components/ui/summary-stat-card';
import BaseModal from '@/components/ui/base-modal';
import type { DashboardSummary } from '../types';
import {
  buildActiveStoppedCards,
  buildOrderStatusCards,
  buildTotalsCards,
  activeEmployeesData,
  stoppedEmployeesData,
  followUpOrdersData,
  incompleteOrdersData,
  cancelledOrdersData,
  cancelledOrderDetails,
  EMPLOYEE_PERFORMANCE_DATA,
} from '../constants';
import { useSummaryModal } from '../hooks';
import {
  EmployeeListModalContent,
  OrderStatusModalContent,
  CancelledOrdersModalContent,
} from './modals';

interface TodaySummarySectionProps {
  summary: DashboardSummary;
  isLoading: boolean;
}

const MODAL_CONFIG = {
  active: {
    title: 'الموظفون النشطون',
    data: activeEmployeesData,
    type: 'employee' as const,
  },
  stopped: {
    title: 'الموظفون المتوقفون',
    data: stoppedEmployeesData,
    type: 'employee' as const,
  },
  followUp: {
    title: 'طلبات المتابعة',
    data: followUpOrdersData,
    type: 'order' as const,
  },
  incomplete: {
    title: 'طلبات غير مكتمله',
    data: incompleteOrdersData,
    type: 'order' as const,
  },
  cancelled: {
    title: 'طلبات ملغاة',
    data: cancelledOrdersData,
    type: 'cancelled' as const,
  },
};

const CLICKABLE_ORDER_CARDS = ['followUp', 'incomplete', 'cancelled'];

export function TodaySummarySection({
  summary,
  isLoading,
}: TodaySummarySectionProps) {
  const { modalType, isOpen, openModal, closeModal } = useSummaryModal();

  const activeStoppedCards = useMemo(
    () => buildActiveStoppedCards(summary),
    [summary],
  );
  const orderStatusCards = useMemo(
    () => buildOrderStatusCards(summary),
    [summary],
  );
  const totalsCards = useMemo(() => buildTotalsCards(summary), [summary]);

  const currentModalConfig = modalType ? MODAL_CONFIG[modalType] : null;

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">ملخص اليوم</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryStatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-primary">ملخص اليوم</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeStoppedCards.map((card) => (
          <SummaryStatCard
            key={card.key}
            icon={card.icon}
            iconBgClassName={card.iconBgClassName}
            label={card.label}
            value={card.value}
            onClick={() => openModal(card.key)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStatusCards.map((card) => (
          <SummaryStatCard
            key={card.key}
            icon={card.icon}
            iconBgClassName={card.iconBgClassName}
            label={card.label}
            value={card.value}
            onClick={
              CLICKABLE_ORDER_CARDS.includes(card.key)
                ? () => openModal(card.key)
                : undefined
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {totalsCards.map((card) => (
          <SummaryStatCard
            key={card.key}
            icon={card.icon}
            iconBgClassName={card.iconBgClassName}
            label={card.label}
            value={card.value}
          />
        ))}
      </div>

      <BaseModal
        isOpen={isOpen}
        onClose={closeModal}
        title={currentModalConfig?.title ?? ''}
        showFooter={false}
        maxWidth="md:max-w-[900px]"
      >
        {currentModalConfig?.type === 'employee' && (
          <EmployeeListModalContent
            data={currentModalConfig.data}
            performanceData={
              modalType === 'active' ? EMPLOYEE_PERFORMANCE_DATA : undefined
            }
          />
        )}
        {currentModalConfig?.type === 'order' && (
          <OrderStatusModalContent data={currentModalConfig.data} />
        )}
        {currentModalConfig?.type === 'cancelled' && (
          <CancelledOrdersModalContent
            summaryData={currentModalConfig.data}
            orderDetails={cancelledOrderDetails}
          />
        )}
      </BaseModal>
    </section>
  );
}
