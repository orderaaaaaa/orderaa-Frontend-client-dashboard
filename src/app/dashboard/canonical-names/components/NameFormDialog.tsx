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
  submitting?: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export default function NameFormDialog({
  mode,
  initialName,
  submitting,
  onSubmit,
  onClose,
}: NameFormDialogProps) {
  const [name, setName] = useState(initialName ?? '');

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'إضافة اسم موحد' : 'إعادة تسمية'}
          </DialogTitle>
        </DialogHeader>
        <Input
          label="الاسم"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            disabled={!name.trim() || submitting}
            onClick={() => onSubmit(name.trim())}
          >
            {mode === 'create' ? 'إضافة' : 'متابعة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
