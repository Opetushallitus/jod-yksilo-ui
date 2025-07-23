import { ConfirmDialogWrapperProps } from '@/components';
import React from 'react';

export interface ModalComponentProps {
  onClose: () => void;
  isOpen: boolean;
}

export type ModalComponentType<P = ModalComponentProps> = React.ComponentType<P>;

export interface ModalStackItem<P> {
  Component: ModalComponentType<P>;
  props: P;
}

export interface ModalContextType {
  /** Puts a DS modal at the top of the modal stack. Only topmost modal is visible. */
  showModal: <P extends object>(modal: ModalComponentType<P>, props?: Omit<Partial<P>, 'isOpen'>) => void;
  /** Puts a DS confirm dialog at the top of the modal stack. Only topmost modal is visible. */
  showDialog: (props: ConfirmDialogWrapperProps) => void;
  /** Closes the topmost modal in the stack. */
  closeActiveModal: () => void;
  /** Closes all modals in the stack. */
  closeAllModals: () => void;
}
