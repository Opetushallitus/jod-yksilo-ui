import { clamp } from '@jod/design-system';
import React from 'react';

/**
 * A hook that provides functionality for keyboard navigation with arrow keys and updates tabindex accordingly.
 * @param items Array of items tied to the DOM elements
 */
export const useArrowKeyControls = <T extends HTMLElement = HTMLUListElement>(items: readonly unknown[]) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lastClickedIndex, setLastClickedIndex] = React.useState<number | null>(null);
  const ref = React.useRef<T | null>(null);

  /**
   * Tries to get elements for interactable tags (buttons) or presentational tags (divs) inside a DOM node.
   * @returns List of elements
   */
  const getTagElements = (source = ref.current) => {
    const elements = [];
    const buttons = (source?.querySelectorAll('button') ?? []) as HTMLButtonElement[];
    const divs = (source?.querySelectorAll(String.raw`div:not(.ds\:sr-only)`) ?? []) as HTMLDivElement[];

    if (buttons.length > 0) {
      elements.push(...buttons);
    } else if (divs.length > 0) {
      elements.push(...divs);
    }
    return elements;
  };

  const initRovingTabindex = () => {
    const elements = getTagElements();

    elements.forEach((el, index) => {
      el.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
    });
  };

  // Init roving tabindex on mount, run only once on mount.
  React.useEffect(() => {
    initRovingTabindex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrow key navigation. Focus is moved to the next/previous button and activeIndex is updated accordingly.
  const handleKeyDown = (event: React.KeyboardEvent<T>) => {
    if (items.length === 0) {
      return;
    }

    const elements = getTagElements(event.currentTarget);

    if (elements.length === 0) {
      return;
    }

    const currentIndex = elements.indexOf(document.activeElement as HTMLButtonElement | HTMLDivElement);
    let nextIndex = -1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % elements.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex === -1 ? elements.length - 1 : (currentIndex - 1 + elements.length) % elements.length;
        break;
      default:
        return;
    }

    if (nextIndex !== -1) {
      setActiveIndex(nextIndex);
      elements[nextIndex]?.focus();
    }
  };

  // When items length changes, make sure that activeIndex is within bounds.
  React.useEffect(() => {
    setActiveIndex(clamp(activeIndex, 0, items.length - 1));
  }, [items.length, activeIndex]);

  // When activeIndex changes, update the tabindex of all buttons. The active button gets tabindex="0" and others get "-1".
  React.useEffect(() => {
    const elements = getTagElements();
    elements.forEach((element, index) => {
      element.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
    });
  }, [activeIndex]);

  // When item is clicked (lastClickedIndex changes), set activeIndex to the previous index.
  React.useEffect(() => {
    if (lastClickedIndex !== null) {
      setTimeout(() => {
        const nextIndex = clamp(lastClickedIndex - 1, 0, items.length - 1);
        setActiveIndex(nextIndex);
        setLastClickedIndex(null);
        const elements = getTagElements();

        elements[nextIndex]?.setAttribute('tabindex', '0');
        elements[nextIndex]?.focus();
      });
    }
  }, [lastClickedIndex, items.length, activeIndex]);

  return {
    ref,
    handleKeyDown,
    activeIndex,
    setActiveIndex,
    setLastClickedIndex,
    initRovingTabindex,
  };
};
