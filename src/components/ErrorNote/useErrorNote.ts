import React from 'react';
import { ErrorNoteContext } from './ErrorNoteContext';

export const useErrorNote = () => {
  const context = React.useContext(ErrorNoteContext);
  if (context === undefined) {
    throw new Error('useErrorNote must be used within an ErrorNoteProvider');
  }
  return context;
};
