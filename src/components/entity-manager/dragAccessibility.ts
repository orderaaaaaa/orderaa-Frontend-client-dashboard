import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core';
import type { TranslationKey, TranslationParams } from '@/i18n/translate';

type Translate = (key: TranslationKey, params?: TranslationParams) => string;

interface DragEntry {
  id: string | number;
  data: { current?: unknown };
}

function labelOf(entry: DragEntry): string {
  const data = entry.data.current;
  if (typeof data === 'object' && data !== null && 'label' in data && typeof data.label === 'string') {
    return data.label;
  }
  return String(entry.id);
}

export function buildDragAccessibility(t: Translate): {
  announcements: Announcements;
  screenReaderInstructions: ScreenReaderInstructions;
} {
  return {
    announcements: {
      onDragStart: ({ active }) => t('canonical.a11y.dragPickup', { item: labelOf(active) }),
      onDragOver: ({ over }) => (over ? t('canonical.a11y.dragOver', { name: labelOf(over) }) : undefined),
      onDragEnd: ({ active, over }) =>
        over
          ? t('canonical.a11y.dragDrop', { item: labelOf(active), name: labelOf(over) })
          : t('canonical.a11y.dragCancel'),
      onDragCancel: () => t('canonical.a11y.dragCancel'),
    },
    screenReaderInstructions: {
      draggable: t('canonical.a11y.dragInstructions'),
    },
  };
}
