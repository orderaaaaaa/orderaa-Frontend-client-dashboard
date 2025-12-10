import { useState, useCallback } from 'react';

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
  | 'shipping'
  | 'packagingNotes'
  | 'confirmAction'
  | 'whatsappFollowup';

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

  // Create memoized functions for each modal
  const modalStates = {} as ModalStates;

  modalNames.forEach((modalName) => {
    // Check if modal is open
    const isOpen = openModals.has(modalName);

    // Open modal function
    const open = useCallback(() => {
      setOpenModals((prev) => new Set(prev).add(modalName));
    }, [modalName]);

    // Close modal function
    const close = useCallback(() => {
      setOpenModals((prev) => {
        const newSet = new Set(prev);
        newSet.delete(modalName);
        return newSet;
      });
    }, [modalName]);

    modalStates[modalName] = {
      isOpen,
      open,
      close,
    };
  });

  return modalStates;
}
