import errorNoteReducer from '@/features/errorNote/errorNoteSlice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import sessionStorage from 'redux-persist/lib/storage/session';
import csrfReducer from './csrf/csrfSlice';

const persistConfig = {
  key: 'root',
  storage,
};
const csrfPersistConfig = {
  key: 'csrf',
  storage: sessionStorage,
};

const rootReducer = combineReducers({
  errorNote: errorNoteReducer,
  csrf: persistReducer(csrfPersistConfig, csrfReducer),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: {
    root: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
