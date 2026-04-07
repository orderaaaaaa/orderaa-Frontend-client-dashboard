'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LiaExternalLinkAltSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type {
  TrackingCard as TrackingCardType,
  TrackingAgentStatus,
  AgentFlag,
  UpdateTrackingCardData,
} from '@/types/logistics';
import CourierFlagButtons from './CourierFlagButtons';
import AgentStatusSelector from './AgentStatusSelector';

interface TrackingCardProps {
  card: TrackingCardType;
  onUpdate: (cardId: number, data: UpdateTrackingCardData) => void;
}

export default function TrackingCard({ card, onUpdate }: TrackingCardProps) {
  const [agentStatus, setAgentStatus] = useState<TrackingAgentStatus | null>(
    card.agentStatus ?? null
  );
  const [agentFlag, setAgentFlag] = useState<AgentFlag | null>(
    card.agentFlag ?? null
  );
  const [postponeDate, setPostponeDate] = useState(card.postponedUntil ?? '');

  const handleSave = () => {
    const payload: UpdateTrackingCardData = {
      ...(agentStatus ? { agentStatus } : {}),
      ...(agentFlag ? { agentFlag } : {}),
      ...(agentStatus === 'POSTPONE' && postponeDate
        ? { postponedUntil: postponeDate }
        : {}),
    };
    console.log('[TrackingCard] save:', {
      cardId: card.id,
      ...payload,
    });
    onUpdate(card.id, payload);
  };

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <div dir="rtl" className="flex items-center justify-between border-b bg-gray-50/50 px-4 py-3">
        <div className="flex flex-col items-center gap-2">
          <p className="font-semibold text-base">
            الطلب #{card.orderCode}
          </p>
          {card.order?.customers?.name && (
            <p className="text-base">
              أسم العميل: {card.order.customers.name}
            </p>
          )}
        </div>
        <Link href={`/dashboard/orders/${card.orderId}`} target="_blank">
          <Button variant="ghost" size="icon-xs">
            <LiaExternalLinkAltSolid className="size-4" />
          </Button>
        </Link>
      </div>
      <CardContent className="flex flex-col gap-4 p-4" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-gray-500">
              كارت موظف المتابعة
            </p>
            <AgentStatusSelector
              selectedStatus={agentStatus}
              onStatusChange={setAgentStatus}
              postponeDate={postponeDate}
              onPostponeDateChange={setPostponeDate}
            />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-gray-500">تحديث المندوب</p>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 min-h-[48px]">
              {card.courierUpdate ?? 'لا يوجد تحديث'}
            </p>
            <CourierFlagButtons currentFlag={agentFlag} onFlag={setAgentFlag} />
          </div>
        </div>
        <Button className="w-full" onClick={handleSave} disabled={!agentStatus}>
          حفظ
        </Button>
      </CardContent>
    </Card>
  );
}
