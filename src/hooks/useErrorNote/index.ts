import React from 'react';

export interface ErrorNoteData {
  title: string;
  description: string;
}

interface ErrorNoteContextProps {
  error: ErrorNoteData | null;
  setErrorNote: (message: ErrorNoteData) => void;
  clearErrorNote: () => void;
}

export const ErrorNoteContext = React.createContext<ErrorNoteContextProps | undefined>(undefined);

export const useErrorNote = () => {
  const context = React.useContext(ErrorNoteContext);
  if (context === undefined) {
    throw new Error('useErrorNote must be used within an ErrorNoteProvider');
  }
  return context;
};
