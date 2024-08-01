import { components } from '@/api/schema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type CSRF = components['schemas']['CsrfTokenDto'];

type CsrfState = Partial<CSRF>;

const initialState: CsrfState = {
  token: undefined,
  parameterName: undefined,
  headerName: undefined,
};

const csrfSlice = createSlice({
  name: 'csrf',
  initialState,
  reducers: {
    setCsrfToken(state, action: PayloadAction<CSRF>) {
      state.token = action.payload.token;
      state.parameterName = action.payload.parameterName;
      state.headerName = action.payload.headerName;
    },
    clearCsrfToken(state) {
      state.token = undefined;
      state.parameterName = undefined;
      state.headerName = undefined;
    },
  },
});

export const { setCsrfToken, clearCsrfToken } = csrfSlice.actions;
export default csrfSlice.reducer;
