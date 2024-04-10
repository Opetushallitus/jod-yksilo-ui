import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ErrorNoteState {
  title?: string;
  description?: string;
}

const initialState: ErrorNoteState = {
  title: undefined,
  description: undefined,
};

export const errorNoteSlice = createSlice({
  name: 'errorNote',
  initialState,
  reducers: {
    setErrorNote: (state, action: PayloadAction<ErrorNoteState>) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
    },
    clearErrorNote: (state) => {
      state.title = undefined;
      state.description = undefined;
    },
  },
});

export const { setErrorNote, clearErrorNote } = errorNoteSlice.actions;
export default errorNoteSlice.reducer;
