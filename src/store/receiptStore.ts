import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SelectedVariant } from '@/app/dashboard/inventory/receipts/[receiptId]/types';

interface ReceiptStepState {
  currentStep: number;
  completedSteps: number[];
  productVariants: Record<number, SelectedVariant[]>;
  printedIds: string[];
  confirmedCounts: Record<string, number>;
  rejectedCounts: Record<string, number>;
}

interface ReceiptStore {
  receipts: Record<string, ReceiptStepState>;

  getReceiptState: (receiptId: string) => ReceiptStepState;

  setCurrentStep: (receiptId: string, step: number) => void;
  markStepCompleted: (receiptId: string, step: number) => void;
  setProductVariants: (receiptId: string, variants: Record<number, SelectedVariant[]>) => void;
  addPrintedId: (receiptId: string, id: string) => void;
  setConfirmedCounts: (receiptId: string, counts: Record<string, number>) => void;
  setRejectedCounts: (receiptId: string, counts: Record<string, number>) => void;

  clearReceipt: (receiptId: string) => void;
}

const DEFAULT_STATE: ReceiptStepState = {
  currentStep: 0,
  completedSteps: [],
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

      markStepCompleted: (receiptId, step) =>
        set((state) => {
          const current = state.receipts[receiptId] ?? DEFAULT_STATE;
          if (current.completedSteps.includes(step)) return state;
          return {
            receipts: {
              ...state.receipts,
              [receiptId]: {
                ...current,
                completedSteps: [...current.completedSteps, step],
              },
            },
          };
        }),

      setProductVariants: (receiptId, variants) =>
        set((state) => {
          const current = state.receipts[receiptId] ?? DEFAULT_STATE;
          const hasData = Object.values(variants).some((v) => v.length > 0);
          const completed = hasData && !current.completedSteps.includes(0)
            ? [...current.completedSteps, 0]
            : current.completedSteps;
          return {
            receipts: {
              ...state.receipts,
              [receiptId]: { ...current, productVariants: variants, completedSteps: completed },
            },
          };
        }),

      addPrintedId: (receiptId, id) =>
        set((state) => {
          const current = state.receipts[receiptId] ?? DEFAULT_STATE;
          if (current.printedIds.includes(id)) return state;
          const completed = !current.completedSteps.includes(1)
            ? [...current.completedSteps, 1]
            : current.completedSteps;
          return {
            receipts: {
              ...state.receipts,
              [receiptId]: {
                ...current,
                printedIds: [...current.printedIds, id],
                completedSteps: completed,
              },
            },
          };
        }),

      setConfirmedCounts: (receiptId, counts) =>
        set((state) => {
          const current = state.receipts[receiptId] ?? DEFAULT_STATE;
          const hasData = Object.values(counts).some((v) => v > 0);
          const completed = hasData && !current.completedSteps.includes(2)
            ? [...current.completedSteps, 2]
            : current.completedSteps;
          return {
            receipts: {
              ...state.receipts,
              [receiptId]: { ...current, confirmedCounts: counts, completedSteps: completed },
            },
          };
        }),

      setRejectedCounts: (receiptId, counts) =>
        set((state) => {
          const current = state.receipts[receiptId] ?? DEFAULT_STATE;
          const hasData = Object.values(counts).some((v) => v > 0);
          const completed = hasData && !current.completedSteps.includes(3)
            ? [...current.completedSteps, 3]
            : current.completedSteps;
          return {
            receipts: {
              ...state.receipts,
              [receiptId]: { ...current, rejectedCounts: counts, completedSteps: completed },
            },
          };
        }),

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
