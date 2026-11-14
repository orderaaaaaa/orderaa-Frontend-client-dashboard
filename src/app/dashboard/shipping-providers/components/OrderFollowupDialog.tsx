'use client';

import { useId, useState } from 'react';
import { ChatComposer } from '@/components/chat/ChatComposer';
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
  CHAT_COMPOSER_PLACEHOLDER,
  CHAT_MESSAGE_MAX_LENGTH,
  FOLLOWUP_DIALOG_TITLE,
  FOLLOWUP_DRAFT_LEAVE_LABEL,
  FOLLOWUP_DRAFT_PROMPT,
  FOLLOWUP_DRAFT_STAY_LABEL,
} from './followupNotesConstants';
import { FOLLOWUP_PANELS, type FollowupPanel, type FollowupTarget } from './followupPanels';
import { TurboChatPanel } from './TurboChatPanel';
import { useCoarsePointer, useTurboChat } from './useTurboChat';

interface OrderFollowupDialogProps {
  target: FollowupTarget;
  carrierName: string;
  carrierIsTurbo: boolean;
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

export function OrderFollowupDialog({ target, carrierName, carrierIsTurbo, opener, onClose }: OrderFollowupDialogProps) {
  const { dir } = useI18n();
  const { hasPermission } = usePermissionCheck();
  const canReadHistory = hasPermission(PERMISSIONS.ORDERS_HISTORY_READ);
  const [panel, setPanel] = useState<FollowupPanel>(target.panel);
  const [visited, setVisited] = useState<ReadonlySet<FollowupPanel>>(() => new Set([target.panel]));
  const [body, setBody] = useState('');
  const [party, setParty] = useState<FollowupNotePartyValue>('CUSTOMER');
  const [chatDraft, setChatDraft] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [addedToken, setAddedToken] = useState(0);
  const sendBlockedTextId = useId();
  const canAddNote = useCanAddFollowupNote(target.orderId, visited.has(FOLLOWUP_PANELS.NOTES));
  const showChat = carrierIsTurbo && target.shippingCode !== null && hasPermission(PERMISSIONS.FOLLOWUP_READ);
  const chat = useTurboChat({
    orderId: target.orderId,
    enabled: showChat && visited.has(FOLLOWUP_PANELS.CHAT),
    isActive: showChat && panel === FOLLOWUP_PANELS.CHAT,
    canManage: hasPermission(PERMISSIONS.FOLLOWUP_CARRIERS_CHAT_SEND),
    unreadChatCount: target.unreadChatCount,
  });
  const coarsePointer = useCoarsePointer();
  const hasDraft = body.trim().length > 0 || chatDraft.trim().length > 0;

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

  const sendChatDraft = () => {
    const text = chatDraft;
    setChatDraft('');
    void chat.sendText(text).then((sent) => {
      if (!sent) setChatDraft((current) => (current === '' ? text : current));
    });
  };

  const chatFooter =
    showChat && panel === FOLLOWUP_PANELS.CHAT && (chat.canCompose || chat.sendBlocked) ? (
      <div dir="rtl" className="max-sm:pb-[env(safe-area-inset-bottom)]">
        {chat.sendBlocked && (
          <p id={sendBlockedTextId} className="mb-1 text-xs text-muted-foreground">
            {chat.sendBlockedText}
          </p>
        )}
        <ChatComposer
          value={chatDraft}
          onChange={setChatDraft}
          onSend={sendChatDraft}
          placeholder={CHAT_COMPOSER_PLACEHOLDER}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          enterToSend={!coarsePointer}
          disabled={chat.sendBlocked}
          describedById={chat.sendBlocked ? sendBlockedTextId : undefined}
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
            shippingCode={target.shippingCode}
            customerName={target.customerName}
            carrierName={carrierName}
            governorate={target.governorate}
            status={target.status}
            lateness={target.lateness}
          />
        }
        subheader={
          <FollowupPanelTabs
            unreadNotes={visited.has(FOLLOWUP_PANELS.NOTES) ? 0 : target.unreadNoteCount}
            showChat={showChat}
            unreadChat={visited.has(FOLLOWUP_PANELS.CHAT) ? 0 : target.unreadChatCount}
          />
        }
        footer={chatFooter ?? notesFooter}
        bodyClassName={showChat && panel === FOLLOWUP_PANELS.CHAT ? 'flex flex-col overflow-hidden' : undefined}
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
        {showChat && visited.has(FOLLOWUP_PANELS.CHAT) && (
          <TabsContent value={FOLLOWUP_PANELS.CHAT} forceMount hidden={panel !== FOLLOWUP_PANELS.CHAT} className="flex min-h-0 flex-1 flex-col">
            <TurboChatPanel chat={chat} canReadIntegrations={hasPermission(PERMISSIONS.INTEGRATION_CONFIG_READ)} />
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
