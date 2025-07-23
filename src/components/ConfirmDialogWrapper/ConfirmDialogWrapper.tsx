import { useModal } from '@/hooks/useModal';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';

const isPromise = (value: unknown): value is Promise<void> => {
  return !!value && typeof (value as Promise<void>).then === 'function';
};

type ConfirmDialogProps = React.ComponentProps<typeof ConfirmDialog>;
type FooterProps = Pick<
  ConfirmDialogWrapperProps,
  'variant' | 'closeParentModal' | 'cancelText' | 'confirmText' | 'onConfirm'
> & {
  closeActiveModal: () => void;
  closeAllModals: () => void;
};

const getDefaultFooter = ({
  cancelText,
  closeActiveModal,
  closeAllModals,
  closeParentModal,
  confirmText,
  onConfirm,
  variant,
}: FooterProps) => {
  const FooterContent = (hideDialog: () => void) => {
    return (
      <>
        <Button
          label={cancelText ?? ''}
          onClick={() => {
            hideDialog();
            closeActiveModal();
          }}
        />
        <Button
          label={confirmText ?? ''}
          onClick={async () => {
            if (onConfirm) {
              const result = onConfirm();

              if (isPromise(result)) {
                await result;
              }
            }
            hideDialog();
            // There aren't any places in the UI where there's more than 2 modals open at the same time,
            // so we can safely close all modals when closeParentModal is true.
            // Most likely scenario for closing all modals is when the user deletes an entity from it's edit modal.
            if (closeParentModal) {
              closeAllModals();
            } else {
              closeActiveModal();
            }
          }}
          variant={variant === 'destructive' ? 'red-delete' : 'accent'}
          serviceVariant="yksilo"
        />
      </>
    );
  };
  return FooterContent;
};

export type ConfirmDialogWrapperProps = Omit<ConfirmDialogProps, 'children'> & {
  /** Closes parent modals on confirmation */
  closeParentModal?: boolean;
  /** Content component for the ConfirmationDialog */
  content?: React.ReactNode | (() => React.ReactNode);
  /** onConfirm handler */
  onConfirm?: () => void | Promise<void>;
};

/**
 * An internal component to use as the "children" prop of the DS ConfirmDialog.
 * It will just call the "showDialog" function passed to it when the component mounts.
 */
const ShowDialogWrapper = (showDialog: () => void) => {
  React.useEffect(() => {
    showDialog();
    // Ensure that this effect runs only once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
};

/**
 * A wrapper around the DS ConfirmDialog that allows it to be used with the "useModal" hook.
 */
export const ConfirmDialogWrapper = ({
  title,
  description,
  cancelText,
  confirmText,
  variant,
  closeParentModal,
  onConfirm,
  footer,
  content,
}: ConfirmDialogWrapperProps) => {
  const { closeActiveModal, closeAllModals } = useModal();

  return (
    <ConfirmDialog
      title={title}
      description={description}
      content={typeof content === 'function' ? content() : content}
      footer={
        footer ??
        getDefaultFooter({
          cancelText,
          closeActiveModal,
          closeAllModals,
          closeParentModal,
          confirmText,
          onConfirm,
          variant,
        })
      }
    >
      {ShowDialogWrapper}
    </ConfirmDialog>
  );
};
