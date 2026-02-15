'use client';

import { useMemo } from 'react';
import {
  SummaryStatCard,
  SummaryStatCardSkeleton,
} from '@/components/ui/summary-stat-card';
import BaseModal from '@/components/ui/base-modal';
import { LiaStopwatchSolid } from 'react-icons/lia';
import type { DashboardSummary, FirstAttemptData } from '../types';
import {
  buildActiveStoppedCards,
  buildOrderStatusCards,
  buildTotalsCards,
} from '../constants';
import { useSummaryModal, useSummaryModalData } from '../hooks';
import { formatMinutesToArabic } from '../utils';
import {
  EmployeeListModalContent,
  OrderStatusModalContent,
  CancelledOrdersModalContent,
} from './modals';

interface TodaySummarySectionProps {
  summary: DashboardSummary;
  firstAttempt: FirstAttemptData;
  isLoading: boolean;
}

const CLICKABLE_ORDER_CARDS = ['followUp', 'incomplete', 'cancelled'];

export function TodaySummarySection({
  summary,
  firstAttempt,
  isLoading,
}: TodaySummarySectionProps) {
  const { modalType, isOpen, openModal, closeModal } = useSummaryModal();

  const {
    followUpModalData,
    incompleteModalData,
    cancelledModalSummary,
    cancelledOrderDetails,
    activeEmployeesModalData,
    activeEmployeesPerformance,
    stoppedEmployeesModalData,
    stoppedEmployeesPerformance,
    isModalLoading,
  } = useSummaryModalData(modalType);

  const activeStoppedCards = useMemo(
    () => buildActiveStoppedCards(summary),
    [summary],
  );
  const orderStatusCards = useMemo(
    () => buildOrderStatusCards(summary),
    [summary],
  );
  const totalsCards = useMemo(() => buildTotalsCards(summary), [summary]);

  const modalConfig = useMemo(
    () => ({
      active: {
        title: 'الموظفون النشطون',
        data: activeEmployeesModalData,
        type: 'employee' as const,
      },
      stopped: {
        title: 'الموظفون المتوقفون',
        data: stoppedEmployeesModalData,
        type: 'employee' as const,
      },
      followUp: {
        title: 'طلبات المتابعة',
        data: followUpModalData,
        type: 'order' as const,
      },
      incomplete: {
        title: 'طلبات غير مكتمله',
        data: incompleteModalData,
        type: 'order' as const,
      },
      cancelled: {
        title: 'طلبات ملغاة',
        data: cancelledModalSummary,
        type: 'cancelled' as const,
      },
    }),
    [
      activeEmployeesModalData,
      stoppedEmployeesModalData,
      followUpModalData,
      incompleteModalData,
      cancelledModalSummary,
    ],
  );

  const currentModalConfig = modalType ? modalConfig[modalType] : null;

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">ملخص اليوم</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryStatCardSkeleton />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <SummaryStatCard
          icon={<LiaStopwatchSolid className="w-6 h-6 text-primary" />}
          iconBgClassName="bg-purple-100"
          label="أول محاولة تتم بعد"
          value={formatMinutesToArabic(firstAttempt.minutes)}
        />
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
        {isModalLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : currentModalConfig?.data.length === 0 ? (
          <p className="py-12 text-center text-gray-500">لا توجد بيانات</p>
        ) : (
          <>
            {currentModalConfig?.type === 'employee' && (
              <EmployeeListModalContent
                data={currentModalConfig.data}
                performanceData={
                  modalType === 'active'
                    ? activeEmployeesPerformance
                    : modalType === 'stopped'
                      ? stoppedEmployeesPerformance
                      : undefined
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
          </>
        )}
      </BaseModal>
    </section>
  );
}
