import {
  ConfirmDialogWrapper,
  ConfirmDialogWrapperProps,
} from '@/components/ConfirmDialogWrapper/ConfirmDialogWrapper';
import React from 'react';
import { ModalContext } from './ModalContext';
import type { ModalComponentType, ModalStackItem } from './types';

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modals, setModals] = React.useState<ModalStackItem<any>[]>([]);
  const [activeModal, setActiveModal] = React.useState<React.ReactNode | null>(null);

  const showModal = <P extends object>(
    Component: ModalComponentType<P>,
    props?: Omit<P, 'isOpen'>,
    onClose?: () => void,
  ) => {
    setModals((prev) => {
      const last = prev[prev.length - 1];
      // Prevent duplicate: compare Component and shallow props
      const isDuplicate = last && last.Component === Component && JSON.stringify(last.props) === JSON.stringify(props);
      if (isDuplicate) {
        return prev;
      }
      return [
        ...prev,
        {
          Component,
          props,
          onClose,
        } as ModalStackItem<P>,
      ];
    });
  };

  const closeActiveModal = React.useCallback(() => {
    if (modals.length === 0) {
      return;
    }
    const last = modals[modals.length - 1];
    last.onClose?.();
    setModals((prev) => prev.slice(0, -1));
  }, [modals]);

  const closeAllModals = () => {
    setModals([]);
  };

  const showDialog = (props: ConfirmDialogWrapperProps) => {
    showModal(ConfirmDialogWrapper, props);
  };

  React.useEffect(() => {
    const currentModal = modals[modals.length - 1] ?? null;
    const currentComponent = currentModal?.Component
      ? React.createElement(currentModal.Component, {
          ...currentModal.props,
          data: currentModal.props?.data,
          isOpen: true,
          onClose: () => {
            currentModal.props?.onClose?.();
            currentModal?.onClose?.();
            closeActiveModal();
          },
        })
      : null;
    if (currentComponent) {
      setActiveModal(currentComponent);
    } else {
      setActiveModal(null);
    }
  }, [closeActiveModal, modals]);

  return (
    <ModalContext.Provider value={{ showModal, closeActiveModal, closeAllModals, showDialog }}>
      {children}
      {activeModal}
    </ModalContext.Provider>
  );
};
