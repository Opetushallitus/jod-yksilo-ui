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

  const memoizedValue = React.useMemo(() => ({ error, setErrorNote, clearErrorNote }), [error]);

  return <ErrorNoteContext.Provider value={memoizedValue}>{children}</ErrorNoteContext.Provider>;
};
