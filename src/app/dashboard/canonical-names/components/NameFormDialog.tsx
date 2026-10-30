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

interface NameFormDialogProps {
  mode: 'create' | 'rename';
  initialName?: string;
  existingNames?: string[];
  submitting?: boolean;
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
  onSubmit,
  onClose,
}: NameFormDialogProps) {
  const [name, setName] = useState(initialName ?? '');
  const [touched, setTouched] = useState(false);
  const trimmed = name.trim();
  const duplicate =
    trimmed.length > 0 &&
    existingNames.some((existing) => comparable(existing) === comparable(trimmed));
  const unchanged =
    mode === 'rename' && initialName !== undefined && trimmed === initialName.trim();
  const error = !touched
    ? undefined
    : trimmed.length === 0
      ? 'الاسم مطلوب'
      : duplicate
        ? 'يوجد اسم موحد بنفس الاسم'
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
              {mode === 'create' ? 'إضافة اسم موحد' : 'إعادة تسمية'}
            </DialogTitle>
          </DialogHeader>
          <Input
            id="canonical-name-input"
            label="الاسم"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setTouched(true);
            }}
            error={error}
            maxLength={NAME_MAX_LENGTH}
            autoFocus
          />
          {name.length > NAME_COUNTER_AFTER && (
            <p className="text-xs text-muted-foreground text-end">
              {name.length}/{NAME_MAX_LENGTH}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" className="min-h-10" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="submit"
              className="min-h-10"
              disabled={!trimmed || duplicate || unchanged || submitting}
            >
              {mode === 'create' ? 'إضافة' : 'متابعة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
