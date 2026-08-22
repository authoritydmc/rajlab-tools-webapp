import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SupportChaiModal from './components/common/SupportChaiModal';

const ChaiModalContext = createContext({
  isOpen: false,
  downloadLabel: '',
  openChaiModal: () => {},
  closeChaiModal: () => {},
});

export const CHAI_MODAL_EVENT = 'rajlab:trigger-chai-modal';

/**
 * Standalone helper to trigger the chai support modal from anywhere in the app
 * (e.g. within download callbacks or click handlers).
 */
export function triggerChaiModal(downloadLabel = '') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(CHAI_MODAL_EVENT, {
        detail: { downloadLabel },
      })
    );
  }
}

export function ChaiModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadLabel, setDownloadLabel] = useState('');

  const openChaiModal = useCallback((label = '') => {
    setDownloadLabel(label);
    setIsOpen(true);
  }, []);

  const closeChaiModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for custom trigger events from anywhere in the DOM / app
  useEffect(() => {
    const handleTriggerEvent = (e) => {
      const label = e?.detail?.downloadLabel || '';
      openChaiModal(label);
    };

    window.addEventListener(CHAI_MODAL_EVENT, handleTriggerEvent);
    return () => window.removeEventListener(CHAI_MODAL_EVENT, handleTriggerEvent);
  }, [openChaiModal]);

  return (
    <ChaiModalContext.Provider
      value={{
        isOpen,
        downloadLabel,
        openChaiModal,
        closeChaiModal,
      }}
    >
      {children}
      <SupportChaiModal
        isOpen={isOpen}
        onClose={closeChaiModal}
        downloadLabel={downloadLabel}
      />
    </ChaiModalContext.Provider>
  );
}

export function useChaiModal() {
  return useContext(ChaiModalContext);
}
