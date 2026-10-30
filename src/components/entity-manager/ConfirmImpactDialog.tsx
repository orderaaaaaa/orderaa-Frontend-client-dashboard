'use client';

import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n/I18nProvider';
import { ErrorWithRetry } from './StateViews';

export interface ConfirmImpact {
  state: 'loading' | 'error' | 'ready';
  data?: unknown;
  onRetry: () => void;
}

export interface ConfirmBlocked {
  reason: string;
  items?: string[];
}

export interface ConfirmImpactDialogProps {
  title: string;
  description: string;
  impact: ConfirmImpact;
  body: ReactNode;
  blocked?: ConfirmBlocked;
  tone: 'default' | 'destructive';
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  error?: string | null;
}

export function ConfirmImpactDialog({
  title,
  description,
  impact,
  body,
  blocked,
  tone,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onClose,
  error,
}: ConfirmImpactDialogProps) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const loading = impact.state === 'loading';
  const confirmDisabled = pending || loading || impact.state === 'error' || blocked !== undefined;

  const handleConfirm = async () => {
    setPending(true);
    const attempt = async () => {
      await onConfirm();
    };
    await attempt().catch(() => undefined);
    setPending(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            <span className="text-sm">{t('canonical.combobox.loading')}</span>
          </div>
        )}
        {impact.state === 'error' && (
          <ErrorWithRetry message={t('canonical.impact.loadError')} onRetry={impact.onRetry} />
        )}
        {impact.state === 'ready' && body}

        {blocked && (
          <div role="alert" className="flex flex-col gap-2 rounded-md border border-destructive/40 p-3 text-sm text-foreground">
            <p>{blocked.reason}</p>
            {blocked.items && blocked.items.length > 0 && (
              <ul className="list-disc ps-5">
                {blocked.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" className="min-h-11 sm:min-h-10" onClick={onClose} disabled={pending}>
            {t('canonical.action.cancel')}
          </Button>
          <Button
            type="button"
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            className="min-h-11 sm:min-h-10"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            aria-busy={pending}
          >
            {(pending || loading) && <Loader2 className="animate-spin" aria-hidden="true" />}
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
