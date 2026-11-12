import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  PREVIEW_SAMPLE,
  WHATSAPP_PLACEHOLDERS,
  WHATSAPP_PLACEHOLDER_LABELS,
  WHATSAPP_TEMPLATE_MAX_LENGTH,
  countCodePoints,
  fillPlaceholders,
  splitPlaceholderTokens,
} from '../utils/whatsappTemplateText';
import type { WhatsAppTemplatePlaceholder } from '@/types/whatsappTemplates';

interface WhatsAppTemplateFieldProps {
  id: string;
  title: string;
  value: string;
  defaultBody: string;
  error?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}

export default function WhatsAppTemplateField({
  id,
  title,
  value,
  defaultBody,
  error,
  readOnly = false,
  onChange,
}: WhatsAppTemplateFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUsingDefault = value.trim() === '';
  const effectiveText = isUsingDefault ? defaultBody : value;
  const length = countCodePoints(value);
  const isOverLimit = length > WHATSAPP_TEMPLATE_MAX_LENGTH;
  const isMissingShippingCode = !effectiveText.includes('{shippingCode}');
  const previewText = fillPlaceholders(effectiveText, PREVIEW_SAMPLE);

  const insertPlaceholder = (placeholder: WhatsAppTemplatePlaceholder) => {
    const token = `{${placeholder}}`;
    const element = textareaRef.current;
    const start = element?.selectionStart ?? value.length;
    const end = element?.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + token + value.slice(end));
    requestAnimationFrame(() => {
      const caret = start + token.length;
      element?.focus();
      element?.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {title}
        </label>
        <span
          dir="ltr"
          className={`text-xs ${isOverLimit ? 'text-red-600 font-medium' : 'text-gray-500'}`}
        >
          {`${length} / ${WHATSAPP_TEMPLATE_MAX_LENGTH}`}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        id={id}
        dir="rtl"
        rows={6}
        value={value}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border bg-card px-3 py-2 text-base md:text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-primary/40 read-only:bg-gray-50 read-only:text-gray-600 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />

      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          {WHATSAPP_PLACEHOLDERS.map((placeholder) => (
            <Button
              key={placeholder}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => insertPlaceholder(placeholder)}
            >
              {WHATSAPP_PLACEHOLDER_LABELS[placeholder]}
            </Button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {!error && isMissingShippingCode && (
        <p className="text-xs text-amber-700" role="status">
          الرسالة لا تحتوي على رقم الشحنة
        </p>
      )}

      {!readOnly && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full"
          disabled={value === defaultBody}
          onClick={() => onChange(defaultBody)}
        >
          استعادة النص الافتراضي
        </Button>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs text-gray-500">معاينة بمثال</span>
          {isUsingDefault && (
            <span className="text-xs text-gray-500">سيُستخدم النص الافتراضي</span>
          )}
        </div>
        <div
          dir="rtl"
          className="max-w-md rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-4 py-3 text-sm leading-relaxed text-gray-900 whitespace-pre-wrap break-words"
        >
          {splitPlaceholderTokens(previewText).map((part, index) =>
            index % 2 === 1 ? (
              <span key={index} dir="ltr" className="font-semibold text-red-600">
                {part}
              </span>
            ) : (
              <React.Fragment key={index}>{part}</React.Fragment>
            )
          )}
        </div>
      </div>
    </div>
  );
}
