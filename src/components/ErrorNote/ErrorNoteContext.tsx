import React from 'react';

export interface ErrorNoteData {
  title: string;
  description: string;
}

export interface ErrorNoteContextProps {
  error: ErrorNoteData | null;
  setErrorNote: (message: ErrorNoteData) => void;
  clearErrorNote: () => void;
}

export const ErrorNoteContext = React.createContext<ErrorNoteContextProps | undefined>(undefined);
