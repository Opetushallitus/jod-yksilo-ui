import { create } from 'zustand';

export interface ErrorNoteData {
  title: string;
  description: string;
}

interface ErrorState {
  error: ErrorNoteData | null;

  setErrorNote: (message: ErrorNoteData) => void;
  clearErrorNote: () => void;
  getErrorNote: () => ErrorNoteData | null;
}

export const useErrorNoteStore = create<ErrorState>()((set, get) => ({
  error: null,
  setErrorNote: (state) => set({ error: state }),
  clearErrorNote: () => set({ error: null }),
  getErrorNote: () => {
    const { error } = get();
    return error;
  },
}));
