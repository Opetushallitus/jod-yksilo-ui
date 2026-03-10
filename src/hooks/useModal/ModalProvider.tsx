import { ConfirmDialogWrapper, type ConfirmDialogWrapperProps } from '@/components';
import { type AnimationMode } from '@jod/design-system';
import React from 'react';
import { ModalContext } from './ModalContext';
import type { ModalComponentType } from './utils';

// Delay before removing closed modal from stack (allows animation to complete)
const MODAL_REMOVAL_DELAY_MS = 500;

// Helper to generate unique IDs
const generateModalId = (() => {
  let counter = 0;
  return () => `modal_${++counter}_${Date.now()}`;
})();

interface ModalStackInternal<T> {
  id: string;
  Component: ModalComponentType<T>;
  props: T;
  isOpen: boolean;
  animationMode: AnimationMode;
  shouldRenderBackdrop: boolean;
}

// Calculate animation mode based on modal position in stack
const getAnimationMode = (index: number, openModals: ModalStackInternal<unknown>[]): AnimationMode => {
  if (openModals.length === 1) return 'single';
  const isTop = index === openModals.length - 1;
  return isTop ? 'stacked-foreground' : 'stacked-background';
};

const updateModalModes = (updated: ModalStackInternal<unknown>[]) => {
  const stillOpen = updated.filter((m) => m.isOpen);
  return updated.map((m) => {
    if (!m.isOpen) return m;

    const currentOpenIndex = stillOpen.findIndex((om) => om.id === m.id);
    return {
      ...m,
      animationMode: getAnimationMode(currentOpenIndex, stillOpen),
      shouldRenderBackdrop: currentOpenIndex === 0,
    };
  });
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modals, setModals] = React.useState<ModalStackInternal<any>[]>([]);
  const timeoutIdsRef = React.useRef<Set<NodeJS.Timeout>>(new Set());

  const showModal = React.useCallback(
    <P extends object>(Component: ModalComponentType<P>, props?: Omit<Partial<P>, 'isOpen'>) => {
      setModals((prev) => {
        const openModals = prev.filter((m) => m.isOpen);

        // Prevent adding duplicate modal if the top modal is the same component with the same props
        const lastOpen = openModals.at(-1);
        if (lastOpen?.Component === Component && JSON.stringify(lastOpen.props) === JSON.stringify(props)) {
          return prev;
        }

        // Update existing open modals to stacked-background mode
        const updatedModals = prev.map((m) =>
          m.isOpen ? { ...m, animationMode: 'stacked-background' as AnimationMode } : m,
        );

        // Add new modal
        return [
          ...updatedModals,
          {
            id: generateModalId(),
            Component,
            props,
            isOpen: true,
            animationMode: openModals.length === 0 ? 'single' : ('stacked-foreground' as AnimationMode),
            shouldRenderBackdrop: openModals.length === 0,
          },
        ];
      });
    },
    [],
  );

  const removeModalFromStack = React.useCallback((modalId: string) => {
    setModals((current) => current.filter((m) => m.id !== modalId));
  }, []);

  const closeActiveModal = React.useCallback(() => {
    setModals((prev) => {
      const openModals = prev.filter((m) => m.isOpen);
      if (openModals.length === 0) return prev;

      const lastOpenModal = openModals.at(-1);
      if (!lastOpenModal) return prev;

      const modalIndex = prev.findIndex((m) => m.id === lastOpenModal.id);

      // Close the modal
      const updated = prev.map((m, idx) => {
        if (idx === modalIndex) {
          return { ...m, isOpen: false };
        }
        return m;
      });

      // Remove closed modal from stack after animation completes
      const timeoutId = setTimeout(() => {
        removeModalFromStack(lastOpenModal.id);
        timeoutIdsRef.current.delete(timeoutId);
      }, MODAL_REMOVAL_DELAY_MS);
      timeoutIdsRef.current.add(timeoutId);

      // Update animation modes for remaining open modals
      return updateModalModes(updated);
    });
  }, [removeModalFromStack]);

  const closeAllModals = React.useCallback(() => {
    setModals((prev) => {
      if (prev.length === 0) return prev;

      // Clear the entire stack after animations complete
      const timeoutId = setTimeout(() => {
        setModals([]);
        timeoutIdsRef.current.delete(timeoutId);
      }, MODAL_REMOVAL_DELAY_MS);
      timeoutIdsRef.current.add(timeoutId);

      return [
        ...prev.map((m) => ({ ...m, isOpen: false })), // Mark all as closing
      ];
    });
  }, []);

  // Cleanup all pending timeouts on unmount
  React.useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      timeoutIds.clear();
    };
  }, []);

  // Helper method to show confirm dialogs
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
        return (
          <ModalComponent
            key={modal.id}
            {...modal.props}
            open={modal.isOpen}
            animationMode={modal.animationMode}
            shouldRenderBackdrop={modal.shouldRenderBackdrop}
            onClose={(...args: unknown[]) => {
              try {
                modal.props?.onClose?.(...args);
              } finally {
                closeActiveModal();
              }
            }}
            style={{ zIndex: 1000 + idx }}
          />
        );
      })}
    </ModalContext.Provider>
  );
};
