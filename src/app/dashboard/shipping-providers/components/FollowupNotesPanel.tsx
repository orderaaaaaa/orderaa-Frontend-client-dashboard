'use client';

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
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
  FOLLOWUP_COLLAPSE_ALL_LABEL,
  FOLLOWUP_EXPAND_ALL_LABEL,
  FOLLOWUP_EXPAND_ALL_THRESHOLD,
  FOLLOWUP_NOTE_ADD_LABEL,
  FOLLOWUP_NOTE_ADD_PLACEHOLDER,
  FOLLOWUP_NOTE_COUNTER_FROM,
  FOLLOWUP_NOTE_MAX_LENGTH,
  FOLLOWUP_NOTE_MAX_ROWS,
  FOLLOWUP_NOTE_MIN_ROWS,
  FOLLOWUP_NOTE_PARTY_GROUP_LABEL,
  FOLLOWUP_NOTE_PARTY_LABELS,
  FOLLOWUP_NOTE_PARTY_ORDER,
  FOLLOWUP_NOTE_PARTY_TONES,
  FOLLOWUP_NOTE_SHORTCUT_HINT,
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
  compactOnMobile?: boolean;
  onAdded?: () => void;
}

export function AddFollowupNoteForm({
  orderId,
  body,
  party,
  onBodyChange,
  onPartyChange,
  compactOnMobile = false,
  onAdded,
}: AddFollowupNoteFormProps) {
  const addMutation = useAddFollowupNoteMutation();
  const [expanded, setExpanded] = useState(false);
  const textareaWrapRef = useRef<HTMLDivElement>(null);
  const trimmedBody = body.trim();
  const collapsed = compactOnMobile && !expanded;

  useLayoutEffect(() => {
    const textarea = textareaWrapRef.current?.querySelector('textarea');
    if (!textarea) return;
    if (collapsed) {
      textarea.style.height = '';
      textarea.style.overflowY = '';
      return;
    }
    textarea.style.height = 'auto';
    const style = window.getComputedStyle(textarea);
    const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + borders;
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
    const maxHeight = lineHeight * FOLLOWUP_NOTE_MAX_ROWS + chrome;
    const contentHeight = textarea.scrollHeight + borders;
    textarea.style.height = `${Math.min(contentHeight, maxHeight)}px`;
    textarea.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
  }, [body, collapsed]);

  const openComposer = () => {
    setExpanded(true);
    textareaWrapRef.current?.querySelector('textarea')?.focus();
  };

  const submit = () => {
    if (trimmedBody.length === 0 || addMutation.isPending) return;
    addMutation.mutate(
      { orderId, party, body: trimmedBody },
      {
        onSuccess: () => {
          onBodyChange('');
          setExpanded(false);
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
      <div
        role="radiogroup"
        aria-label={FOLLOWUP_NOTE_PARTY_GROUP_LABEL}
        className={cn('flex flex-wrap items-center gap-1.5', collapsed && 'max-sm:hidden')}
      >
        <span className="me-1 text-xs text-muted-foreground">{FOLLOWUP_NOTE_PARTY_GROUP_LABEL}</span>
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
      <div className="flex items-end gap-2">
        <div ref={textareaWrapRef} className="min-w-0 flex-1">
          <Textarea
            name={`followup-note-add-${orderId}`}
            value={body}
            placeholder={FOLLOWUP_NOTE_ADD_PLACEHOLDER}
            maxLength={FOLLOWUP_NOTE_MAX_LENGTH}
            rows={FOLLOWUP_NOTE_MIN_ROWS}
            className={cn('resize-none', collapsed && 'max-sm:h-10 max-sm:min-h-10 max-sm:overflow-hidden')}
            onChange={(e) => onBodyChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setExpanded(true)}
          />
        </div>
        {collapsed && (
          <Button
            type="button"
            size="touch"
            aria-label={FOLLOWUP_NOTE_ADD_LABEL}
            className="shrink-0 sm:hidden"
            onClick={openComposer}
          >
            <Plus className="size-5" />
          </Button>
        )}
      </div>
      <div className={cn('flex items-center justify-between gap-3', collapsed && 'max-sm:hidden')}>
        <span className="hidden text-xs text-muted-foreground sm:inline">{FOLLOWUP_NOTE_SHORTCUT_HINT}</span>
        <div className="ms-auto flex items-center gap-3">
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
  addedToken?: number;
}

export function FollowupNotesPanel({ orderId, isActive, addedToken = 0 }: FollowupNotesPanelProps) {
  const { hasPermission } = usePermissionCheck();
  const canManage = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_NOTE_MANAGE);
  const notesQuery = useFollowupNotesQuery(orderId, true);
  const { data: notesData, isFetchedAfterMount, isFetching, isError } = notesQuery;
  const { mutate: markRead } = useMarkFollowupNotesReadMutation();
  const [newCarrierLineKeys, setNewCarrierLineKeys] = useState<ReadonlySet<string> | null>(null);
  const [bulk, setBulk] = useState<{ open: boolean; id: number } | null>(null);
  const snapshotTakenRef = useRef(false);
  const scrollPendingRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const addedSeenRef = useRef(addedToken);
  const addedScrollPendingRef = useRef(false);

  useEffect(() => {
    if (addedToken === addedSeenRef.current) return;
    addedSeenRef.current = addedToken;
    addedScrollPendingRef.current = true;
  }, [addedToken]);

  useEffect(() => {
    if (!addedScrollPendingRef.current || isFetching) return;
    addedScrollPendingRef.current = false;
    listRef.current?.scrollIntoView({ block: 'start' });
  }, [notesData, isFetching]);

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

  const days = notesQuery.data?.days ?? [];

  const toggleAll = () => {
    setBulk((current) => ({ open: !(current?.open ?? false), id: (current?.id ?? 0) + 1 }));
  };

  return (
    <div ref={listRef} className="flex flex-col gap-3" dir="rtl">
      {days.length > FOLLOWUP_EXPAND_ALL_THRESHOLD && (
        <div className="flex justify-start">
          <Button type="button" variant="link" size="sm" className="h-7 px-0 text-xs" onClick={toggleAll}>
            {bulk?.open ? FOLLOWUP_COLLAPSE_ALL_LABEL : FOLLOWUP_EXPAND_ALL_LABEL}
          </Button>
        </div>
      )}
      {days.map((day) => (
        <FollowupNoteDayCard
          key={day.day}
          orderId={orderId}
          day={day}
          canManage={canManage}
          newCarrierLineKeys={newCarrierLineKeys ?? NO_NEW_CARRIER_LINES}
          scrollPendingRef={scrollPendingRef}
          bulkState={bulk}
        />
      ))}
    </div>
  );
}
