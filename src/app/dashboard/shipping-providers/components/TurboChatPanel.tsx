'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { MessagesSquare } from 'lucide-react';
import { ChatBubble, ChatCarrierAvatar } from '@/components/chat/ChatBubble';
import { ChatDaySeparator } from '@/components/chat/ChatDaySeparator';
import { RealtimeStatus } from '@/components/chat/RealtimeStatus';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/state-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { CARRIER_CHAT_ERROR_CODES, type CarrierChatMessage } from '@/types/carrierChat';
import { formatTime } from '@/utils/format';
import {
  CHAT_AUTH_ERROR_LABEL,
  CHAT_AUTH_HINT_LABEL,
  CHAT_AUTH_LINK_LABEL,
  CHAT_EMPTY_HINT,
  CHAT_EMPTY_LABEL,
  CHAT_LOAD_ERROR_LABEL,
  CHAT_LOG_LABEL,
  CHAT_NEW_MESSAGES_DIVIDER,
  CHAT_PIN_THRESHOLD_PX,
  CHAT_UNAVAILABLE_LABEL,
  FOLLOWUP_NOTES_RETRY_LABEL,
  chatNewBelowLabel,
} from './followupNotesConstants';
import type { TurboChatView } from './useTurboChat';

interface TurboChatPanelProps {
  chat: TurboChatView;
  canReadIntegrations: boolean;
}

const LOADING_BUBBLES = [0, 1, 2, 3];

export function TurboChatPanel({ chat, canReadIntegrations }: TurboChatPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const countRef = useRef<number | null>(null);
  const [newBelow, setNewBelow] = useState(0);
  const { thread, pending } = chat;
  const itemCount = (thread?.messages.length ?? 0) + pending.length;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || thread === undefined) return;
    const previous = countRef.current;
    countRef.current = itemCount;
    if (previous === null) {
      const divider = dividerRef.current;
      list.scrollTop = divider ? divider.offsetTop - list.clientHeight / 3 : list.scrollHeight;
      return;
    }
    if (itemCount <= previous) return;
    if (pinnedRef.current) {
      list.scrollTop = list.scrollHeight;
    } else {
      setNewBelow((current) => current + itemCount - previous);
    }
  }, [itemCount, thread]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const pinned = list.scrollHeight - list.scrollTop - list.clientHeight < CHAT_PIN_THRESHOLD_PX;
    pinnedRef.current = pinned;
    if (pinned) setNewBelow(0);
  };

  const jumpToEnd = () => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
    pinnedRef.current = true;
    setNewBelow(0);
  };

  if (chat.isLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        {LOADING_BUBBLES.map((index) => (
          <Skeleton key={index} className={index % 2 === 0 ? 'h-12 w-2/3 self-start rounded-2xl' : 'h-12 w-2/3 self-end rounded-2xl'} />
        ))}
      </div>
    );
  }

  if (chat.authFailed) {
    const link: ReactNode = canReadIntegrations ? (
      <Link href="/dashboard/link-shipping-company" className="font-medium text-primary-text underline-offset-2 hover:underline">
        {CHAT_AUTH_LINK_LABEL}
      </Link>
    ) : undefined;
    return <EmptyState title={CHAT_AUTH_ERROR_LABEL} description={CHAT_AUTH_HINT_LABEL} action={link} />;
  }

  if (thread === undefined && chat.isError) {
    if (chat.errorCode === CARRIER_CHAT_ERROR_CODES.NOT_AVAILABLE) {
      return <EmptyState title={CHAT_UNAVAILABLE_LABEL} />;
    }
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-destructive">{CHAT_LOAD_ERROR_LABEL}</p>
        <Button type="button" variant="outline" size="sm" onClick={chat.refetch}>
          {FOLLOWUP_NOTES_RETRY_LABEL}
        </Button>
      </div>
    );
  }

  if (thread === undefined) return null;

  const rows: ReactNode[] = [];
  let lastDay = '';
  let dividerPlaced = false;
  thread.messages.forEach((message) => {
    const day = message.dayKey ?? lastDay;
    if (day !== '' && day !== lastDay) {
      rows.push(<ChatDaySeparator key={`day:${message.key}`} label={day} />);
      lastDay = day;
    }
    if (!dividerPlaced && chat.unreadKey !== null && message.key === chat.unreadKey) {
      dividerPlaced = true;
      rows.push(
        <div
          key="unread-divider"
          ref={dividerRef}
          role="separator"
          className="my-3 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <span className="h-px flex-1 bg-border" />
          <span>{CHAT_NEW_MESSAGES_DIVIDER}</span>
          <span className="h-px flex-1 bg-border" />
        </div>
      );
    }
    rows.push(renderMessage(message, chat));
  });
  pending.forEach((item) => {
    rows.push(
      <ChatBubble key={`pending:${item.localId}`} side="end" time={formatTime(item.createdAt)} sendState="SENDING">
        <p className="whitespace-pre-wrap break-words">{item.text}</p>
      </ChatBubble>
    );
  });

  const empty = thread.messages.length === 0 && pending.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <RealtimeStatus state={chat.socketState} lastSyncedAt={chat.lastSyncedAt} onRefresh={chat.refetch} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={listRef}
          onScroll={onScroll}
          role="log"
          aria-live="polite"
          aria-label={CHAT_LOG_LABEL}
          className="relative min-h-0 flex-1 overflow-y-auto pe-1"
        >
          {empty ? <EmptyState icon={<MessagesSquare className="size-5" />} title={CHAT_EMPTY_LABEL} description={CHAT_EMPTY_HINT} /> : rows}
        </div>
        {newBelow > 0 && (
          <button
            type="button"
            onClick={jumpToEnd}
            className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm"
          >
            {chatNewBelowLabel(newBelow)}
          </button>
        )}
      </div>
    </div>
  );
}

function renderMessage(message: CarrierChatMessage, chat: TurboChatView): ReactNode {
  const body = <p className="whitespace-pre-wrap break-words">{message.text}</p>;
  const time = formatTime(message.sentAt);
  if (message.origin === 'CARRIER') {
    return (
      <ChatBubble
        key={message.key}
        side="start"
        avatar={<ChatCarrierAvatar />}
        senderName={message.senderName}
        time={time}
        file={message.file}
        attachmentName={message.attachmentName}
        location={message.location}
      >
        {body}
      </ChatBubble>
    );
  }
  return (
    <ChatBubble
      key={message.key}
      side="end"
      time={time}
      sentBy={message.sentBy ? message.sentBy.employeeName : null}
      sendState={message.sendState}
      error={message.error}
      retried={message.retried}
      onRetry={message.retryable && chat.canRetry ? () => chat.retry(message) : undefined}
      location={message.location}
    >
      {body}
    </ChatBubble>
  );
}
