import React from 'react';

export const useMenuClickHandler = (
  handleOutsideClick: (event: MouseEvent) => void,
  menuButtonRef:
    | React.RefObject<HTMLButtonElement | null>
    | React.RefObject<HTMLLIElement | null>
    | React.RefObject<HTMLDivElement | null>,
) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        menuButtonRef?.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        handleOutsideClick(event);
      }
    };
    document.addEventListener('mousedown', clickHandler, true);
    return () => {
      document.removeEventListener('mousedown', clickHandler, true);
    };
  }, [ref, handleOutsideClick, menuButtonRef]);

  return ref;
};
