import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ARABIC_PATTERN = /[؀-ۿ]/;

function toDisplayMessage(error: unknown, fallback: string): string {
  const response = (
    error as {
      response?: { status?: number; data?: { message?: string | string[] } };
    }
  )?.response;
  const status = response?.status;
  if (!response || status === undefined || status >= 500) return fallback;
  const raw = response.data?.message;
  const parts = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const kept = Array.from(
    new Set(
      parts
        .filter((part): part is string => typeof part === 'string')
        .map((part) => (ARABIC_PATTERN.test(part) ? part : fallback)),
    ),
  );
  return kept.length > 0 ? kept.join('\n') : fallback;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      {icon}
      <p className="text-lg font-semibold text-gray-400">{title}</p>
      {description && <p className="text-sm text-gray-400">{description}</p>}
      {action}
    </div>
  );
}

interface ErrorStateProps {
  error: unknown;
  fallback: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({ error, fallback, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle className="size-10 text-red-400" aria-hidden="true" />
      <p className="text-base font-semibold text-gray-700">
        {toDisplayMessage(error, fallback)}
      </p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          className="h-10 px-5"
          onClick={onRetry}
        >
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

export { EmptyState, ErrorState };
export type { EmptyStateProps, ErrorStateProps };
