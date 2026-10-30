'use client';

import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { EntitySideSheet } from './EntitySideSheet';

interface ShortcutEntry {
  label: TranslationKey;
  combos: readonly (readonly string[])[];
}

const SHORTCUT_ENTRIES: readonly ShortcutEntry[] = [
  { label: 'canonical.keys.search', combos: [['/']] },
  { label: 'canonical.keys.move', combos: [['↓'], ['↑'], ['J'], ['K']] },
  { label: 'canonical.keys.select', combos: [['Space'], ['X']] },
  { label: 'canonical.keys.range', combos: [['Shift', 'Space']] },
  { label: 'canonical.keys.link', combos: [['L']] },
  { label: 'canonical.keys.newName', combos: [['N']] },
  { label: 'canonical.keys.details', combos: [['Enter']] },
  { label: 'canonical.keys.confirm', combos: [['Enter']] },
  { label: 'canonical.keys.close', combos: [['Esc']] },
  { label: 'canonical.keys.help', combos: [['Shift', '/']] },
];

export interface ShortcutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

export function ShortcutSheet({ open, onOpenChange, onCloseAutoFocus }: ShortcutSheetProps) {
  const { t } = useI18n();

  return (
    <EntitySideSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('canonical.keys.title')}
      description={t('canonical.keys.title')}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <dl className="divide-y">
        {SHORTCUT_ENTRIES.map((entry) => (
          <div key={entry.label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-foreground">{t(entry.label)}</dt>
            <dd dir="ltr" className="flex flex-wrap items-center justify-end gap-2">
              {entry.combos.map((combo) => (
                <span key={combo.join('+')} className="inline-flex items-center gap-1">
                  {combo.map((key) => (
                    <kbd
                      key={key}
                      className="min-w-6 rounded border bg-muted px-1.5 py-0.5 text-center font-mono text-xs text-foreground"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </EntitySideSheet>
  );
}
