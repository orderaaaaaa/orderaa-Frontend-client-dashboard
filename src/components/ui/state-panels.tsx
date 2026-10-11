import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/utils/apiError';

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
        {getApiErrorMessage(error, fallback)}
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
