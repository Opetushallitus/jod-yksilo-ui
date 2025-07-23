import { ConfirmDialogWrapper, type ConfirmDialogWrapperProps } from '@/components';
import React from 'react';
import { ModalContext } from './ModalContext';
import type { ModalComponentType, ModalStackItem } from './utils';

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modals, setModals] = React.useState<ModalStackItem<any>[]>([]);

  const showModal = React.useCallback(
    <P extends object>(Component: ModalComponentType<P>, props?: Omit<Partial<P>, 'isOpen'>) => {
      setModals((prev) => {
        const last = prev[prev.length - 1];
        // Prevent duplicate: compare Component and shallow props
        const isDuplicate =
          last && last.Component === Component && JSON.stringify(last.props) === JSON.stringify(props);
        if (isDuplicate) {
          return prev;
        }
        return [
          ...prev,
          {
            Component,
            props,
          },
        ];
      });
    },
    [],
  );

  const closeActiveModal = React.useCallback(() => {
    if (modals.length === 0) {
      return;
    }
    setModals((prev) => prev.slice(0, -1));
  }, [modals]);

  const closeAllModals = React.useCallback(() => {
    setModals([]);
  }, []);

  const showDialog = React.useCallback(
    (props: ConfirmDialogWrapperProps) => {
      showModal(ConfirmDialogWrapper, props);
    },
    [showModal],
  );

  const memoizedContextValue = React.useMemo(
    () => ({
      showModal,
      closeActiveModal,
      closeAllModals,
      showDialog,
    }),
    [showModal, closeActiveModal, closeAllModals, showDialog],
  );

  return (
    <ModalContext.Provider value={memoizedContextValue}>
      {children}
      {modals.map((modal, idx) => {
        const ModalComponent = modal.Component;
        // Only the top modal is open/interactable
        const isActive = idx === modals.length - 1;
        const handleClose = () => {
          modal.props?.onClose?.();
          closeActiveModal();
        };
        return (
          <ModalComponent
            key={modal.Component.displayName ?? `${idx}`}
            {...modal.props}
            isOpen={isActive}
            onClose={handleClose}
            style={{ zIndex: 1000 + idx }}
          />
        );
      })}
    </ModalContext.Provider>
  );
};
