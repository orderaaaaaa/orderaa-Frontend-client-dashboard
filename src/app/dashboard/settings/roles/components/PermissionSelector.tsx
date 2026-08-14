'use client';

import { useCallback, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { PermissionCatalogGroup } from '@/lib/api/authorization';
import {
  buildPermissionSections,
  countSelectedInSection,
  orderStatusLabel,
  type PermissionSection,
} from '../utils/permissionCatalog';

interface PermissionSelectorProps {
  catalog: PermissionCatalogGroup[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** System roles are shown read-only rather than hidden. */
  disabled?: boolean;
}

interface SectionProps {
  section: PermissionSection;
  selectedSet: Set<string>;
  disabled: boolean;
  onToggleCode: (code: string) => void;
  onToggleSection: (section: PermissionSection, checked: boolean) => void;
}

function SectionHeader({
  section,
  selectedCount,
  disabled,
  onToggleSection,
}: {
  section: PermissionSection;
  selectedCount: number;
  disabled: boolean;
  onToggleSection: (section: PermissionSection, checked: boolean) => void;
}) {
  const total = section.entries.length;
  const allSelected = selectedCount === total;

  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
        {section.description && (
          <p className="mt-0.5 text-xs text-gray-400">{section.description}</p>
        )}
      </div>

      <label
        className={cn(
          'flex shrink-0 items-center gap-2 text-xs',
          disabled ? 'text-gray-400' : 'cursor-pointer text-primary'
        )}
      >
        <span className="tabular-nums text-gray-400">
          {selectedCount}/{total}
        </span>
        <Checkbox
          className="h-4 w-4"
          checked={allSelected}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onToggleSection(section, checked === true)
          }
        />
        <span>تحديد الكل</span>
      </label>
    </div>
  );
}

function PermissionSectionCard({
  section,
  selectedSet,
  disabled,
  onToggleCode,
  onToggleSection,
}: SectionProps) {
  const selectedCount = countSelectedInSection(section, selectedSet);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <SectionHeader
        section={section}
        selectedCount={selectedCount}
        disabled={disabled}
        onToggleSection={onToggleSection}
      />

      <div
        className={cn(
          'grid gap-x-4 gap-y-2',
          section.variant === 'statusGrid'
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2'
        )}
      >
        {section.entries.map((entry) => {
          const checked = selectedSet.has(entry.code);
          const isStatus = section.variant === 'statusGrid';

          return (
            <label
              key={entry.code}
              // The server label for a status code is a whole sentence; the grid
              // shows the status name and keeps the sentence as the tooltip.
              title={entry.label}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                disabled
                  ? 'cursor-not-allowed text-gray-400'
                  : 'cursor-pointer text-gray-700 hover:bg-gray-50',
                checked && !disabled && 'bg-primary/5'
              )}
            >
              <Checkbox
                className="h-4 w-4"
                checked={checked}
                disabled={disabled}
                onCheckedChange={() => onToggleCode(entry.code)}
              />
              <span className="truncate">
                {isStatus ? orderStatusLabel(entry.code) : entry.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Permission checkbox form driven entirely by `GET /permissions` — group titles
 * and code labels come from the server (localized via `Accept-Language`), so
 * new permission codes appear here without a frontend change.
 */
export function PermissionSelector({
  catalog,
  selected,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const sections = useMemo(() => buildPermissionSections(catalog), [catalog]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const onToggleCode = useCallback(
    (code: string) => {
      if (disabled) return;
      const next = new Set(selected);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      onChange([...next]);
    },
    [selected, onChange, disabled]
  );

  const onToggleSection = useCallback(
    (section: PermissionSection, checked: boolean) => {
      if (disabled) return;
      const next = new Set(selected);
      section.entries.forEach((entry) => {
        if (checked) next.add(entry.code);
        else next.delete(entry.code);
      });
      onChange([...next]);
    },
    [selected, onChange, disabled]
  );

  if (sections.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        لا توجد صلاحيات متاحة
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <PermissionSectionCard
          key={section.key}
          section={section}
          selectedSet={selectedSet}
          disabled={disabled}
          onToggleCode={onToggleCode}
          onToggleSection={onToggleSection}
        />
      ))}
    </div>
  );
}
