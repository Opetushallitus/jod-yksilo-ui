import { ConfirmDialogWrapperProps } from '@/components';
import { type AnimationMode } from '@jod/design-system';
import React from 'react';

export interface ModalComponentProps {
  onClose: (...args: unknown[]) => void;
  open: boolean;
  shouldRenderBackdrop?: boolean;
  animationMode?: AnimationMode;
}

export type ModalComponentType<P = ModalComponentProps> = React.ComponentType<P>;

export interface ModalContextType {
  /** Puts a DS modal at the top of the modal stack. Only topmost modal is visible. */
  showModal: <P extends ModalComponentProps>(modal: ModalComponentType<P>, props?: Omit<Partial<P>, 'isOpen'>) => void;
  /** Puts a DS confirm dialog at the top of the modal stack. Only topmost modal is visible. */
  showDialog: (props: ConfirmDialogWrapperProps) => void;
  /** Closes the topmost modal in the stack. */
  closeActiveModal: () => void;
  /** Closes all modals in the stack. */
  closeAllModals: () => void;
}
