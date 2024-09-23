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
