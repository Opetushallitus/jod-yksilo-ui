import React from 'react';

export const useInteractionMethod = () => {
  const [isMouseInteraction, setIsMouseInteraction] = React.useState(false);

  React.useEffect(() => {
    const handleMouseDown = () => setIsMouseInteraction(true);
    const handleKeyDown = () => setIsMouseInteraction(false);

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return isMouseInteraction;
};
