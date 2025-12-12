import { useModal } from '@/hooks/useModal';
import { Button, ConfirmDialog, Spinner } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

const isPromise = (func: (() => Promise<void>) | (() => void)) => {
  return func.constructor.name === 'AsyncFunction' || func instanceof Promise;
};

type ConfirmDialogProps = React.ComponentProps<typeof ConfirmDialog>;
type MaybePromise<T> = T | Promise<T>;

export type ConfirmDialogWrapperProps = Omit<ConfirmDialogProps, 'children'> & {
  /** Closes parent modals on confirmation */
  closeParentModal?: boolean;
  /** Content component for the ConfirmationDialog */
  content?: React.ReactNode | (() => React.ReactNode);
  /** onConfirm handler. If it's a promise/async function, it will be awaited and a loading spinner will be shown in the confirm button */
  onConfirm?: () => MaybePromise<void>;
  /** Whether to hide the secondary (cancel) button */
  hideSecondaryButton?: boolean;
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
  variant = 'destructive',
  hideSecondaryButton,
  closeParentModal,
  onConfirm,
  footer,
  content,
}: ConfirmDialogWrapperProps) => {
  const { closeActiveModal, closeAllModals } = useModal();
  const { t } = useTranslation();
  const defaultCancelText = t('cancel');
  const defaultConfirmText = title as string;
  const [loading, setLoading] = React.useState(false);
  // eslint-disable-next-line react/no-unstable-nested-components
  const DefaultFooter = (hideDialog: () => void) => (
    <>
      {!hideSecondaryButton && (
        <Button
          label={cancelText ?? defaultCancelText}
          onClick={() => {
            if (loading) {
              return;
            }
            hideDialog();
            closeActiveModal();
          }}
        />
      )}
      <Button
        label={confirmText ?? defaultConfirmText}
        iconSide="right"
        icon={loading ? <Spinner size={24} color="white" /> : undefined}
        onClick={async () => {
          if (loading) {
            return;
          }

          if (onConfirm) {
            if (isPromise(onConfirm)) {
              const fn = onConfirm as () => Promise<void>;
              setLoading(true);
              await fn();
            } else {
              onConfirm();
            }
          }

          setLoading(false);
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

  return (
    <ConfirmDialog
      title={title}
      description={description}
      content={typeof content === 'function' ? content() : content}
      footer={footer ?? DefaultFooter}
    >
      {ShowDialogWrapper}
    </ConfirmDialog>
  );
};
