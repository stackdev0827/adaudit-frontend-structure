import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SyncStatusState {
  [integrationName: string]: {
    status: 'idle' | 'in_progress' | 'success' | 'error' | 'never_synced';
    message?: string;
    lastSyncedAt?: string;
  };
}

const initialState: SyncStatusState = {};

const syncStatusSlice = createSlice({
  name: 'syncStatus',
  initialState,
  reducers: {
    setSyncStatus: (
      state,
      action: PayloadAction<{
        integration: string;
        status: SyncStatusState[string]['status'];
        message?: string;
        lastSyncedAt?: string;
      }>
    ) => {
      const { integration, status, message, lastSyncedAt } = action.payload;
      state[integration] = { status, message, lastSyncedAt };
    },
    resetSyncStatus: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { setSyncStatus, resetSyncStatus } = syncStatusSlice.actions;
export default syncStatusSlice.reducer;
