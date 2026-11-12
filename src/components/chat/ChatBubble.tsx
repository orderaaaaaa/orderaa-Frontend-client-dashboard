import type { ReactNode } from 'react';
import { AlertTriangle, Check, Clock, MapPin } from 'lucide-react';
import { LiaHeadsetSolid, LiaTruckSolid } from 'react-icons/lia';
import { cn } from '@/lib/utils';
import type { CarrierChatDisplaySendState, CarrierChatFile, CarrierChatLocation, CarrierChatSendError } from '@/types/carrierChat';
import {
  CHAT_LOCATION_LABEL,
  CHAT_NOT_SENT_LABEL,
  CHAT_RESENT_LABEL,
  CHAT_RETRY_ARIA_LABEL,
  CHAT_RETRY_LABEL,
  CHAT_SENDING_LABEL,
  CHAT_SENT_BY_PREFIX,
  CHAT_SENT_STATE_LABEL,
  CHAT_SEND_ERROR_LABELS,
  CHAT_STORE_ACCOUNT_LABEL,
} from '@/app/dashboard/shipping-providers/components/followupNotesConstants';
import { ChatAttachmentLink } from './ChatAttachmentLink';

interface ChatBubbleProps {
  side: 'start' | 'end';
  avatar?: ReactNode;
  senderName?: string | null;
  time: ReactNode;
  sentBy?: string | null;
  sendState?: CarrierChatDisplaySendState | null;
  error?: CarrierChatSendError | null;
  retried?: boolean;
  onRetry?: () => void;
  file?: CarrierChatFile | null;
  attachmentName?: string | null;
  location?: CarrierChatLocation | null;
  children?: ReactNode;
}

const isImageType = (type: string | null): boolean => type?.startsWith('image/') ?? false;

export function ChatCarrierAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
      <LiaTruckSolid className="w-4 h-4 text-foreground" />
    </div>
  );
}

export function ChatAgentAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <LiaHeadsetSolid className="w-4 h-4 text-primary-text" />
    </div>
  );
}

export function ChatBubble({
  side,
  avatar,
  senderName,
  time,
  sentBy,
  sendState,
  error,
  retried = false,
  onRetry,
  file,
  attachmentName,
  location,
  children,
}: ChatBubbleProps) {
  const isEnd = side === 'end';
  const failed = sendState === 'FAILED' && !retried;
  const resent = sendState === 'FAILED' && retried;
  const sending = sendState === 'PENDING' || sendState === 'SENDING';

  return (
    <div className={cn('flex items-end gap-2 mb-3', isEnd ? 'justify-end' : 'justify-start')}>
      {!isEnd && avatar}
      <div className="flex max-w-[75%] flex-col">
        {senderName && <span className="mb-1 text-xs text-muted-foreground">{senderName}</span>}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            failed
              ? 'border border-destructive bg-destructive/10 text-foreground'
              : isEnd
                ? 'bg-primary text-primary-foreground rounded-bl-sm'
                : 'bg-muted text-foreground rounded-br-sm'
          )}
        >
          {children}
          {file ? (
            <div className="mt-2">
              <ChatAttachmentLink
                url={file.url}
                name={file.name}
                size={file.size}
                isImage={isImageType(file.type)}
              />
            </div>
          ) : attachmentName ? (
            <div className="mt-2">
              <ChatAttachmentLink url={null} name={attachmentName} size={null} isImage={false} />
            </div>
          ) : null}
          {location && (
            <a
              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              {CHAT_LOCATION_LABEL}
            </a>
          )}
          <div
            className={cn(
              'mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs',
              isEnd && !failed ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {sentBy !== undefined && (
              <span>{sentBy ? `${CHAT_SENT_BY_PREFIX} ${sentBy}` : CHAT_STORE_ACCOUNT_LABEL}</span>
            )}
            <span>{time}</span>
            {sending && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden="true" />
                {CHAT_SENDING_LABEL}
              </span>
            )}
            {sendState === 'SENT' && (
              <span className="inline-flex items-center" aria-label={CHAT_SENT_STATE_LABEL} role="img">
                <Check className="size-3" aria-hidden="true" />
              </span>
            )}
          </div>
          {failed && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <AlertTriangle className="size-3.5 text-destructive" aria-hidden="true" />
              <span>{CHAT_NOT_SENT_LABEL}</span>
              {error && <span className="text-muted-foreground">— {CHAT_SEND_ERROR_LABELS[error]}</span>}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  aria-label={CHAT_RETRY_ARIA_LABEL}
                  className="font-medium text-primary-text underline-offset-2 hover:underline max-sm:min-h-10"
                >
                  {CHAT_RETRY_LABEL}
                </button>
              )}
            </div>
          )}
          {resent && <div className="mt-2 text-xs text-muted-foreground">{CHAT_RESENT_LABEL}</div>}
        </div>
      </div>
      {isEnd && avatar}
    </div>
  );
}
