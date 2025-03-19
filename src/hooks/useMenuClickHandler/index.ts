import React from 'react';

export const useMenuClickHandler = (
  handleOutsideClick: (event: MouseEvent | KeyboardEvent) => void,
  menuButtonRef:
    | React.RefObject<HTMLButtonElement | null>
    | React.RefObject<HTMLLIElement | null>
    | React.RefObject<HTMLDivElement | null>,
) => {
  const ref = React.useRef<HTMLDivElement>(null);

  /**
   * Used to check if the click event target is part of Design System confirmation dialog.
   * The purpose is to prevent the menu from closing when clicking on a confirmation dialog.
   * @param element HTML element
   * @returns True if the element is part of a headlessui dialog, false otherwise
   */
  const isPartOfConfirmationDialog = React.useCallback((element: HTMLElement) => {
    if (element.id.includes('ds-confirm-dialog-panel')) {
      return true;
    } else if (element.parentElement) {
      return isPartOfConfirmationDialog(element.parentElement);
    } else {
      return false;
    }
  }, []);

  React.useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        menuButtonRef?.current &&
        !menuButtonRef.current.contains(event.target as Node) &&
        !isPartOfConfirmationDialog(event.target as HTMLElement)
      ) {
        handleOutsideClick(event);
      }
    };
    document.addEventListener('mousedown', clickHandler, true);
    return () => {
      document.removeEventListener('mousedown', clickHandler, true);
    };
  }, [ref, handleOutsideClick, menuButtonRef, isPartOfConfirmationDialog]);

  React.useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOutsideClick(event);
      }
    };
    document.addEventListener('keydown', escHandler, true);
    return () => {
      document.removeEventListener('keydown', escHandler, true);
    };
  }, [handleOutsideClick]);

  return ref;
};
