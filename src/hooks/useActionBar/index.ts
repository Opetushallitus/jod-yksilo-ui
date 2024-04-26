import { createContext, useContext, useEffect, useState } from 'react';

export const ActionBarContext = createContext<HTMLDivElement | null>(null);

export const useActionBar = () => {
  const actionBar = useContext(ActionBarContext);
  const [state, setState] = useState<Element | null>(null);

  useEffect(() => {
    // Create a new div element
    const element = document.createElement('div');
    element.className = 'sticky bottom-0 bg-bg-gray print:hidden';
    const parent = actionBar?.parentElement;
    // Insert the new element before the footer
    parent?.insertBefore(element, actionBar);
    setState(element);
    return () => {
      // Remove the element when the component is unmounted
      element.remove();
    };
  }, [actionBar]);

  return state;
};
