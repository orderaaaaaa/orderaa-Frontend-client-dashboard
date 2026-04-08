'use client';

import Link from 'next/link';
import { LiaExternalLinkAltSolid, LiaTruckSolid, LiaHeadsetSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import clsx from 'clsx';
import type { TrackingCard as TrackingCardType } from '@/types/logistics';

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
  FAKE: { label: 'تحديث مزيف', color: 'text-red-600 bg-red-50 border-red-200' },
};

interface TrackingCardProps {
  card: TrackingCardType;
}

export default function TrackingCard({ card }: TrackingCardProps) {
  const statusLabel = TRACKING_STATUS_LABELS[card.status] || card.status;
  const statusColor = TRACKING_STATUS_COLORS[card.status] || '#9ca3af';

  return (
    <Card className="gap-0 py-0">
      <div dir="rtl" className="flex items-center justify-between border-b bg-gray-50/50 px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-base">
              الطلب #{card.orderCode}
            </p>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
              style={{ color: statusColor, backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }}
            >
              {statusLabel}
            </span>
          </div>
          {card.order?.customers?.name && (
            <p className="text-sm text-gray-500">
              اسم العميل: {card.order.customers.name}
            </p>
          )}
        </div>
        <Link href={`/dashboard/orders/${card.orderId}`} target="_blank">
          <Button variant="ghost" size="icon-xs">
            <LiaExternalLinkAltSolid className="size-4" />
          </Button>
        </Link>
      </div>

      <CardContent className="p-4 space-y-3" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LiaHeadsetSolid className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-gray-500">حالة موظف المتابعة</p>
            </div>
            {card.agentStatus ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm font-medium text-primary">
                  {AGENT_STATUS_LABELS[card.agentStatus] || card.agentStatus}
                </p>
                {card.agentStatus === 'POSTPONE' && card.postponedUntil && (
                  <p className="text-xs text-gray-500 mt-1">
                    تأجيل إلى: {new Date(card.postponedUntil).toLocaleDateString('ar-EG')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3">
                لم يتم تحديد حالة بعد
              </p>
            )}
            {card.agentNote && (
              <p className="text-xs text-gray-500">{card.agentNote}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LiaTruckSolid className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-gray-500">تحديث المندوب</p>
            </div>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
              {card.courierUpdate ?? 'لا يوجد تحديث'}
            </p>
            {card.agentFlag && (
              <span className={clsx('inline-flex self-start items-center px-2.5 py-1 rounded-full text-xs font-medium border', FLAG_LABELS[card.agentFlag].color)}>
                {FLAG_LABELS[card.agentFlag].label}
              </span>
            )}
          </div>
        </div>

        {card.completedAt && (
          <p className="text-xs text-gray-400 text-center pt-1">
            تم الإكمال: {new Date(card.completedAt).toLocaleString('ar-EG')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
