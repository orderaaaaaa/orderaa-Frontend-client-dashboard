'use client';

import clsx from 'clsx';

const SECRET_HELP_TEXT =
  'القيمة المحفوظة لا تُعرض. اتركه فارغاً للإبقاء عليها، أو أدخل قيمة جديدة لتغييرها.';

export const SECRET_KEEP_PLACEHOLDER = 'اتركه فارغاً للإبقاء عليه';

interface SavedSecretStatusProps {
  label: string;
  saved: boolean;
  helpText?: string;
  className?: string;
}

export function SavedSecretStatus({
  label,
  saved,
  helpText = SECRET_HELP_TEXT,
  className,
}: SavedSecretStatusProps) {
  return (
    <div className={clsx('space-y-1', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span
          className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            saved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          )}
        >
          {saved ? 'محفوظ' : 'غير محفوظ'}
        </span>
      </div>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
