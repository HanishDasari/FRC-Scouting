'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal, { ModalType } from '../components/Modal';

interface ModalContextType {
  showModal: (options: {
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = useCallback((options: {
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }) => {
    setModal({ ...options, isOpen: true });
  }, []);

  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Global override for alert/confirm (optional but powerful)
  /*
  useEffect(() => {
    window.alert = (msg) => showModal({ type: 'info', title: 'Notification', message: msg });
    // window.confirm = ... (this is harder because it's synchronous)
  }, [showModal]);
  */

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      <Modal 
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={hideModal}
        onConfirm={modal.onConfirm}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
}
