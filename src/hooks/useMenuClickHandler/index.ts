import React from 'react';

export const useMenuClickHandler = (
  handleOutsideClick: (event: MouseEvent) => void,
  menuButtonRef:
    | React.RefObject<HTMLButtonElement | null>
    | React.RefObject<HTMLLIElement | null>
    | React.RefObject<HTMLDivElement | null>,
) => {
  const ref = React.useRef<HTMLDivElement>(null);

  /**
   * Used to check if the click event target is part of a headless UI dialog.
   * The purpose is to prevent the menu from closing when clicking on a confirmation dialog.
   * @param element HTML element
   * @returns True if the element is part of a headlessui dialog, false otherwise
   */
  const isPartOfHeadlessUIDialog = React.useCallback((element: HTMLElement) => {
    if (element.id.includes('headlessui-dialog')) {
      return true;
    } else if (element.parentElement) {
      return isPartOfHeadlessUIDialog(element.parentElement);
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
        !isPartOfHeadlessUIDialog(event.target as HTMLElement)
      ) {
        handleOutsideClick(event);
      }
    };
    document.addEventListener('mousedown', clickHandler, true);
    return () => {
      document.removeEventListener('mousedown', clickHandler, true);
    };
  }, [ref, handleOutsideClick, menuButtonRef, isPartOfHeadlessUIDialog]);

  return ref;
};
