import React from 'react';

export const ActionBarContext = React.createContext<HTMLDivElement | null>(null);

export const useActionBar = () => {
  const actionBar = React.useContext(ActionBarContext);
  const [state, setState] = React.useState<Element | null>(null);

  React.useEffect(() => {
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
