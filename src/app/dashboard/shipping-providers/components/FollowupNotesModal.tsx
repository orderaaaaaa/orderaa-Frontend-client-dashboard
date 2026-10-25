'use client';

import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import PageLoading from '@/components/ui/page-loading';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import { useFollowupNotesQuery } from '@/services/followup';
import { FollowupNoteDayCard } from './FollowupNoteDayCard';
import {
  FOLLOWUP_NOTES_LOAD_ERROR,
  FOLLOWUP_NOTES_LOADING,
  FOLLOWUP_NOTES_RETRY_LABEL,
  FOLLOWUP_NOTES_TITLE,
} from './followupNotesConstants';

interface FollowupNotesModalProps {
  orderId: number;
  onClose: () => void;
}

export function FollowupNotesModal({ orderId, onClose }: FollowupNotesModalProps) {
  const { hasPermission } = usePermissionCheck();
  const canManage = hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_NOTE_MANAGE);
  const notesQuery = useFollowupNotesQuery(orderId, true);

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
          <p className="text-sm text-red-600">{FOLLOWUP_NOTES_LOAD_ERROR}</p>
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
        <div className="flex flex-col gap-3" dir="rtl">
          {notesQuery.data?.days.map((day) => (
            <FollowupNoteDayCard key={day.day} orderId={orderId} day={day} canManage={canManage} />
          ))}
        </div>
      )}
    </BaseModal>
  );
}
