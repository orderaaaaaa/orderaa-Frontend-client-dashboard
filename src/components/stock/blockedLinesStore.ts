import { create } from 'zustand';

interface BlockedLinesState {
  keys: Record<string, true>;
  setBlocked: (key: string, blocked: boolean) => void;
}

export const useBlockedLinesStore = create<BlockedLinesState>()((set) => ({
  keys: {},
  setBlocked: (key, blocked) =>
    set((state) => {
      if (blocked === (state.keys[key] === true)) return state;
      const keys = { ...state.keys };
      if (blocked) keys[key] = true;
      else delete keys[key];
      return { keys };
    }),
}));

export function useAnyBlockedLine(prefix: string): boolean {
  return useBlockedLinesStore((state) =>
    Object.keys(state.keys).some((key) => key.startsWith(prefix)),
  );
}
