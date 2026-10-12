'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EditorSectionProps {
  id: string;
  title: string;
  description?: string;
  error?: string;
  dirty?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function EditorSection({
  id,
  title,
  description,
  error,
  dirty,
  actions,
  children,
}: EditorSectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-900"
          >
            {title}
            {dirty && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                غير محفوظ
              </span>
            )}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}
      {children}
    </section>
  );
}
