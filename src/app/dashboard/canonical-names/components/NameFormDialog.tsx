'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Input from '@/components/ui/Input';
import { useI18n } from '@/i18n/I18nProvider';

interface NameFormDialogProps {
  mode: 'create' | 'rename';
  initialName?: string;
  existingNames?: string[];
  submitting?: boolean;
  submitError?: string | null;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

const NAME_MAX_LENGTH = 191;
const NAME_COUNTER_AFTER = 150;

const comparable = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

export default function NameFormDialog({
  mode,
  initialName,
  existingNames = [],
  submitting,
  submitError,
  onSubmit,
  onClose,
}: NameFormDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName ?? '');
  const [touched, setTouched] = useState(false);
  const trimmed = name.trim();
  const duplicate =
    trimmed.length > 0 &&
    existingNames.some((existing) => comparable(existing) === comparable(trimmed));
  const unchanged =
    mode === 'rename' && initialName !== undefined && trimmed === initialName.trim();
  const fieldError = !touched
    ? undefined
    : trimmed.length === 0
      ? t('canonical.name.required')
      : duplicate
        ? t('canonical.name.duplicate')
        : undefined;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (trimmed.length === 0 || duplicate || unchanged || submitting) return;
    onSubmit(trimmed);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('canonical.name.create.title')
                : t('canonical.name.rename.title', { name: initialName ?? '' })}
            </DialogTitle>
          </DialogHeader>
          <Input
            id="canonical-name-input"
            label={t('canonical.name.label')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTouched(true);
            }}
            error={fieldError}
            maxLength={NAME_MAX_LENGTH}
            autoFocus
          />
          {name.length > NAME_COUNTER_AFTER && (
            <p className="text-xs text-muted-foreground text-end">
              {name.length}/{NAME_MAX_LENGTH}
            </p>
          )}
          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" className="min-h-10" onClick={onClose}>
              {t('canonical.action.cancel')}
            </Button>
            <Button
              type="submit"
              className="min-h-10"
              disabled={!trimmed || duplicate || unchanged || submitting}
            >
              {mode === 'create' ? t('canonical.shell.createName') : t('canonical.action.continueToImpact')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
