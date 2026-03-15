import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SelectedVariant } from '@/app/dashboard/inventory/receipts/[receiptId]/types';

interface ReceiptStepState {
  currentStep: number;
  productVariants: Record<number, SelectedVariant[]>;
  printedIds: string[];
  confirmedCounts: Record<string, number>;
  rejectedCounts: Record<string, number>;
}

interface ReceiptStore {
  receipts: Record<string, ReceiptStepState>;

  getReceiptState: (receiptId: string) => ReceiptStepState;

  setCurrentStep: (receiptId: string, step: number) => void;
  setProductVariants: (receiptId: string, variants: Record<number, SelectedVariant[]>) => void;
  addPrintedId: (receiptId: string, id: string) => void;
  setConfirmedCounts: (receiptId: string, counts: Record<string, number>) => void;
  setRejectedCounts: (receiptId: string, counts: Record<string, number>) => void;

  clearReceipt: (receiptId: string) => void;
}

const DEFAULT_STATE: ReceiptStepState = {
  currentStep: 0,
  productVariants: {},
  printedIds: [],
  confirmedCounts: {},
  rejectedCounts: {},
};

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    (set, get) => ({
      receipts: {},

      getReceiptState: (receiptId: string) => {
        return get().receipts[receiptId] ?? DEFAULT_STATE;
      },

      setCurrentStep: (receiptId, step) =>
        set((state) => ({
          receipts: {
            ...state.receipts,
            [receiptId]: {
              ...(state.receipts[receiptId] ?? DEFAULT_STATE),
              currentStep: step,
            },
          },
        })),

      setProductVariants: (receiptId, variants) =>
        set((state) => ({
          receipts: {
            ...state.receipts,
            [receiptId]: {
              ...(state.receipts[receiptId] ?? DEFAULT_STATE),
              productVariants: variants,
            },
          },
        })),

      addPrintedId: (receiptId, id) =>
        set((state) => {
          const current = state.receipts[receiptId] ?? DEFAULT_STATE;
          if (current.printedIds.includes(id)) return state;
          return {
            receipts: {
              ...state.receipts,
              [receiptId]: {
                ...current,
                printedIds: [...current.printedIds, id],
              },
            },
          };
        }),

      setConfirmedCounts: (receiptId, counts) =>
        set((state) => ({
          receipts: {
            ...state.receipts,
            [receiptId]: {
              ...(state.receipts[receiptId] ?? DEFAULT_STATE),
              confirmedCounts: counts,
            },
          },
        })),

      setRejectedCounts: (receiptId, counts) =>
        set((state) => ({
          receipts: {
            ...state.receipts,
            [receiptId]: {
              ...(state.receipts[receiptId] ?? DEFAULT_STATE),
              rejectedCounts: counts,
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
    }
  )
);
