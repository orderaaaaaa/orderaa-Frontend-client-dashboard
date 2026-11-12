'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { Textarea } from '@/components/ui/textarea';
import { usePermissionCheck } from '@/hooks/usePermissions';
import type { FollowupNotePartyValue } from '@/lib/api/followup';
import { PERMISSIONS } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import {
  useAddFollowupNoteMutation,
  useFollowupNotesQuery,
  useMarkFollowupNotesReadMutation,
} from '@/services/followup';
import { FollowupNoteDayCard } from './FollowupNoteDayCard';
import {
  FOLLOWUP_NOTE_ADD_LABEL,
  FOLLOWUP_NOTE_ADD_PLACEHOLDER,
  FOLLOWUP_NOTE_COUNTER_FROM,
  FOLLOWUP_NOTE_MAX_LENGTH,
  FOLLOWUP_NOTE_PARTY_GROUP_LABEL,
  FOLLOWUP_NOTE_PARTY_LABELS,
  FOLLOWUP_NOTE_PARTY_ORDER,
  FOLLOWUP_NOTE_PARTY_TONES,
  FOLLOWUP_NOTES_LOAD_ERROR,
  FOLLOWUP_NOTES_LOADING,
  FOLLOWUP_NOTES_RETRY_LABEL,
  followupCarrierLineKey,
} from './followupNotesConstants';

const NO_NEW_CARRIER_LINES: ReadonlySet<string> = new Set<string>();

interface AddFollowupNoteFormProps {
  orderId: number;
  body: string;
  party: FollowupNotePartyValue;
  onBodyChange: (body: string) => void;
  onPartyChange: (party: FollowupNotePartyValue) => void;
  onAdded?: () => void;
}

export function AddFollowupNoteForm({
  orderId,
  body,
  party,
  onBodyChange,
  onPartyChange,
  onAdded,
}: AddFollowupNoteFormProps) {
  const addMutation = useAddFollowupNoteMutation();
  const trimmedBody = body.trim();

  const submit = () => {
    if (trimmedBody.length === 0 || addMutation.isPending) return;
    addMutation.mutate(
      { orderId, party, body: trimmedBody },
      {
        onSuccess: () => {
          onBodyChange('');
          onAdded?.();
        },
      }
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <div role="radiogroup" aria-label={FOLLOWUP_NOTE_PARTY_GROUP_LABEL} className="flex flex-wrap gap-1.5">
        {FOLLOWUP_NOTE_PARTY_ORDER.map((value) => {
          const selected = party === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onPartyChange(value)}
              className={cn(
                'h-7 rounded-full border px-3 text-xs transition-colors',
                selected
                  ? FOLLOWUP_NOTE_PARTY_TONES[value]
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {FOLLOWUP_NOTE_PARTY_LABELS[value]}
            </button>
          );
        })}
      </div>
      <Textarea
        name={`followup-note-add-${orderId}`}
        value={body}
        placeholder={FOLLOWUP_NOTE_ADD_PLACEHOLDER}
        maxLength={FOLLOWUP_NOTE_MAX_LENGTH}
        rows={2}
        onChange={(e) => onBodyChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-end gap-3">
        {body.length >= FOLLOWUP_NOTE_COUNTER_FROM && (
          <span className="text-xs text-muted-foreground">
            {body.length}/{FOLLOWUP_NOTE_MAX_LENGTH}
          </span>
        )}
        <Button
          type="button"
          size="sm"
          loading={addMutation.isPending}
          disabled={trimmedBody.length === 0 || addMutation.isPending}
          onClick={submit}
        >
          {FOLLOWUP_NOTE_ADD_LABEL}
        </Button>
      </div>
    </div>
  );
}

export function useCanAddFollowupNote(orderId: number, enabled: boolean) {
  const { hasPermission } = usePermissionCheck();
  const canManage = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_NOTE_MANAGE);
  const { data } = useFollowupNotesQuery(orderId, enabled);
  return canManage && (data?.days.some((day) => day.canAddNotes) ?? false);
}

interface FollowupNotesPanelProps {
  orderId: number;
  isActive: boolean;
}

export function FollowupNotesPanel({ orderId, isActive }: FollowupNotesPanelProps) {
  const { hasPermission } = usePermissionCheck();
  const canManage = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_NOTE_MANAGE);
  const notesQuery = useFollowupNotesQuery(orderId, true);
  const { data: notesData, isFetchedAfterMount, isFetching, isError } = notesQuery;
  const { mutate: markRead } = useMarkFollowupNotesReadMutation();
  const [newCarrierLineKeys, setNewCarrierLineKeys] = useState<ReadonlySet<string> | null>(null);
  const snapshotTakenRef = useRef(false);
  const scrollPendingRef = useRef(false);

  useEffect(() => {
    if (!isActive || snapshotTakenRef.current) return;
    if (!notesData || !isFetchedAfterMount || isFetching || isError) return;
    snapshotTakenRef.current = true;
    const keys = new Set<string>();
    for (const day of notesData.days) {
      for (const line of day.carrier.texts) {
        if (line.unread) keys.add(followupCarrierLineKey(day.day, line));
      }
    }
    setNewCarrierLineKeys(keys);
    if (keys.size > 0) scrollPendingRef.current = true;
    if (keys.size > 0 && notesData.readThroughCarrierLogId !== null) {
      markRead({ orderId, throughCarrierLogId: notesData.readThroughCarrierLogId });
    }
  }, [isActive, notesData, isFetchedAfterMount, isFetching, isError, markRead, orderId]);

  if (notesQuery.isLoading) {
    return <PageLoading message={FOLLOWUP_NOTES_LOADING} />;
  }

  if (notesQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-destructive">{FOLLOWUP_NOTES_LOAD_ERROR}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={notesQuery.isRefetching}
          onClick={() => notesQuery.refetch()}
        >
          {FOLLOWUP_NOTES_RETRY_LABEL}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {notesQuery.data?.days.map((day) => (
        <FollowupNoteDayCard
          key={day.day}
          orderId={orderId}
          day={day}
          canManage={canManage}
          newCarrierLineKeys={newCarrierLineKeys ?? NO_NEW_CARRIER_LINES}
          scrollPendingRef={scrollPendingRef}
        />
      ))}
    </div>
  );
}
