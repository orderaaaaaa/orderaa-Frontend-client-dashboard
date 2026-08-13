import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SelectedVariant } from '@/app/dashboard/inventory/receipts/[receiptId]/types';

/**
 * The receipt flow is a single step (variant quantities) since the mock
 * barcode steps were removed — only the in-progress variant selections
 * survive a page refresh.
 */
interface ReceiptState {
  productVariants: Record<number, SelectedVariant[]>;
}

interface ReceiptStore {
  receipts: Record<string, ReceiptState>;

  getReceiptState: (receiptId: string) => ReceiptState;
  setProductVariants: (
    receiptId: string,
    variants: Record<number, SelectedVariant[]>
  ) => void;
  clearReceipt: (receiptId: string) => void;
}

const DEFAULT_STATE: ReceiptState = {
  productVariants: {},
};

function getReceipt(
  receipts: Record<string, ReceiptState>,
  receiptId: string
): ReceiptState {
  const stored = receipts[receiptId];
  if (!stored || stored.productVariants === undefined) {
    // Persisted entries from the old multi-step shape merge safely.
    return { ...DEFAULT_STATE, ...stored };
  }
  return stored;
}

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    (set, get) => ({
      receipts: {},

      getReceiptState: (receiptId: string) => {
        return getReceipt(get().receipts, receiptId);
      },

      setProductVariants: (receiptId, variants) =>
        set((state) => ({
          receipts: {
            ...state.receipts,
            [receiptId]: {
              ...getReceipt(state.receipts, receiptId),
              productVariants: variants,
            },
          },
        })),

      clearReceipt: (receiptId) =>
        set((state) => {
          const { [receiptId]: _, ...rest } = state.receipts;
          return { receipts: rest };
        }),
    }),
    {
      name: 'receipt-storage',
      version: 1,
      // v0 entries carried multi-step state (currentStep, printedIds, …);
      // strip everything but the variant selections.
      migrate: (persisted) => {
        const state = persisted as { receipts?: Record<string, ReceiptState> };
        const receipts: Record<string, ReceiptState> = {};
        Object.entries(state?.receipts ?? {}).forEach(([id, entry]) => {
          receipts[id] = { productVariants: entry?.productVariants ?? {} };
        });
        return { receipts };
      },
    }
  )
);
