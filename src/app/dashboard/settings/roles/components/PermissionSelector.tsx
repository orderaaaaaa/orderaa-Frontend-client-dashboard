'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { LiaAngleDownSolid } from 'react-icons/lia';
import { Checkbox } from '@/components/ui/checkbox';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type {
  PermissionCatalogEntry,
  PermissionCatalogGroup,
} from '@/lib/api/authorization';
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
  visibleEntries: PermissionCatalogEntry[];
  selectedSet: Set<string>;
  disabled: boolean;
  expanded: boolean;
  onToggleExpanded: (key: string) => void;
  onToggleCode: (code: string) => void;
  onToggleEntries: (entries: PermissionCatalogEntry[], checked: boolean) => void;
}

const SM_QUERY = '(min-width: 640px)';

const expandedByDefault = () =>
  typeof window === 'undefined' || window.matchMedia(SM_QUERY).matches;

const normalize = (value: string) => value.trim().toLowerCase();

function entryMatches(
  entry: PermissionCatalogEntry,
  isStatus: boolean,
  query: string
) {
  if (!query) return true;
  const haystack = [
    entry.label,
    entry.code,
    isStatus ? orderStatusLabel(entry.code) : '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function PermissionSectionCard({
  section,
  visibleEntries,
  selectedSet,
  disabled,
  expanded,
  onToggleExpanded,
  onToggleCode,
  onToggleEntries,
}: SectionProps) {
  const panelId = useId();
  const selectedCount = countSelectedInSection(section, selectedSet);
  const total = section.entries.length;
  const visibleSelected = visibleEntries.filter((entry) =>
    selectedSet.has(entry.code)
  ).length;
  const allVisibleSelected =
    visibleEntries.length > 0 && visibleSelected === visibleEntries.length;
  const isStatus = section.variant === 'statusGrid';

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => onToggleExpanded(section.key)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-md text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <LiaAngleDownSolid
            aria-hidden
            className={cn(
              'size-4 shrink-0 text-gray-500 transition-transform',
              expanded && 'rotate-180'
            )}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-gray-900">
              {section.title}
            </span>
            {section.description && (
              <span className="mt-0.5 block text-xs text-gray-500">
                {section.description}
              </span>
            )}
          </span>
          <span className="shrink-0 tabular-nums text-xs text-gray-500">
            {selectedCount}/{total}
          </span>
        </button>

        <label
          className={cn(
            'flex min-h-10 shrink-0 items-center gap-2 text-sm',
            disabled ? 'text-gray-400' : 'cursor-pointer text-primary'
          )}
        >
          <Checkbox
            checked={allVisibleSelected}
            disabled={disabled || visibleEntries.length === 0}
            onCheckedChange={(checked) =>
              onToggleEntries(visibleEntries, checked === true)
            }
          />
          <span>تحديد الكل</span>
        </label>
      </div>

      <div
        id={panelId}
        hidden={!expanded}
        className={cn(
          'grid gap-x-4 gap-y-1 border-t border-gray-100 px-3 pb-3 pt-2 sm:px-4',
          isStatus
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        )}
      >
        {visibleEntries.map((entry) => {
          const checked = selectedSet.has(entry.code);

          return (
            <label
              key={entry.code}
              className={cn(
                'flex min-h-10 items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                disabled
                  ? 'cursor-not-allowed text-gray-600'
                  : 'cursor-pointer text-gray-700 hover:bg-gray-50',
                checked && 'bg-primary/5'
              )}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={() => onToggleCode(entry.code)}
              />
              {isStatus ? (
                <span className="min-w-0">
                  <span className="block font-medium">
                    {orderStatusLabel(entry.code)}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {entry.label}
                  </span>
                </span>
              ) : (
                <span className="min-w-0 break-words">{entry.label}</span>
              )}
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

  const [query, setQuery] = useState('');
  const normalizedQuery = normalize(query);
  const [expandedDefault] = useState(expandedByDefault);
  const [expandedOverrides, setExpandedOverrides] = useState<
    Record<string, boolean>
  >({});

  const onToggleEntries = useCallback(
    (entries: PermissionCatalogEntry[], checked: boolean) => {
      if (disabled) return;
      const next = new Set(selected);
      entries.forEach((entry) => {
        if (checked) next.add(entry.code);
        else next.delete(entry.code);
      });
      onChange([...next]);
    },
    [selected, onChange, disabled]
  );

  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          section,
          visibleEntries: section.entries.filter((entry) =>
            entryMatches(
              entry,
              section.variant === 'statusGrid',
              normalizedQuery
            )
          ),
        }))
        .filter(({ visibleEntries }) => visibleEntries.length > 0),
    [sections, normalizedQuery]
  );

  const isExpanded = (key: string) =>
    normalizedQuery !== '' || (expandedOverrides[key] ?? expandedDefault);

  const onToggleExpanded = (key: string) => {
    setExpandedOverrides((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? expandedDefault),
    }));
  };

  if (sections.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        لا توجد صلاحيات متاحة
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        value={query}
        inputMode="search"
        onChange={(event) => setQuery(event.target.value)}
        clearable
        onClear={() => setQuery('')}
        placeholder="ابحث عن صلاحية أو حالة"
        aria-label="بحث في الصلاحيات"
      />

      {visibleSections.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500" role="status">
          لا توجد صلاحيات مطابقة لـ «{query.trim()}»
        </p>
      ) : (
        visibleSections.map(({ section, visibleEntries }) => (
          <PermissionSectionCard
            key={section.key}
            section={section}
            visibleEntries={visibleEntries}
            selectedSet={selectedSet}
            disabled={disabled}
            expanded={isExpanded(section.key)}
            onToggleExpanded={onToggleExpanded}
            onToggleCode={onToggleCode}
            onToggleEntries={onToggleEntries}
          />
        ))
      )}
    </div>
  );
}
