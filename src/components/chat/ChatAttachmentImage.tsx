'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CHAT_IMAGE_ATTACHMENT_LABEL } from '@/app/dashboard/shipping-providers/components/followupNotesConstants';
import { ChatAttachmentLink, formatAttachmentSize } from './ChatAttachmentLink';

interface ChatAttachmentImageProps {
  url: string;
  name: string;
  size: number | null;
}

export function ChatAttachmentImage({ url, name, size }: ChatAttachmentImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <ChatAttachmentLink url={url} name={name} size={size} isImage />;
  }

  const label = name || CHAT_IMAGE_ATTACHMENT_LABEL;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="block w-fit max-w-[min(15rem,100%)] overflow-hidden rounded-lg border border-border bg-muted transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image
        src={url}
        alt={label}
        width={240}
        height={240}
        unoptimized
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="block h-auto max-h-60 w-auto max-w-full object-contain"
      />
      {(name || size !== null) && (
        <div className="flex min-w-0 items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
          {name && <span className="min-w-0 truncate">{name}</span>}
          {size !== null && <span className="shrink-0">{formatAttachmentSize(size)}</span>}
        </div>
      )}
    </a>
  );
}
