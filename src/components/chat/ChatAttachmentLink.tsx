import { ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { formatNumber } from '@/utils/format';

interface ChatAttachmentLinkProps {
  url: string | null;
  name: string;
  size: number | null;
  isImage: boolean;
}

const SAFE_LINK_PATTERN = /^https?:\/\//i;

const formatSize = (bytes: number): string => `${formatNumber(Math.max(1, Math.round(bytes / 1024)))} KB`;

export function ChatAttachmentLink({ url, name, size, isImage }: ChatAttachmentLinkProps) {
  const Icon = isImage ? ImageIcon : FileText;

  if (url === null || !SAFE_LINK_PATTERN.test(url)) {
    return (
      <span className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 truncate">{name}</span>
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted max-sm:min-h-10"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 truncate">{name}</span>
      {size !== null && <span className="shrink-0 text-muted-foreground">{formatSize(size)}</span>}
      <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
    </a>
  );
}
