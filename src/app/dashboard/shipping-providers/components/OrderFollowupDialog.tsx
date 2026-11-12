'use client';

import { useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useI18n } from '@/i18n/I18nProvider';
import type { FollowupNotePartyValue } from '@/lib/api/followup';
import { PERMISSIONS } from '@/lib/permissions';
import { AddFollowupNoteForm, FollowupNotesPanel, useCanAddFollowupNote } from './FollowupNotesPanel';
import { FollowupPanelTabs } from './FollowupPanelTabs';
import { OrderActionLogPanel } from './OrderActionLogPanel';
import { OrderFollowupHeader } from './OrderFollowupHeader';
import {
  FOLLOWUP_DIALOG_TITLE,
  FOLLOWUP_DRAFT_LEAVE_LABEL,
  FOLLOWUP_DRAFT_PROMPT,
  FOLLOWUP_DRAFT_STAY_LABEL,
} from './followupNotesConstants';
import { FOLLOWUP_PANELS, type FollowupPanel, type FollowupTarget } from './followupPanels';

interface OrderFollowupDialogProps {
  target: FollowupTarget;
  carrierName: string;
  opener: HTMLElement | null;
  onClose: () => void;
}

const isFollowupPanel = (value: string): value is FollowupPanel =>
  value === FOLLOWUP_PANELS.NOTES || value === FOLLOWUP_PANELS.EVENTS || value === FOLLOWUP_PANELS.CHAT;

const isVisible = (element: HTMLElement) => element.getClientRects().length > 0;

const findVisibleOpener = (orderId: number): HTMLElement | null => {
  const candidates = document.querySelectorAll<HTMLElement>(`[data-followup-opener="${orderId}"]`);
  return Array.from(candidates).find(isVisible) ?? null;
};

export function OrderFollowupDialog({ target, carrierName, opener, onClose }: OrderFollowupDialogProps) {
  const { dir } = useI18n();
  const { hasPermission } = usePermissionCheck();
  const canReadHistory = hasPermission(PERMISSIONS.ORDERS_HISTORY_READ);
  const [panel, setPanel] = useState<FollowupPanel>(target.panel);
  const [visited, setVisited] = useState<ReadonlySet<FollowupPanel>>(() => new Set([target.panel]));
  const [body, setBody] = useState('');
  const [party, setParty] = useState<FollowupNotePartyValue>('CUSTOMER');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [addedToken, setAddedToken] = useState(0);
  const canAddNote = useCanAddFollowupNote(target.orderId, visited.has(FOLLOWUP_PANELS.NOTES));
  const hasDraft = body.trim().length > 0;

  const showPanel = (next: FollowupPanel) => {
    setPanel(next);
    setVisited((current) => {
      if (current.has(next)) return current;
      const updated = new Set(current);
      updated.add(next);
      return updated;
    });
  };

  const requestClose = () => {
    if (hasDraft) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const handleOpenAutoFocus = (event: Event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const activeTab = event.target.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!activeTab) return;
    event.preventDefault();
    activeTab.focus();
  };

  const handleCloseAutoFocus = (event: Event) => {
    const restore = opener?.isConnected && isVisible(opener) ? opener : findVisibleOpener(target.orderId);
    if (!restore) return;
    event.preventDefault();
    restore.focus();
  };

  const notesFooter =
    panel === FOLLOWUP_PANELS.NOTES && canAddNote ? (
      <div dir="rtl" className="max-sm:pb-[env(safe-area-inset-bottom)]">
        <AddFollowupNoteForm
          orderId={target.orderId}
          body={body}
          party={party}
          onBodyChange={setBody}
          onPartyChange={setParty}
          compactOnMobile
          onAdded={() => setAddedToken((current) => current + 1)}
        />
      </div>
    ) : undefined;

  return (
    <Tabs
      value={panel}
      onValueChange={(value) => {
        if (isFollowupPanel(value)) showPanel(value);
      }}
      activationMode="manual"
      dir={dir}
    >
      <BaseModal
        isOpen
        onClose={requestClose}
        title={`${FOLLOWUP_DIALOG_TITLE} ${target.orderCode}`}
        headerContent={
          <OrderFollowupHeader
            orderCode={target.orderCode}
            customerName={target.customerName}
            carrierName={carrierName}
            governorate={target.governorate}
            status={target.status}
            lateness={target.lateness}
          />
        }
        subheader={<FollowupPanelTabs unreadNotes={visited.has(FOLLOWUP_PANELS.NOTES) ? 0 : target.unreadNoteCount} />}
        footer={notesFooter}
        showFooter={false}
        maxWidth="md:max-w-3xl"
        height="h-[min(85vh,780px)]"
        mobileFullScreen
        onOpenAutoFocus={handleOpenAutoFocus}
        onCloseAutoFocus={handleCloseAutoFocus}
      >
        {visited.has(FOLLOWUP_PANELS.NOTES) && (
          <TabsContent value={FOLLOWUP_PANELS.NOTES} forceMount hidden={panel !== FOLLOWUP_PANELS.NOTES}>
            <FollowupNotesPanel
              orderId={target.orderId}
              isActive={panel === FOLLOWUP_PANELS.NOTES}
              addedToken={addedToken}
            />
          </TabsContent>
        )}
        {visited.has(FOLLOWUP_PANELS.EVENTS) && (
          <TabsContent value={FOLLOWUP_PANELS.EVENTS} forceMount hidden={panel !== FOLLOWUP_PANELS.EVENTS}>
            <OrderActionLogPanel orderId={target.orderId} canReadHistory={canReadHistory} />
          </TabsContent>
        )}
      </BaseModal>
      <UnsavedChangesDialog
        isOpen={confirmDiscard}
        onStay={() => setConfirmDiscard(false)}
        onLeave={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        message={FOLLOWUP_DRAFT_PROMPT}
        leaveText={FOLLOWUP_DRAFT_LEAVE_LABEL}
        stayText={FOLLOWUP_DRAFT_STAY_LABEL}
      />
    </Tabs>
  );
}
