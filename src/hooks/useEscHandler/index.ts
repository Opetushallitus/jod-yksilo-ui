import React from 'react';

export const useEscHandler = (onEscKeyDown: () => void, parentElementId: string) => {
  React.useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;

        // If active element is headless UI dialog, then it can be closed. Basically same if the focus would be in body-tag.
        if (activeElement.id.includes('ds-modal')) {
          onEscKeyDown();
          return;
        }

        const parentElement = document.getElementById(parentElementId);

        if (parentElement) {
          if (parentElement.contains(activeElement)) {
            // If the active element is a child of the specified parent element, do nothing
            return;
          } else if (activeElement.tagName === 'BODY') {
            onEscKeyDown();
          }
        }
      }
    };

    document.addEventListener('keydown', escHandler, true);

    return () => {
      document.removeEventListener('keydown', escHandler, true);
    };
  }, [onEscKeyDown, parentElementId]);
};
