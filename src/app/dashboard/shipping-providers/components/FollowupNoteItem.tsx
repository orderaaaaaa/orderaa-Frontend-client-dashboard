'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDeleteFollowupNoteMutation, useEditFollowupNoteMutation } from '@/services/followup';
import type { FollowupNoteView } from '@/lib/api/followup';
import { formatDateTime } from '@/utils/format';
import { NOTE_BODY_CLASS, NoteCard } from './NoteCard';
import {
  FOLLOWUP_NOTE_CANCEL_LABEL,
  FOLLOWUP_NOTE_DELETE_CONFIRM_LABEL,
  FOLLOWUP_NOTE_DELETE_LABEL,
  FOLLOWUP_NOTE_EDIT_LABEL,
  FOLLOWUP_NOTE_EDITED_TAG,
  FOLLOWUP_NOTE_MAX_LENGTH,
  FOLLOWUP_NOTE_NO_WRITER,
  FOLLOWUP_NOTE_SAVE_LABEL,
} from './followupNotesConstants';

interface FollowupNoteItemProps {
  orderId: number;
  note: FollowupNoteView;
  canManage: boolean;
}

export function FollowupNoteItem({ orderId, note, canManage }: FollowupNoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const editMutation = useEditFollowupNoteMutation();
  const deleteMutation = useDeleteFollowupNoteMutation();

  const trimmedDraft = draft.trim();
  const canEdit = canManage && note.canEdit;
  const canDelete = canManage && note.canDelete;
  const isBusy = editMutation.isPending || deleteMutation.isPending;

  const startEdit = () => {
    setDraft(note.body);
    setIsEditing(true);
  };

  const saveEdit = () => {
    editMutation.mutate(
      { orderId, noteId: note.id, body: trimmedDraft },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const confirmDelete = () => {
    deleteMutation.mutate({ orderId, noteId: note.id });
  };

  const meta = (
    <span>
      {note.employeeName ?? FOLLOWUP_NOTE_NO_WRITER} - {formatDateTime(note.createdAt)}
      {note.editedAt !== null && ` - ${FOLLOWUP_NOTE_EDITED_TAG}`}
    </span>
  );

  const footer =
    (canEdit || canDelete) && !isEditing ? (
      <div className="flex items-center gap-1">
        {isConfirmingDelete ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-xs"
              disabled={isBusy}
              onClick={() => setIsConfirmingDelete(false)}
            >
              {FOLLOWUP_NOTE_CANCEL_LABEL}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-6 px-1.5 text-xs"
              loading={deleteMutation.isPending}
              disabled={isBusy}
              onClick={confirmDelete}
            >
              {FOLLOWUP_NOTE_DELETE_CONFIRM_LABEL}
            </Button>
          </>
        ) : (
          <>
            {canEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs"
                disabled={isBusy}
                onClick={startEdit}
              >
                {FOLLOWUP_NOTE_EDIT_LABEL}
              </Button>
            )}
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs text-destructive"
                disabled={isBusy}
                onClick={() => setIsConfirmingDelete(true)}
              >
                {FOLLOWUP_NOTE_DELETE_LABEL}
              </Button>
            )}
          </>
        )}
      </div>
    ) : undefined;

  return (
    <NoteCard meta={meta} footer={footer}>
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            name={`followup-note-edit-${note.id}`}
            value={draft}
            maxLength={FOLLOWUP_NOTE_MAX_LENGTH}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={editMutation.isPending}
              onClick={() => setIsEditing(false)}
            >
              {FOLLOWUP_NOTE_CANCEL_LABEL}
            </Button>
            <Button
              type="button"
              size="sm"
              loading={editMutation.isPending}
              disabled={trimmedDraft.length === 0 || editMutation.isPending}
              onClick={saveEdit}
            >
              {FOLLOWUP_NOTE_SAVE_LABEL}
            </Button>
          </div>
        </div>
      ) : (
        <p className={NOTE_BODY_CLASS}>{note.body}</p>
      )}
    </NoteCard>
  );
}
