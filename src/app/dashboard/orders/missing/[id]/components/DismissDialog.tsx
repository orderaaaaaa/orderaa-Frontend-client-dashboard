'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDismissMissingOrder } from '@/services/missingOrders';

interface DismissDialogProps {
  id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissed: () => void;
}

export function DismissDialog({ id, isOpen, onOpenChange, onDismissed }: DismissDialogProps) {
  const [reason, setReason] = useState('');
  const { mutate, isPending } = useDismissMissingOrder(id);

  const handleConfirm = () => {
    if (!reason.trim()) return;
    mutate(reason.trim(), {
      onSuccess: () => {
        toast.success('تم استبعاد الطلب');
        onOpenChange(false);
        onDismissed();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'تعذر استبعاد الطلب');
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>استبعاد الطلب</DialogTitle>
        </DialogHeader>

        <div>
          <label className="block font-medium text-[16px] mb-1">
            سبب الاستبعاد <span className="text-red-500">*</span>
          </label>
          <Textarea
            name="dismissReason"
            placeholder="سبب الاستبعاد"
            className="h-[120px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            disabled={!reason.trim() || isPending}
            onClick={handleConfirm}
          >
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
