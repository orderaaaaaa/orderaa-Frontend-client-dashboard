'use client';

import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import type { TrackingAgentStatus } from '@/types/logistics';

interface AgentStatusSelectorProps {
  selectedStatus: TrackingAgentStatus | null;
  onStatusChange: (status: TrackingAgentStatus) => void;
  postponeDate: string;
  onPostponeDateChange: (date: string) => void;
}

const AGENT_STATUSES: { value: TrackingAgentStatus; label: string }[] = [
  { value: 'CLOSED', label: 'مغلق' },
  { value: 'NO_ANSWER', label: 'مش بيرد' },
  { value: 'NOT_COLLECTING', label: 'مش بيجمع' },
  { value: 'BUSY', label: 'مشغول' },
  { value: 'POSTPONE', label: 'تأجيل' },
];

export default function AgentStatusSelector({
  selectedStatus,
  onStatusChange,
  postponeDate,
  onPostponeDateChange,
}: AgentStatusSelectorProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {AGENT_STATUSES.map((status) => (
          <Button
            key={status.value}
            variant="outline"
            size="sm"
            className={clsx(
              selectedStatus === status.value
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                : 'text-gray-600'
            )}
            onClick={() => onStatusChange(status.value)}
          >
            {status.label}
          </Button>
        ))}
      </div>
      {selectedStatus === 'POSTPONE' && (
        <input
          type="date"
          min={minDate}
          value={postponeDate}
          onChange={(e) => onPostponeDateChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100"
        />
      )}
    </div>
  );
}
