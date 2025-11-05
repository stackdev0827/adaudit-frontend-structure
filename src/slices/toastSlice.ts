import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  triggerSSE?: boolean;
}

const initialState: ToastState = {
  open: false,
  message: '',
  type: 'info',
  triggerSSE: false,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type?: ToastState['type'] }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type || 'info';
    },
    hideToast: (state) => {
      state.open = false;
      state.message = '';
    },
    triggerSSE: (state, action: PayloadAction<boolean>) => {
      state.triggerSSE = action.payload;
    },
  },
});

export const { showToast, hideToast, triggerSSE } = toastSlice.actions;
export default toastSlice.reducer;
