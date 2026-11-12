'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import type { FollowupNotePartyValue } from '@/lib/api/followup';
import { AddFollowupNoteForm, FollowupNotesPanel, useCanAddFollowupNote } from './FollowupNotesPanel';
import { FOLLOWUP_NOTES_TITLE } from './followupNotesConstants';

interface FollowupNotesModalProps {
  orderId: number;
  onClose: () => void;
}

export function FollowupNotesModal({ orderId, onClose }: FollowupNotesModalProps) {
  const canAddNote = useCanAddFollowupNote(orderId, true);
  const [party, setParty] = useState<FollowupNotePartyValue>('CUSTOMER');
  const [body, setBody] = useState('');

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={FOLLOWUP_NOTES_TITLE}
      showFooter={false}
      maxWidth="md:max-w-2xl"
    >
      <FollowupNotesPanel orderId={orderId} isActive />
      {canAddNote && (
        <div
          dir="rtl"
          className="sticky bottom-0 z-(--z-inpage-sticky) mt-4 -mx-5 border-t border-border bg-card px-5 py-3 sm:-mx-6 sm:px-6"
        >
          <AddFollowupNoteForm
            orderId={orderId}
            compactOnMobile
            body={body}
            party={party}
            onBodyChange={setBody}
            onPartyChange={setParty}
          />
        </div>
      )}
    </BaseModal>
  );
}
