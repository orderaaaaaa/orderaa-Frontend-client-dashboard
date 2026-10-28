import { useCallback, useRef, type KeyboardEvent } from 'react';

export function preventEntryGridEscape(event: Event) {
  if (event.target instanceof HTMLInputElement && event.target.hasAttribute('data-entry-grid')) {
    event.preventDefault();
  }
}

export function useEntryGrid(keys: string[]) {
  const inputs = useRef(new Map<string, HTMLInputElement>());

  const registerInput = useCallback(
    (key: string) => (node: HTMLInputElement | null) => {
      if (node) {
        inputs.current.set(key, node);
      } else {
        inputs.current.delete(key);
      }
    },
    []
  );

  const focusAt = (index: number) => {
    const key = keys[index];
    if (key !== undefined) inputs.current.get(key)?.focus();
  };

  const onInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    key: string,
    onEscape?: () => void
  ) => {
    const index = keys.indexOf(key);
    if (event.key === 'Enter' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusAt(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
    }
  };

  return { registerInput, onInputKeyDown };
}
