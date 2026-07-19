import React from 'react';

interface GroupSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function GroupSection({ title, description, children }: GroupSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3 mt-5 min-w-0 max-w-full">
        <div className="w-1 h-8 bg-primary rounded-full shrink-0"></div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
