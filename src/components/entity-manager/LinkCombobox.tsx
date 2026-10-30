'use client';

import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useI18n } from '@/i18n/I18nProvider';
import { normalizeArabic } from '@/utils/arabicNormalize';
import type { ComboGroup, ComboOption, LinkTarget } from './types';

export interface LinkComboboxProps {
  groups: ComboGroup[];
  onSelect: (target: LinkTarget, option: ComboOption) => void;
  onCreate?: (name: string) => void;
  createLabel?: string;
  triggerLabel: string;
  ariaLabel: string;
  error?: string | null;
  disabled?: boolean;
  disabledReason?: string;
  placement: 'popover' | 'bottomSheet';
}

export function LinkCombobox({
  groups,
  onSelect,
  onCreate,
  createLabel,
  triggerLabel,
  ariaLabel,
  error,
  disabled = false,
  disabledReason,
  placement,
}: LinkComboboxProps) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const reasonId = `${baseId}-reason`;

  const pick = (option: ComboOption) => {
    if (option.target.kind === 'new' && onCreate) {
      onCreate(option.target.newName);
    } else {
      onSelect(option.target, option);
    }
    setOpen(false);
  };

  const panel = (
    <LinkComboPanel
      baseId={baseId}
      groups={groups}
      createLabel={createLabel}
      error={error}
      ariaLabel={ariaLabel}
      onPick={pick}
    />
  );

  const trigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="min-h-11 min-w-11"
      disabled={disabled}
      aria-describedby={disabled && disabledReason ? reasonId : undefined}
    >
      {triggerLabel}
    </Button>
  );

  return (
    <div className="inline-flex flex-col items-start gap-1">
      {placement === 'popover' ? (
        <Popover
          open={open && !disabled}
          onOpenChange={(next) => setOpen(next && !disabled)}
        >
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-80 max-w-[calc(100vw-2rem)] p-2"
          >
            {panel}
          </PopoverContent>
        </Popover>
      ) : (
        <Sheet
          open={open && !disabled}
          onOpenChange={(next) => setOpen(next && !disabled)}
        >
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent
            side="bottom"
            aria-describedby={undefined}
            className="max-h-[85dvh] gap-3 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <SheetTitle className="sr-only">{ariaLabel}</SheetTitle>
            {panel}
          </SheetContent>
        </Sheet>
      )}
      {disabled && disabledReason && (
        <p id={reasonId} className="text-sm text-muted-foreground">
          {disabledReason}
        </p>
      )}
    </div>
  );
}

interface LinkComboPanelProps {
  baseId: string;
  groups: ComboGroup[];
  createLabel?: string;
  error?: string | null;
  ariaLabel: string;
  onPick: (option: ComboOption) => void;
}

function LinkComboPanel({
  baseId,
  groups,
  createLabel,
  error,
  ariaLabel,
  onPick,
}: LinkComboPanelProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const text = query.trim();
  const needle = normalizeArabic(text);
  const listboxId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  const visibleOptions = (group: ComboGroup): ComboOption[] => {
    if (group.status !== 'ready') return [];
    if (group.id === 'suggested') return group.options;
    return group.options.filter((option) =>
      normalizeArabic(option.label).includes(needle),
    );
  };

  const hasExactMatch =
    text !== '' &&
    groups.some((group) =>
      group.options.some((option) => normalizeArabic(option.label) === needle),
    );
  const createOptions: ComboOption[] =
    text !== '' && !hasExactMatch
      ? [
          {
            id: 'create',
            label: createLabel ?? t('canonical.action.createFromSpelling'),
            target: { kind: 'new', newName: text },
          },
        ]
      : [];

  let cursor = createOptions.length;
  const sections = groups.map((group) => {
    const options = visibleOptions(group);
    const start = cursor;
    cursor += options.length;
    return { group, options, start };
  });
  const flat: ComboOption[] = [
    ...createOptions,
    ...sections.flatMap((section) => section.options),
  ];

  const activeIndex =
    flat.length === 0 || active < 0 ? -1 : Math.min(active, flat.length - 1);
  const activeOption = activeIndex >= 0 ? flat[activeIndex] : undefined;
  const activeDomId = activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : null;

  useEffect(() => {
    if (activeDomId === null) return;
    document.getElementById(activeDomId)?.scrollIntoView({ block: 'nearest' });
  }, [activeDomId]);

  const move = (step: 1 | -1) => {
    if (flat.length === 0) return;
    setActive(
      activeIndex < 0
        ? step === 1
          ? 0
          : flat.length - 1
        : (activeIndex + step + flat.length) % flat.length,
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && activeOption) {
      event.preventDefault();
      onPick(activeOption);
    }
  };

  const renderOption = (option: ComboOption, index: number) => (
    <div
      key={optionId(index)}
      id={optionId(index)}
      role="option"
      aria-selected={index === activeIndex}
      onMouseEnter={() => setActive(index)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onPick(option)}
      className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
    >
      <span className="min-w-0 break-words text-foreground">
        {option.label}
      </span>
      {(option.score !== undefined || option.hint) && (
        <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          {option.score !== undefined && (
            <span>
              {t('canonical.suggest.score', {
                score: Math.round(option.score * 100),
              })}
            </span>
          )}
          {option.hint && <span>{option.hint}</span>}
        </span>
      )}
    </div>
  );

  const readySections = sections.filter(
    ({ group, options }) => group.status === 'ready' && options.length > 0,
  );
  const pendingSections = sections.filter(
    ({ group }) => group.status !== 'ready',
  );
  const noOptions =
    flat.length === 0 &&
    sections.every(({ group }) => group.status === 'ready');

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeDomId ?? undefined}
        autoComplete="off"
        autoFocus
        placeholder={t('canonical.action.linkPlaceholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(-1);
        }}
        onKeyDown={handleKeyDown}
        className="min-h-11 w-full rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel}
        className="flex max-h-72 flex-col overflow-y-auto"
      >
        {createOptions.map((option) => renderOption(option, 0))}
        {readySections.map(({ group, options, start }) => (
          <div
            key={group.id}
            role="group"
            aria-labelledby={`${baseId}-heading-${group.id}`}
            className="flex flex-col"
          >
            <p
              id={`${baseId}-heading-${group.id}`}
              className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground"
            >
              {t(group.headingKey)}
            </p>
            {options.map((option, index) =>
              renderOption(option, start + index),
            )}
          </div>
        ))}
      </div>
      {pendingSections.map(({ group }) => {
        const loadingKey =
          group.id === 'suggested'
            ? 'canonical.suggest.loading'
            : 'canonical.combobox.loading';
        const errorKey =
          group.id === 'suggested'
            ? 'canonical.combobox.candidatesError'
            : 'canonical.combobox.error';
        return (
          <div key={group.id} className="flex flex-col">
            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground">
              {t(group.headingKey)}
            </p>
            {group.status === 'loading' && (
              <p
                role="status"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
              >
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {t(loadingKey)}
              </p>
            )}
            {group.status === 'error' && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm text-destructive"
              >
                <p>{t(errorKey)}</p>
                {group.onRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 min-w-11"
                    onClick={group.onRetry}
                  >
                    {t('common.retry')}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
      {noOptions && (
        <p role="status" className="px-3 py-2 text-sm text-muted-foreground">
          {t('canonical.combobox.empty', { query: text })}
        </p>
      )}
    </div>
  );
}
