'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n/I18nProvider';
import { pluralAr } from '@/i18n/pluralAr';
import type {
  GroupAttributeContext,
  LinkItem,
  SourceGroup,
} from '@/types/canonicalNames';

export interface LinkContextRow {
  spellingLabel: string;
  contexts: GroupAttributeContext[];
}

export interface LinkWarningState {
  items: LinkItem[];
  rows: LinkContextRow[];
  onLinked?: () => void;
}

export const describeLinkGroup = (group: SourceGroup): LinkContextRow => ({
  spellingLabel: group.spellings[0]?.text ?? group.normalizedText,
  contexts: group.attributeContexts,
});

export const multiContextRows = (rows: LinkContextRow[]) =>
  rows.filter((row) => row.contexts.length >= 2);

interface LinkContextWarningProps {
  warning: LinkWarningState | null;
  onCancel: () => void;
  onConfirm: (warning: LinkWarningState) => void;
}

export function LinkContextWarning({
  warning,
  onCancel,
  onConfirm,
}: LinkContextWarningProps) {
  const { t } = useI18n();
  if (!warning) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('canonical.link.contextWarning.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm text-foreground">
          {warning.rows.map((row) => (
            <div key={row.spellingLabel} className="flex flex-col gap-1">
              <p>
                {t('canonical.link.contextWarning.body', {
                  spelling: row.spellingLabel,
                  count: row.contexts.length,
                  attributeNoun: pluralAr(t, 'attribute', row.contexts.length),
                })}
              </p>
              <p className="text-muted-foreground">
                {t('canonical.queue.row.contexts', {
                  names: row.contexts.map((context) => context.name).join('، '),
                })}
              </p>
            </div>
          ))}
          <p className="text-muted-foreground">{t('canonical.link.noUndo')}</p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 min-w-11"
            onClick={onCancel}
          >
            {t('canonical.action.cancel')}
          </Button>
          <Button
            type="button"
            className="min-h-11 min-w-11"
            onClick={() => onConfirm(warning)}
          >
            {t('canonical.action.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
