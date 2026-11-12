'use client';

import { useLayoutEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CHAT_ENTER_HINT,
  CHAT_SEND_LABEL,
} from '@/app/dashboard/shipping-providers/components/followupNotesConstants';

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  maxLength: number;
  enterToSend: boolean;
}

export function ChatComposer({ value, onChange, onSend, placeholder, maxLength, enterToSend }: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0;

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  const send = () => {
    if (canSend) onSend();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (!enterToSend || event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    send();
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="max-h-[7.25rem] min-h-10 flex-1 resize-none overflow-y-auto rounded-xl border border-input bg-background px-3 py-2 text-base leading-5 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 md:text-sm"
        />
        <Button
          type="button"
          size="icon"
          aria-label={CHAT_SEND_LABEL}
          disabled={!canSend}
          onClick={send}
          className="max-sm:size-10 shrink-0"
        >
          <SendHorizontal className="rtl:-scale-x-100" aria-hidden="true" />
        </Button>
      </div>
      {enterToSend && <p className="text-xs text-muted-foreground">{CHAT_ENTER_HINT}</p>}
    </div>
  );
}
