'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import {
  LiaPhoneVolumeSolid,
  LiaCalendarAltSolid,
  LiaExchangeAltSolid,
  LiaRedoAltSolid,
  LiaBanSolid,
  LiaClockSolid,
  LiaTimesSolid,
  LiaPhoneSlashSolid,
  LiaUserSlashSolid,
  LiaSpinnerSolid,
} from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import ProductSelectionModal, {
  type SelectableProduct,
} from '@/components/ui/product-selection-modal';
import { useUpdateTrackingCard } from '@/services/logistics';
import { useShippingCancellationReasons } from '@/services/logistics';
import type { TrackingAgentStatus, UpdateTrackingCardData } from '@/types/logistics';

type ActionType =
  | 'FOLLOW_UP'
  | 'POSTPONE'
  | 'CHANGE_PRODUCT'
  | 'RESEND'
  | 'CANCEL'
  | 'LATE';

const ACTION_OPTIONS: {
  value: ActionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeColor: string;
}[] = [
  { value: 'FOLLOW_UP', label: 'متابعة', icon: LiaPhoneVolumeSolid, color: 'text-blue-600', activeColor: 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' },
  { value: 'POSTPONE', label: 'تأجيل', icon: LiaCalendarAltSolid, color: 'text-amber-600', activeColor: 'border-amber-500 bg-amber-50 ring-1 ring-amber-200' },
  { value: 'CHANGE_PRODUCT', label: 'تغيير منتج', icon: LiaExchangeAltSolid, color: 'text-violet-600', activeColor: 'border-violet-500 bg-violet-50 ring-1 ring-violet-200' },
  { value: 'RESEND', label: 'اعادة ارسال', icon: LiaRedoAltSolid, color: 'text-cyan-600', activeColor: 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-200' },
  { value: 'CANCEL', label: 'الغاء', icon: LiaBanSolid, color: 'text-red-600', activeColor: 'border-red-500 bg-red-50 ring-1 ring-red-200' },
  { value: 'LATE', label: 'متاخر', icon: LiaClockSolid, color: 'text-orange-600', activeColor: 'border-orange-500 bg-orange-50 ring-1 ring-orange-200' },
];

const FOLLOW_UP_OPTIONS: {
  value: TrackingAgentStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'CLOSED', label: 'مغلق', icon: LiaTimesSolid },
  { value: 'NO_ANSWER', label: 'مش بيرد', icon: LiaPhoneSlashSolid },
  { value: 'NOT_COLLECTING', label: 'مش بيجمع', icon: LiaUserSlashSolid },
  { value: 'BUSY', label: 'مشغول', icon: LiaSpinnerSolid },
];

interface AgentStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: number;
}

export default function AgentStatusUpdateModal({
  isOpen,
  onClose,
  cardId,
}: AgentStatusUpdateModalProps) {
  const updateMutation = useUpdateTrackingCard();
  const { data: cancellationReasons } = useShippingCancellationReasons(isOpen);

  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [followUpStatus, setFollowUpStatus] = useState<TrackingAgentStatus | null>(null);
  const [postponeDate, setPostponeDate] = useState<Date | null>(null);
  const [cancelReasonId, setCancelReasonId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<SelectableProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedAction(null);
    setFollowUpStatus(null);
    setPostponeDate(null);
    setCancelReasonId('');
    setNotes('');
    setSelectedProduct(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSelectAction = useCallback((action: ActionType) => {
    setSelectedAction((prev) => (prev === action ? null : action));
    setFollowUpStatus(null);
    setPostponeDate(null);
    setCancelReasonId('');
    setNotes('');
    setSelectedProduct(null);
  }, []);

  const isConfirmDisabled = useCallback(() => {
    if (!selectedAction) return true;
    switch (selectedAction) {
      case 'FOLLOW_UP':
        return !followUpStatus;
      case 'POSTPONE':
        return !postponeDate;
      case 'CHANGE_PRODUCT':
        return !selectedProduct;
      case 'CANCEL':
        return !cancelReasonId;
      case 'LATE':
        return !notes.trim();
      case 'RESEND':
        return !notes.trim();
      default:
        return true;
    }
  }, [selectedAction, followUpStatus, postponeDate, selectedProduct, cancelReasonId, notes]);

  const buildPayload = useCallback((): UpdateTrackingCardData => {
    switch (selectedAction) {
      case 'FOLLOW_UP':
        return { agentStatus: followUpStatus! };
      case 'POSTPONE':
        return { agentStatus: 'POSTPONE', postponedUntil: postponeDate?.toISOString() };
      case 'CHANGE_PRODUCT':
        return {
          action: 'CHANGE_PRODUCT',
          newProductId: selectedProduct!.id,
          newVariants: selectedProduct!.selectedVariants?.map((v) => ({ label: v.label, value: v.value })),
        };
      case 'RESEND':
        return { action: 'RESEND', actionNote: notes };
      case 'CANCEL':
        return { action: 'CANCEL', cancelReasonId: Number(cancelReasonId), actionNote: notes || undefined };
      case 'LATE':
        return { action: 'LATE', actionNote: notes };
      default:
        return {};
    }
  }, [selectedAction, followUpStatus, postponeDate, selectedProduct, cancelReasonId, notes]);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        cardId,
        update: buildPayload(),
      });
      toast.success('تم تحديث الحالة بنجاح');
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث الحالة');
    } finally {
      setIsSubmitting(false);
    }
  }, [cardId, buildPayload, updateMutation, handleClose]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const cancellationOptions = (cancellationReasons || []).map((r) => ({
    key: String(r.id),
    label: r.reasonName,
  }));

  const renderSubContent = () => {
    if (!selectedAction) return null;

    switch (selectedAction) {
      case 'FOLLOW_UP':
        return (
          <div className="grid grid-cols-2 gap-2">
            {FOLLOW_UP_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = followUpStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFollowUpStatus(opt.value)}
                  className={clsx(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30',
                  )}
                >
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500',
                  )}>
                    <Icon className="size-4" />
                  </div>
                  <span className={clsx(
                    'text-sm font-medium',
                    isSelected ? 'text-blue-700' : 'text-gray-700',
                  )}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'POSTPONE':
        return (
          <div className="flex flex-col gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
            <p className="text-sm font-semibold text-amber-800">تأجيل ليوم</p>
            <DatePicker
              selected={postponeDate}
              onChange={setPostponeDate}
              placeholder="اختر تاريخ التأجيل"
              minDate={tomorrow}
            />
          </div>
        );

      case 'CHANGE_PRODUCT':
        return (
          <div className="flex flex-col gap-3 p-4 bg-violet-50/50 rounded-xl border border-violet-100">
            <Button
              variant="outline"
              className="justify-start gap-2 border-dashed border-violet-300 text-violet-700 hover:bg-violet-50"
              onClick={() => setIsProductModalOpen(true)}
            >
              <LiaExchangeAltSolid className="size-4" />
              {selectedProduct ? selectedProduct.name : 'اختر المنتج'}
            </Button>
            {selectedProduct?.selectedVariants && selectedProduct.selectedVariants.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.selectedVariants.map((v, i) => (
                  <span key={i} className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium">
                    {v.label}: {v.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'RESEND':
        return (
          <div className="flex flex-col gap-3 p-4 bg-cyan-50/50 rounded-xl border border-cyan-100">
            <p className="text-sm font-semibold text-cyan-800">سبب إعادة الإرسال</p>
            <Textarea
              name="resendReason"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب سبب إعادة الإرسال..."
              className="min-h-[80px] text-sm bg-white"
            />
          </div>
        );

      case 'CANCEL':
        return (
          <div className="flex flex-col gap-3 p-4 bg-red-50/50 rounded-xl border border-red-100">
            <SearchableSelect
              value={cancelReasonId}
              onChange={setCancelReasonId}
              options={cancellationOptions}
              placeholder="اختر سبب الالغاء"
              searchPlaceholder="بحث..."
              emptyMessage="لا توجد أسباب متاحة"
            />
            <Textarea
              name="cancelNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات (اختياري)"
              className="min-h-[80px] text-sm bg-white"
            />
          </div>
        );

      case 'LATE':
        return (
          <div className="flex flex-col gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
            <p className="text-sm font-semibold text-orange-800">ملاحظات التأخير</p>
            <Textarea
              name="lateNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك..."
              className="min-h-[80px] text-sm bg-white"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="تحديث حالة المتابعة"
        onConfirm={handleConfirm}
        confirmText="تأكيد"
        confirmDisabled={isConfirmDisabled()}
        isLoading={isSubmitting}
        maxWidth="md:max-w-2xl"
      >
        <div className="flex flex-col gap-4" dir="rtl">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {ACTION_OPTIONS.map((action) => {
              const Icon = action.icon;
              const isSelected = selectedAction === action.value;
              return (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => handleSelectAction(action.value)}
                  className={clsx(
                    'flex flex-col items-center justify-center gap-1.5 py-3 px-3 min-w-[75px] shrink-0 md:flex-1 md:min-w-0 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    isSelected
                      ? action.activeColor
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                  )}
                >
                  <div className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200',
                    isSelected ? 'bg-white/80 shadow-sm' : 'bg-gray-50',
                  )}>
                    <Icon className={clsx('size-5', isSelected ? action.color : 'text-gray-400')} />
                  </div>
                  <span className={clsx(
                    'text-[11px] font-semibold leading-tight text-center',
                    isSelected ? action.color : 'text-gray-500',
                  )}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedAction && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              {renderSubContent()}
            </div>
          )}
        </div>
      </BaseModal>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onConfirm={(products) => {
          if (products.length > 0) {
            setSelectedProduct(products[0]);
          }
          setIsProductModalOpen(false);
        }}
      />
    </>
  );
}
