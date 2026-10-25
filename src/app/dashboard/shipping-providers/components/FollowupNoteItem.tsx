'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDeleteFollowupNoteMutation, useEditFollowupNoteMutation } from '@/services/followup';
import type { FollowupNoteView } from '@/lib/api/followup';
import { formatDateTime } from '@/utils/format';
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

  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white p-2.5">
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
        <>
          <p className="whitespace-pre-wrap break-words text-sm text-gray-900">{note.body}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>
              {note.employeeName ?? FOLLOWUP_NOTE_NO_WRITER} - {formatDateTime(note.createdAt)}
              {note.editedAt !== null && ` - ${FOLLOWUP_NOTE_EDITED_TAG}`}
            </span>
            {(canEdit || canDelete) && (
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
                        className="h-6 px-1.5 text-xs text-red-600"
                        disabled={isBusy}
                        onClick={() => setIsConfirmingDelete(true)}
                      >
                        {FOLLOWUP_NOTE_DELETE_LABEL}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </li>
  );
}
