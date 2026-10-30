import { useCallback, type KeyboardEvent, type RefObject } from 'react';

export const QUEUE_ROW_ATTR = 'data-queue-row';
export const BULK_BAR_ATTR = 'data-bulk-bar';

const TEXT_ENTRY_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="combobox"], [role="dialog"], [role="alertdialog"]';

export interface QueueKeyboardOptions {
  containerRef: RefObject<HTMLElement>;
  rowIds: readonly string[];
  focusedId: string | null;
  enabled?: boolean;
  canManage: boolean;
  onFocusRow: (id: string) => void;
  onToggleRow: (id: string) => void;
  onRangeRow: (id: string) => void;
  onLinkRow: (id: string) => void;
  onLinkSelection?: () => void;
  onOpenRow: (id: string) => void;
}

export interface QueueKeyboard {
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.closest(TEXT_ENTRY_SELECTOR) !== null;
}

function ownRowIdOf(target: EventTarget | null): string | null {
  if (!(target instanceof HTMLElement)) return null;
  return target.getAttribute(QUEUE_ROW_ATTR);
}

function isWithinBulkBar(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest(`[${BULK_BAR_ATTR}]`) !== null;
}

export function focusQueueRow(container: HTMLElement | null, id: string): boolean {
  if (!container) return false;
  const row = Array.from(container.querySelectorAll<HTMLElement>(`[${QUEUE_ROW_ATTR}]`)).find(
    (element) => element.getAttribute(QUEUE_ROW_ATTR) === id,
  );
  if (!row) return false;
  row.focus();
  row.scrollIntoView({ block: 'nearest' });
  return true;
}

export function queueRowTabIndex(rowIds: readonly string[], focusedId: string | null, id: string): 0 | -1 {
  const tabStop = focusedId !== null && rowIds.includes(focusedId) ? focusedId : rowIds[0];
  return id === tabStop ? 0 : -1;
}

export function findNextRowId(
  rowIds: readonly string[],
  fromId: string | null,
  accepts: (id: string) => boolean,
): string | null {
  if (rowIds.length === 0) return null;
  const start = fromId === null ? 0 : rowIds.indexOf(fromId) + 1;
  for (let offset = 0; offset < rowIds.length; offset += 1) {
    const candidate = rowIds[(start + offset) % rowIds.length];
    if (candidate !== fromId && accepts(candidate)) return candidate;
  }
  return null;
}

export function useQueueKeyboard(options: QueueKeyboardOptions): QueueKeyboard {
  const {
    containerRef,
    rowIds,
    focusedId,
    enabled = true,
    canManage,
    onFocusRow,
    onToggleRow,
    onRangeRow,
    onLinkRow,
    onLinkSelection,
    onOpenRow,
  } = options;

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!enabled || event.nativeEvent.isComposing || isTextEntryTarget(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const ownId = ownRowIdOf(event.target);

      const move = (delta: 1 | -1) => {
        if (rowIds.length === 0) return;
        const currentId = ownId ?? focusedId;
        const index = currentId === null ? -1 : rowIds.indexOf(currentId);
        const nextIndex =
          index === -1
            ? delta === 1
              ? 0
              : rowIds.length - 1
            : Math.min(rowIds.length - 1, Math.max(0, index + delta));
        const nextId = rowIds[nextIndex];
        event.preventDefault();
        onFocusRow(nextId);
        focusQueueRow(containerRef.current, nextId);
      };

      switch (event.code) {
        case 'ArrowDown':
        case 'KeyJ':
          move(1);
          return;
        case 'ArrowUp':
        case 'KeyK':
          move(-1);
          return;
        case 'Space':
          if (!canManage || ownId === null) return;
          event.preventDefault();
          if (event.shiftKey) onRangeRow(ownId);
          else onToggleRow(ownId);
          return;
        case 'KeyX':
          if (!canManage || ownId === null) return;
          event.preventDefault();
          onToggleRow(ownId);
          return;
        case 'KeyL':
          if (!canManage) return;
          if (ownId !== null) {
            event.preventDefault();
            onLinkRow(ownId);
          } else if (onLinkSelection && isWithinBulkBar(event.target)) {
            event.preventDefault();
            onLinkSelection();
          }
          return;
        case 'Enter':
          if (ownId === null) return;
          event.preventDefault();
          onOpenRow(ownId);
          return;
        default:
          return;
      }
    },
    [
      enabled,
      rowIds,
      focusedId,
      canManage,
      containerRef,
      onFocusRow,
      onToggleRow,
      onRangeRow,
      onLinkRow,
      onLinkSelection,
      onOpenRow,
    ],
  );

  return { onKeyDown };
}
