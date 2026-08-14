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
  LiaSpinnerSolid,
} from 'react-icons/lia';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useUpdateTrackingCard } from '@/services/logistics';
import { useRecordFollowupEventPointMutation } from '@/services/followup';
import { useHasPermission } from '@/hooks/usePermissions';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import { getStatusColor } from '@/app/dashboard/customers/lib/getBadgeColor';
import type { TrackingCard as TrackingCardType, ShippingPointType } from '@/types/logistics';
import AgentStatusUpdateModal from './AgentStatusUpdateModal';

const AGENT_STATUS_LABELS: Record<string, string> = {
  ATTEMPTED: 'تم المحاولة',
  POSTPONED: 'تم التأجيل',
  CHANGE_PRODUCTS: 'تم تغيير المنتجات',
  SEND_AGAIN: 'إعادة إرسال',
  CANCELLED: 'تم الإلغاء',
  OVERDUE: 'متأخر',
};

const FLAG_LABELS: Record<string, { label: string; color: string }> = {
  CORRECT: { label: 'تحديث صحيح', color: 'text-green-600 bg-green-50 border-green-200' },
  FAKE: { label: 'تحديث خاطئ', color: 'text-red-600 bg-red-50 border-red-200' },
};

interface TrackingCardProps {
  card: TrackingCardType;
}

export default function TrackingCard({ card }: TrackingCardProps) {
  const orderStatus = card.order?.status;
  const statusLabel = (orderStatus && ORDER_STATUS_ARABIC_LABELS[orderStatus]) || orderStatus || '';
  const statusBadgeClasses = getStatusColor(orderStatus);

  const updateMutation = useUpdateTrackingCard();
  const recordEventPointMutation = useRecordFollowupEventPointMutation();
  // Flagging a courier update and the agent-status modal both post to
  // /orders/followup/* , which the backend guards with `followup:manage`.
  const canManageFollowup = useHasPermission('followup:manage');

  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newCourierUpdate, setNewCourierUpdate] = useState('');
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);

  const [showFlagButtons, setShowFlagButtons] = useState(false);
  const isFlagging = recordEventPointMutation.isPending;
  const pendingPointType = recordEventPointMutation.variables?.pointType;

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const customerPhone = card.order?.customers?.phone_numbers?.[0];
  const customerName = card.order?.customers?.name;
  const orderProducts = card.order?.order_products;

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

  const handleFlag = useCallback(async (pointType: ShippingPointType) => {
    if (!card.shippingEventId) {
      toast.error('لا يوجد حدث شحن متاح للتقييم');
      return;
    }
    try {
      await recordEventPointMutation.mutateAsync({
        orderId: card.orderId,
        eventId: card.shippingEventId,
        pointType,
      });
      toast.success('تم تحديث حالة المندوب بنجاح');
      setShowFlagButtons(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث الحالة');
    }
  }, [card.orderId, card.shippingEventId, recordEventPointMutation]);

  return (
    <>
      <Card className="gap-0 py-0">
        <div dir="rtl" className="grid grid-cols-3 items-center gap-4 border-b bg-gray-50/50 px-4 py-3">
          <div className="flex flex-col gap-1">
            <Link
              href={`/dashboard/orders/${card.orderId}`}
              className="font-semibold text-base text-primary hover:underline"
            >
              الطلب {card.orderCode}
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
              <span className="text-xs text-gray-400">لا يوجد بيانات للمندوب</span>
            )}
          </div>

          <span
            className={clsx(
              'inline-flex items-center justify-self-end px-3 py-1 rounded-full text-xs font-medium',
              statusBadgeClasses
            )}
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
            {orderProducts?.map((op, idx) => {
              const attrs = (op.attributes ?? []).filter((a) => a?.name && a?.options?.name);
              const customVariants = Array.isArray(op.customVariants) ? op.customVariants : [];
              const parts = [
                ...attrs.map((a) => `${a.name}: ${a.options.name}`),
                ...customVariants.map((cv) => `${cv.label}: ${cv.value}`),
              ];
              return (
                <span key={idx} className="text-gray-500">
                  {op.products?.name}
                  {parts.length > 0 && (
                    <span className="text-gray-400 mr-1">
                      ({parts.join(' - ')})
                    </span>
                  )}
                </span>
              );
            })}
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
                    {canManageFollowup && (
                      <>
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
                            {isFlagging && pendingPointType === 'CORRECT' ? (
                              <LiaSpinnerSolid className="size-4 animate-spin" />
                            ) : (
                              <LiaCheckCircleSolid className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleFlag('FAKE')}
                            disabled={isFlagging}
                          >
                            {isFlagging && pendingPointType === 'FAKE' ? (
                              <LiaSpinnerSolid className="size-4 animate-spin" />
                            ) : (
                              <LiaTimesCircleSolid className="size-4" />
                            )}
                          </Button>
                        </div>
                      </>
                    )}
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
              {canManageFollowup && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  تحديث الحالة
                </Button>
              )}
            </div>

            {card.agentStatus ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-primary">
                    {AGENT_STATUS_LABELS[card.agentStatus] || card.agentStatus}
                  </p>
                  {card.employeeName && (
                    <span className="text-xs text-gray-500">{card.employeeName}</span>
                  )}
                </div>
                {card.agentNote && (
                  <p className="text-sm text-gray-700">{card.agentNote}</p>
                )}
                {card.agentStatus === 'POSTPONED' && card.postponedUntil && (
                  <p className="text-xs text-gray-500">
                    تأجيل إلى: {new Date(card.postponedUntil).toLocaleDateString('ar-EG')}
                  </p>
                )}
                {card.agentEventAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(card.agentEventAt).toLocaleString('ar-EG')}
                  </p>
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
        orderId={card.orderId}
      />
    </>
  );
}
