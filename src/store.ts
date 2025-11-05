import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here
import counterReducer from './slices/counterSlice';
import toastReducer from './slices/toastSlice';
import syncStatusReducer from './slices/syncStatusSlice';
import integrationsReducer from './slices/integrationsSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    toast: toastReducer,
    syncStatus: syncStatusReducer,
    integrations: integrationsReducer,
    // add more reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
