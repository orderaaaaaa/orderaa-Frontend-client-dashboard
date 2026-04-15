'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  LiaTruckSolid,
  LiaHeadsetSolid,
  LiaChevronLeftSolid,
  LiaCheckCircleSolid,
  LiaTimesCircleSolid,
  LiaPhoneSolid,
  LiaUserSolid,
  LiaPlusSolid,
} from 'react-icons/lia';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useUpdateTrackingCard } from '@/services/logistics';
import type { TrackingCard as TrackingCardType, AgentFlag } from '@/types/logistics';
import AgentStatusUpdateModal from './AgentStatusUpdateModal';

const TRACKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'في الانتظار',
  COMPLETED: 'مكتمل',
  OVERDUE: 'متأخر',
  PAUSED: 'متوقف',
  CANCELLED: 'ملغى',
};

const TRACKING_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  COMPLETED: '#22c55e',
  OVERDUE: '#ef4444',
  PAUSED: '#6b7280',
  CANCELLED: '#ef4444',
};

const AGENT_STATUS_LABELS: Record<string, string> = {
  CLOSED: 'مغلق',
  NO_ANSWER: 'مش بيرد',
  NOT_COLLECTING: 'مش بيجمع',
  BUSY: 'مشغول',
  POSTPONE: 'تأجيل',
};

const FLAG_LABELS: Record<string, { label: string; color: string }> = {
  CORRECT: { label: 'تحديث صحيح', color: 'text-green-600 bg-green-50 border-green-200' },
  FAKE: { label: 'تحديث خاطئ', color: 'text-red-600 bg-red-50 border-red-200' },
};

interface TrackingCardProps {
  card: TrackingCardType;
}

export default function TrackingCard({ card }: TrackingCardProps) {
  const statusLabel = TRACKING_STATUS_LABELS[card.status] || card.status;
  const statusColor = TRACKING_STATUS_COLORS[card.status] || '#9ca3af';

  const updateMutation = useUpdateTrackingCard();

  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newCourierUpdate, setNewCourierUpdate] = useState('');
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);

  const [showFlagButtons, setShowFlagButtons] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const customerPhone = (card.order?.customers as any)?.phone_numbers?.[0];
  const customerName = (card.order?.customers as any)?.name;
  const orderProducts = (card.order as any)?.order_products as any[] | undefined;

  const handleSaveCourierUpdate = useCallback(async () => {
    if (!newCourierUpdate.trim()) return;
    setIsSavingUpdate(true);
    try {
      await updateMutation.mutateAsync({
        cardId: card.id,
        update: { courierUpdate: newCourierUpdate.trim() },
      });
      toast.success('تم إضافة التحديث بنجاح');
      setShowAddUpdate(false);
      setNewCourierUpdate('');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل إضافة التحديث');
    } finally {
      setIsSavingUpdate(false);
    }
  }, [card.id, newCourierUpdate, updateMutation]);

  const handleFlag = useCallback(async (flag: AgentFlag) => {
    setIsFlagging(true);
    try {
      await updateMutation.mutateAsync({
        cardId: card.id,
        update: { agentFlag: flag },
      });
      toast.success('تم تحديث حالة المندوب بنجاح');
      setShowFlagButtons(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث الحالة');
    } finally {
      setIsFlagging(false);
    }
  }, [card.id, updateMutation]);

  return (
    <>
      <Card className="gap-0 py-0">
        <div dir="rtl" className="grid grid-cols-3 items-center gap-4 border-b bg-gray-50/50 px-4 py-3">
          <div className="flex flex-col gap-1">
            <Link
              href={`/dashboard/orders/${card.orderId}`}
              className="font-semibold text-base text-primary hover:underline"
            >
              الطلب #{card.orderCode}
            </Link>
          </div>

          <div className="flex flex-col items-center gap-0.5 text-sm text-gray-500">
            {card.courierName && (
              <span className="font-medium text-gray-700">{card.courierName}</span>
            )}
            {card.courierPhone && (
              <a href={`tel:${card.courierPhone}`} dir="ltr" className="hover:text-primary transition-colors">
                {card.courierPhone}
              </a>
            )}
            {!card.courierName && !card.courierPhone && (
              <span className="text-xs text-gray-400">لا يوجد بيانات المندوب</span>
            )}
          </div>

          <span
            className="inline-flex items-center justify-self-end px-3 py-1 rounded-full text-xs font-medium border"
            style={{ color: statusColor, backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }}
          >
            {statusLabel}
          </span>
        </div>

        <div dir="rtl" className="flex items-center justify-between border-b px-4 py-2 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {customerName && (
              <span className="flex items-center gap-1">
                <LiaUserSolid className="size-3.5" />
                {customerName}
              </span>
            )}
            {customerPhone && (
              <a href={`tel:${customerPhone}`} className="flex items-center gap-1 hover:text-primary transition-colors" dir="ltr">
                <LiaPhoneSolid className="size-3.5" />
                {customerPhone}
              </a>
            )}
          </div>
        </div>

        {(card.order?.totalCost || orderProducts?.length) && (
          <div dir="rtl" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-2 text-sm">
            {card.order?.totalCost != null && (
              <span className="font-semibold text-gray-700">
                السعر: {card.order.totalCost} ج.م
              </span>
            )}
            {orderProducts?.map((op: any, idx: number) => (
              <span key={idx} className="text-gray-500">
                {op.products?.name || op.productName}
                {op.variants?.length > 0 && (
                  <span className="text-gray-400 mr-1">
                    ({op.variants.map((v: any) => v.value).join(' - ')})
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        <CardContent className="p-4 space-y-4" dir="rtl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LiaTruckSolid className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-gray-500">تحديث المندوب</p>
            </div>

            {!card.courierUpdate ? (
              <div className="bg-gray-50 rounded-lg p-3">
                {showAddUpdate ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      name="courierUpdate"
                      value={newCourierUpdate}
                      onChange={(e) => setNewCourierUpdate(e.target.value)}
                      placeholder="اكتب تحديث المندوب..."
                      className="min-h-[80px] text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddUpdate(false);
                          setNewCourierUpdate('');
                        }}
                        disabled={isSavingUpdate}
                      >
                        إلغاء
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveCourierUpdate}
                        disabled={!newCourierUpdate.trim() || isSavingUpdate}
                      >
                        {isSavingUpdate ? 'جاري الحفظ...' : 'حفظ'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">لا يوجد تحديث</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setShowAddUpdate(true)}
                    >
                      <LiaPlusSolid className="size-3.5" />
                      اضافة تحديث
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                {card.agentFlag ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-800">{card.courierUpdate}</p>
                    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', FLAG_LABELS[card.agentFlag].color)}>
                      {FLAG_LABELS[card.agentFlag].label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm text-gray-800">{card.courierUpdate}</p>
                    <button
                      type="button"
                      onClick={() => setShowFlagButtons(!showFlagButtons)}
                      className="p-1 rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      <LiaChevronLeftSolid className={clsx('size-4 text-gray-400 transition-transform duration-300', showFlagButtons && 'rotate-180')} />
                    </button>
                    <div className={clsx(
                      'flex items-center gap-1.5 transition-all duration-300 ease-in-out overflow-hidden',
                      showFlagButtons ? 'max-w-[80px] opacity-100' : 'max-w-0 opacity-0',
                    )}>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        className="border-green-300 text-green-600 hover:bg-green-50"
                        onClick={() => handleFlag('CORRECT')}
                        disabled={isFlagging}
                      >
                        <LiaCheckCircleSolid className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleFlag('FAKE')}
                        disabled={isFlagging}
                      >
                        <LiaTimesCircleSolid className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LiaHeadsetSolid className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-gray-500">حالة موظف المتابعة</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
              >
                تحديث الحالة
              </Button>
            </div>

            {card.agentStatus ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-primary">
                  {AGENT_STATUS_LABELS[card.agentStatus] || card.agentStatus}
                </p>
                {card.agentStatus === 'POSTPONE' && card.postponedUntil && (
                  <p className="text-xs text-gray-500">
                    تأجيل إلى: {new Date(card.postponedUntil).toLocaleDateString('ar-EG')}
                  </p>
                )}
                {card.agentNote && (
                  <p className="text-xs text-gray-500">{card.agentNote}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                لا يوجد تحديثات
              </p>
            )}
          </div>

          {card.completedAt && (
            <p className="text-xs text-gray-400 text-center pt-1">
              تم الإكمال: {new Date(card.completedAt).toLocaleString('ar-EG')}
            </p>
          )}
        </CardContent>
      </Card>

      <AgentStatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        cardId={card.id}
      />
    </>
  );
}
