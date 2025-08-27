import type { NoteStackNote } from '@jod/design-system';
import { create } from 'zustand';

export interface NoteData {
  title: string;
  description: string;
  variant: NoteStackNote['variant'];
  permanent?: boolean;
}

interface NoteStoreState {
  note: NoteData | null;
  setNote: (data: NoteData) => void;
  clearNote: () => void;
  getNote: () => NoteData | null;
}

/**
 * The purpose of this store is to allow sending error note data to the
 * "useErrorStack" hook from places where hooks are not allowed, for example
 * openapi-fetch middleware.
 */
export const useNoteStore = create<NoteStoreState>()((set, get) => ({
  note: null,
  setNote: (note) => set({ note }),
  clearNote: () => set({ note: null }),
  getNote: () => get().note,
}));
