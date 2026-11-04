'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { Textarea } from '@/components/ui/textarea';
import { usePermissionCheck } from '@/hooks/usePermissions';
import type { FollowupNotePartyValue } from '@/lib/api/followup';
import { PERMISSIONS } from '@/lib/permissions';
import { useAddFollowupNoteMutation, useFollowupNotesQuery } from '@/services/followup';
import { FollowupNoteDayCard } from './FollowupNoteDayCard';
import {
  FOLLOWUP_NOTE_ADD_LABEL,
  FOLLOWUP_NOTE_ADD_PLACEHOLDER,
  FOLLOWUP_NOTE_MAX_LENGTH,
  FOLLOWUP_NOTE_PARTY_LABELS,
  FOLLOWUP_NOTE_PARTY_ORDER,
  FOLLOWUP_NOTES_LOAD_ERROR,
  FOLLOWUP_NOTES_LOADING,
  FOLLOWUP_NOTES_RETRY_LABEL,
  FOLLOWUP_NOTES_TITLE,
} from './followupNotesConstants';

interface FollowupNotesModalProps {
  orderId: number;
  onClose: () => void;
}

function AddFollowupNoteForm({ orderId }: { orderId: number }) {
  const [party, setParty] = useState<FollowupNotePartyValue>('CUSTOMER');
  const [body, setBody] = useState('');
  const addMutation = useAddFollowupNoteMutation();
  const trimmedBody = body.trim();

  const submit = () => {
    addMutation.mutate({ orderId, party, body: trimmedBody }, { onSuccess: () => setBody('') });
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex flex-wrap gap-1.5">
        {FOLLOWUP_NOTE_PARTY_ORDER.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={party === value ? 'default' : 'outline'}
            aria-pressed={party === value}
            className="h-7 px-3 text-xs"
            onClick={() => setParty(value)}
          >
            {FOLLOWUP_NOTE_PARTY_LABELS[value]}
          </Button>
        ))}
      </div>
      <Textarea
        name={`followup-note-add-${orderId}`}
        value={body}
        placeholder={FOLLOWUP_NOTE_ADD_PLACEHOLDER}
        maxLength={FOLLOWUP_NOTE_MAX_LENGTH}
        rows={2}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex justify-end">
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

export function FollowupNotesModal({ orderId, onClose }: FollowupNotesModalProps) {
  const { hasPermission } = usePermissionCheck();
  const canManage = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_NOTE_MANAGE);
  const notesQuery = useFollowupNotesQuery(orderId, true);
  const canAddNote = canManage && (notesQuery.data?.days.some((day) => day.canAddNotes) ?? false);

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={FOLLOWUP_NOTES_TITLE}
      showFooter={false}
      maxWidth="md:max-w-2xl"
    >
      {notesQuery.isLoading ? (
        <PageLoading message={FOLLOWUP_NOTES_LOADING} />
      ) : notesQuery.isError ? (
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
      ) : (
        <>
          <div className="flex flex-col gap-3" dir="rtl">
            {notesQuery.data?.days.map((day) => (
              <FollowupNoteDayCard key={day.day} orderId={orderId} day={day} canManage={canManage} />
            ))}
          </div>
          {canAddNote && (
            <div
              dir="rtl"
              className="sticky bottom-0 z-(--z-inpage-sticky) mt-4 -mx-5 border-t border-border bg-card px-5 py-3 sm:-mx-6 sm:px-6"
            >
              <AddFollowupNoteForm orderId={orderId} />
            </div>
          )}
        </>
      )}
    </BaseModal>
  );
}
