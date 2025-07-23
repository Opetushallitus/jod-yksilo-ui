import React from 'react';

export const useEscHandler = (onEscKeyDown: () => void, parentElementId: string, triggerAlsoAtFocus?: boolean) => {
  React.useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;

        // If active element is headless UI dialog, then it can be closed. Basically same if the focus would be in body-tag.
        if (['ds-modal', 'ds-confirm'].some((prefix) => activeElement.id.includes(prefix))) {
          onEscKeyDown();
          return;
        }

        const parentElement = document.getElementById(parentElementId);
        if (!parentElement) {
          return;
        }
        if (parentElement.contains(activeElement)) {
          if (triggerAlsoAtFocus) {
            onEscKeyDown();
            return;
          }
          // If the active element is a child of the specified parent element, do nothing
          return;
        }
        if (activeElement.tagName === 'BODY') {
          onEscKeyDown();
        }
      }
    };

    document.addEventListener('keydown', escHandler, true);

    return () => {
      document.removeEventListener('keydown', escHandler, true);
    };
  }, [onEscKeyDown, parentElementId, triggerAlsoAtFocus]);
};
