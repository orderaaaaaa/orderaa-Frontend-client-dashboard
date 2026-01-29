import { useState, useCallback } from 'react';

export type SummaryModalType =
  | 'active'
  | 'stopped'
  | 'followUp'
  | 'incomplete'
  | 'cancelled'
  | null;

const CARD_KEY_TO_MODAL: Record<string, SummaryModalType> = {
  activeNow: 'active',
  stoppedNow: 'stopped',
  followUp: 'followUp',
  incomplete: 'incomplete',
  cancelled: 'cancelled',
};

export function useSummaryModal() {
  const [modalType, setModalType] = useState<SummaryModalType>(null);

  const openModal = useCallback((cardKey: string) => {
    const modal = CARD_KEY_TO_MODAL[cardKey];
    if (modal) {
      setModalType(modal);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
  }, []);

  const isOpen = modalType !== null;

  return {
    modalType,
    isOpen,
    openModal,
    closeModal,
  };
}
