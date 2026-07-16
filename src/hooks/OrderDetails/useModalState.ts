import { useState, useMemo } from 'react';

/**
 * Type for modal names
 */
export type ModalName =
  | 'urgent'
  | 'cancel'
  | 'stopOperation'
  | 'postponeHours'
  | 'postponeDays'
  | 'addColorProduct'
  | 'rejectModification'
  | 'waitingPayment'
  | 'whatsapp'
  | 'shipping'
  | 'packagingNotes'
  | 'confirmAction'
  | 'partialDelivery'
  | 'exchange'
  | 'returnRefund'
  | 'postShippingCancel'
  | 'resend'
  | 'late'
  | 'changeProduct'
  | 'modifyProduct';

/**
 * Type for modal state object
 */
export type ModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

/**
 * Type for the return value of useModalState
 */
export type ModalStates = Record<ModalName, ModalState>;

/**
 * Custom hook to manage multiple modal states
 *
 * @param modalNames - Array of modal names to manage
 * @returns Object with modal states and controls
 *
 * @example
 * const modals = useModalState(['urgent', 'cancel', 'stopOperation']);
 * // Access: modals.urgent.isOpen, modals.urgent.open(), modals.urgent.close()
 */
export function useModalState(modalNames: ModalName[]): ModalStates {
  // Create a single state object for all modals
  const [openModals, setOpenModals] = useState<Set<ModalName>>(new Set());

  // Build modal state object, memoized by modalNames identity and openModals state
  const modalStates = useMemo(() => {
    const states = {} as ModalStates;

    modalNames.forEach((modalName) => {
      states[modalName] = {
        isOpen: openModals.has(modalName),
        open: () => setOpenModals((prev) => new Set(prev).add(modalName)),
        close: () =>
          setOpenModals((prev) => {
            const newSet = new Set(prev);
            newSet.delete(modalName);
            return newSet;
          }),
      };
    });

    return states;
  }, [modalNames, openModals]);

  return modalStates;
}
