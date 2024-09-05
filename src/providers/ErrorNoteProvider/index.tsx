import { ErrorNoteContext, ErrorNoteData } from '@/hooks/useErrorNote';
import React from 'react';

export const ErrorNoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = React.useState<ErrorNoteData | null>(null);

  const setErrorNote = (message: ErrorNoteData) => {
    setError(message);
  };

  const clearErrorNote = () => {
    setError(null);
  };

  return (
    <ErrorNoteContext.Provider value={{ error, setErrorNote, clearErrorNote }}>{children}</ErrorNoteContext.Provider>
  );
};
