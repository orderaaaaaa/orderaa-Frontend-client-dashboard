'use client';

import { LiaSpinnerSolid } from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import { useI18n } from '@/i18n/I18nProvider';
import { useExchangeCandidatesQuery } from '@/services/followup';
import { formatDateTime } from '@/utils/format';
import { formatNumber } from './formatNumber';

interface ExchangeCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export function ExchangeCandidatesModal({ isOpen, onClose, orderId }: ExchangeCandidatesModalProps) {
  const { t } = useI18n();
  const candidatesQuery = useExchangeCandidatesQuery(orderId, isOpen);
  const candidates = candidatesQuery.data?.data ?? [];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="استبدال"
      confirmText="تأكيد"
      confirmDisabled
      maxWidth="md:max-w-2xl"
    >
      <div className="flex flex-col gap-4" dir="rtl">
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{t('exchange.notice')}</p>

        {candidatesQuery.isLoading ? (
          <div className="flex items-center justify-center py-6">
            <LiaSpinnerSolid className="size-5 animate-spin text-gray-400" />
          </div>
        ) : candidatesQuery.isError ? (
          <p className="text-sm text-red-600">تعذر تحميل الطلبات</p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-gray-500">لا توجد طلبات مكتملة لهذا العميل</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-[#ECECEC]"
                >
                  <span className="text-sm font-medium text-[#1F1F1F]">{candidate.code}</span>
                  <span className="text-xs text-gray-500">{ORDER_STATUS_ARABIC_LABELS[candidate.status]}</span>
                  <span className="text-xs text-gray-500">{formatNumber(candidate.totalCost, 2)} جنيه</span>
                  <span className="text-xs text-gray-400">{formatDateTime(candidate.createdAt)}</span>
                </div>
              ))}
            </div>
            <SearchableSelect
              options={candidates.map((candidate) => ({ key: String(candidate.id), label: candidate.code }))}
              placeholder="اختر طلبًا"
              searchPlaceholder="بحث..."
              emptyMessage="لا توجد طلبات"
              disabled
            />
          </>
        )}
      </div>
    </BaseModal>
  );
}
