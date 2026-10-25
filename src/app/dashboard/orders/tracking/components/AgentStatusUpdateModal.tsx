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
  LiaCheckCircleSolid,
  LiaTimesCircleSolid,
  LiaUndoAltSolid,
} from 'react-icons/lia';
import Link from 'next/link';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Input from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/datepicker';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import ProductSelectionModal, {
  type SelectableProduct,
} from '@/components/ui/product-selection-modal';
import {
  useFollowupAttemptedMutation,
  useFollowupPostponedMutation,
  useFollowupChangeProductsMutation,
  useFollowupSendAgainMutation,
  useFollowupCloseMutation,
  useFollowupRefuseMutation,
  useFollowupCancelledMutation,
  useFollowupOverdueMutation,
  useFollowupUndoClosureMutation,
} from '@/services/followup';
import { useCancellationReasons } from '@/services/orders';
import type { FollowupClosure, FollowupClosureKind } from '@/types/logistics';
import { formatDateTime } from '@/utils/format';

type ActionType =
  | 'FOLLOW_UP'
  | 'POSTPONE'
  | 'CHANGE_PRODUCT'
  | 'RESEND'
  | 'CLOSE'
  | 'REFUSE'
  | 'CANCEL'
  | 'LATE';

type FollowUpSubStatus = 'CLOSED' | 'NO_ANSWER' | 'NOT_COLLECTING' | 'BUSY';

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
  { value: 'CLOSE', label: 'إغلاق اليوم', icon: LiaCheckCircleSolid, color: 'text-slate-600', activeColor: 'border-slate-500 bg-slate-50 ring-1 ring-slate-200' },
  { value: 'REFUSE', label: 'رفض التسليم', icon: LiaTimesCircleSolid, color: 'text-rose-600', activeColor: 'border-rose-500 bg-rose-50 ring-1 ring-rose-200' },
  { value: 'CANCEL', label: 'الغاء', icon: LiaBanSolid, color: 'text-red-600', activeColor: 'border-red-500 bg-red-50 ring-1 ring-red-200' },
  { value: 'LATE', label: 'متاخر', icon: LiaClockSolid, color: 'text-orange-600', activeColor: 'border-orange-500 bg-orange-50 ring-1 ring-orange-200' },
];

const REASON_COPY: Record<
  'CANCEL' | 'REFUSE',
  {
    placeholder: string;
    empty: string;
    settingsLink: string;
    loadError: string;
    containerClassName: string;
  }
> = {
  CANCEL: {
    placeholder: 'اختر سبب الالغاء',
    empty: 'لا توجد أسباب إلغاء متاحة',
    settingsLink: 'أضف أسباب الإلغاء من إعدادات المتجر',
    loadError: 'تعذر تحميل أسباب الإلغاء',
    containerClassName: 'bg-red-50/50 border-red-100',
  },
  REFUSE: {
    placeholder: 'اختر سبب الرفض',
    empty: 'لا توجد أسباب رفض متاحة',
    settingsLink: 'أضف أسباب الرفض من إعدادات المتجر',
    loadError: 'تعذر تحميل أسباب الرفض',
    containerClassName: 'bg-rose-50/50 border-rose-100',
  },
};

export const FOLLOWUP_CLOSURE_KIND_LABELS: Record<FollowupClosureKind, string> = {
  CLOSED_TODAY: 'مغلق لليوم',
  REFUSE: 'مرفوض',
  CANCEL: 'ملغي',
};

function isActionLockedByClosure(action: ActionType, kind: FollowupClosureKind | null): boolean {
  if (kind === 'REFUSE' || kind === 'CANCEL') return true;
  return action === 'CLOSE' && kind === 'CLOSED_TODAY';
}

const FOLLOW_UP_OPTIONS: {
  value: FollowUpSubStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'CLOSED', label: 'مغلق', icon: LiaTimesSolid },
  { value: 'NO_ANSWER', label: 'مش بيرد', icon: LiaPhoneSlashSolid },
  { value: 'NOT_COLLECTING', label: 'مش بيجمع', icon: LiaUserSlashSolid },
  { value: 'BUSY', label: 'مشغول', icon: LiaSpinnerSolid },
];

const FOLLOW_UP_NOTE_LABELS: Record<FollowUpSubStatus, string> = {
  CLOSED: 'مغلق',
  NO_ANSWER: 'مش بيرد',
  NOT_COLLECTING: 'مش بيجمع',
  BUSY: 'مشغول',
};

interface AgentStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  closure?: FollowupClosure | null;
}

export default function AgentStatusUpdateModal({
  isOpen,
  onClose,
  orderId,
  closure = null,
}: AgentStatusUpdateModalProps) {
  const closeMutation = useFollowupCloseMutation();
  const attemptedMutation = useFollowupAttemptedMutation();
  const postponedMutation = useFollowupPostponedMutation();
  const changeProductsMutation = useFollowupChangeProductsMutation();
  const sendAgainMutation = useFollowupSendAgainMutation();
  const refuseMutation = useFollowupRefuseMutation();
  const cancelledMutation = useFollowupCancelledMutation();
  const overdueMutation = useFollowupOverdueMutation();
  const undoMutation = useFollowupUndoClosureMutation();

  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpSubStatus | null>(null);
  const [postponeDate, setPostponeDate] = useState<Date | null>(null);
  const [reasonId, setReasonId] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<SelectableProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const cancellationReasonsQuery = useCancellationReasons(
    isOpen && selectedAction === 'CANCEL',
    'SHIPPING_CANCELLATION'
  );
  const refusalReasonsQuery = useCancellationReasons(
    isOpen && selectedAction === 'REFUSE',
    'REFUSAL_TO_ACCEPT'
  );
  const reasonsQuery = selectedAction === 'REFUSE' ? refusalReasonsQuery : cancellationReasonsQuery;
  const reasonOptions = (reasonsQuery.data ?? []).map((r) => ({
    key: String(r.id),
    label: r.reasonName,
  }));
  const reasonsReady = reasonsQuery.isSuccess && reasonOptions.length > 0;

  const closureKind = closure?.kind ?? null;

  const isSubmitting =
    closeMutation.isPending ||
    attemptedMutation.isPending ||
    postponedMutation.isPending ||
    changeProductsMutation.isPending ||
    sendAgainMutation.isPending ||
    refuseMutation.isPending ||
    cancelledMutation.isPending ||
    overdueMutation.isPending ||
    undoMutation.isPending;

  const resetForm = useCallback(() => {
    setSelectedAction(null);
    setFollowUpStatus(null);
    setPostponeDate(null);
    setReasonId('');
    setReasonText('');
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
    setReasonId('');
    setReasonText('');
    setNotes('');
    setSelectedProduct(null);
  }, []);

  const isConfirmDisabled = useCallback(() => {
    if (!selectedAction) return true;
    if (isActionLockedByClosure(selectedAction, closureKind)) return true;
    switch (selectedAction) {
      case 'FOLLOW_UP':
        return !followUpStatus;
      case 'POSTPONE':
        return !postponeDate;
      case 'CHANGE_PRODUCT':
        return !selectedProduct;
      case 'CLOSE':
        return false;
      case 'REFUSE':
      case 'CANCEL':
        return !reasonsReady || (!reasonId && !reasonText.trim());
      case 'LATE':
        return !notes.trim();
      case 'RESEND':
        return !notes.trim();
      default:
        return true;
    }
  }, [selectedAction, closureKind, followUpStatus, postponeDate, selectedProduct, reasonsReady, reasonId, reasonText, notes]);

  const handleConfirm = useCallback(async () => {
    if (!selectedAction) return;

    try {
      switch (selectedAction) {
        case 'CLOSE':
          await closeMutation.mutateAsync({ orderId });
          break;
        case 'FOLLOW_UP':
          if (!followUpStatus) return;
          await attemptedMutation.mutateAsync({
            orderId,
            note: FOLLOW_UP_NOTE_LABELS[followUpStatus],
          });
          break;
        case 'POSTPONE':
          if (!postponeDate) return;
          await postponedMutation.mutateAsync({
            orderId,
            date: postponeDate.toISOString(),
          });
          break;
        case 'CHANGE_PRODUCT': {
          if (!selectedProduct) return;
          const attributeOptionIds = (selectedProduct.selectedVariants ?? [])
            .map((v) => v.attributeOptionId)
            .filter((id): id is number => id != null);
          const products = [{
            productId: selectedProduct.id,
            quantity: 1,
            attributeOptionIds,
          }];
          await changeProductsMutation.mutateAsync({ orderId, products });
          break;
        }
        case 'RESEND':
          if (!notes.trim()) return;
          await sendAgainMutation.mutateAsync({
            orderId,
            reason: notes.trim(),
          });
          break;
        case 'REFUSE':
        case 'CANCEL': {
          if (!reasonsReady || (!reasonId && !reasonText.trim())) return;
          const reasonPayload = reasonId
            ? { reasonId: Number(reasonId) }
            : { reasonText: reasonText.trim() };
          const payload = {
            orderId,
            ...reasonPayload,
            notes: notes.trim() || undefined,
          };
          if (selectedAction === 'REFUSE') {
            await refuseMutation.mutateAsync(payload);
          } else {
            await cancelledMutation.mutateAsync(payload);
          }
          break;
        }
        case 'LATE':
          if (!notes.trim()) return;
          await overdueMutation.mutateAsync({
            orderId,
            lateNotes: notes.trim(),
          });
          break;
      }
      toast.success('تم تحديث الحالة بنجاح');
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث الحالة');
    }
  }, [
    selectedAction,
    followUpStatus,
    postponeDate,
    selectedProduct,
    reasonsReady,
    reasonId,
    reasonText,
    notes,
    orderId,
    closeMutation,
    attemptedMutation,
    postponedMutation,
    changeProductsMutation,
    sendAgainMutation,
    refuseMutation,
    cancelledMutation,
    overdueMutation,
    handleClose,
  ]);

  const handleUndo = useCallback(async () => {
    try {
      await undoMutation.mutateAsync({ orderId });
      toast.success('تم إعادة فتح الطلب');
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل إعادة فتح الطلب');
    }
  }, [orderId, undoMutation, handleClose]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const renderReasonSection = (kind: 'CANCEL' | 'REFUSE') => {
    const copy = REASON_COPY[kind];
    return (
      <div className={clsx('flex flex-col gap-3 p-4 rounded-xl border', copy.containerClassName)}>
        {reasonsQuery.isLoading ? (
          <div className="flex items-center justify-center py-4">
            <LiaSpinnerSolid className="size-5 animate-spin text-gray-400" />
          </div>
        ) : reasonsQuery.isError ? (
          <p className="text-sm text-red-600">{copy.loadError}</p>
        ) : reasonOptions.length === 0 ? (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-[#ECECEC] bg-white p-4 text-sm text-gray-700">
            <p>{copy.empty}</p>
            <Link href="/dashboard/store-settings" className="font-semibold text-primary hover:underline">
              {copy.settingsLink}
            </Link>
          </div>
        ) : (
          <SearchableSelect
            value={reasonId}
            onChange={(v) => {
              setReasonId(v);
              setReasonText('');
            }}
            options={reasonOptions}
            placeholder={copy.placeholder}
            searchPlaceholder="بحث..."
            emptyMessage="لا توجد أسباب متاحة"
            disabled={isSubmitting}
          />
        )}
        <Input
          type="text"
          value={reasonText}
          onChange={(e) => {
            setReasonText(e.target.value);
            setReasonId('');
          }}
          onClear={() => setReasonText('')}
          clearable
          placeholder="أو اكتب السبب"
          maxLength={255}
          disabled={isSubmitting}
          inputClassName="bg-white"
        />
        <Textarea
          name={kind === 'CANCEL' ? 'cancelNotes' : 'refuseNotes'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ملاحظات (اختياري)"
          maxLength={2000}
          className="min-h-[80px] text-sm bg-white"
        />
      </div>
    );
  };

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
                  disabled={isSubmitting}
                  className={clsx(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30',
                    isSubmitting && 'opacity-60 cursor-not-allowed',
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
                    {v.attribute}: {v.option}
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
      case 'REFUSE':
        return renderReasonSection(selectedAction);

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
          {closure && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-800">
                  {FOLLOWUP_CLOSURE_KIND_LABELS[closure.kind]}
                </span>
                {(closure.reasonName || closure.reasonText) && (
                  <span className="truncate text-xs text-gray-500">
                    {closure.reasonName || closure.reasonText}
                  </span>
                )}
                {closure.notes && (
                  <span className="text-xs text-gray-500">{closure.notes}</span>
                )}
                <span className="text-xs text-gray-400">{formatDateTime(closure.closedAt)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={handleUndo}
                disabled={isSubmitting}
              >
                <LiaUndoAltSolid className="size-3.5" />
                إعادة فتح
              </Button>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {ACTION_OPTIONS.map((action) => {
              const Icon = action.icon;
              const isSelected = selectedAction === action.value;
              const isLocked = isActionLockedByClosure(action.value, closureKind);
              return (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => handleSelectAction(action.value)}
                  disabled={isSubmitting || isLocked}
                  className={clsx(
                    'flex flex-col items-center justify-center gap-1.5 py-3 px-3 min-w-[75px] shrink-0 md:flex-1 md:min-w-0 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    isSelected
                      ? action.activeColor
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
                    (isSubmitting || isLocked) && 'opacity-60 cursor-not-allowed',
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
