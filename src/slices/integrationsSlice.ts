import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Integration {
  id: number;
  name: string;
  display_name: string;
  is_connected: boolean;
  icon_url: string;
  sync_status: string;
}

interface IntegrationsState {
  integrations: Integration[];
}

const initialState: IntegrationsState = {
  integrations: [],
};

const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    setIntegrations(state, action: PayloadAction<Integration[]>) {
      state.integrations = action.payload;
    },
  },
});

export const { setIntegrations } = integrationsSlice.actions;
export default integrationsSlice.reducer;
