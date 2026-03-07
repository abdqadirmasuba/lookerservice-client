import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DashboardSummary } from '../../types';

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: DashboardState = {
  summary: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardSummary(state, action: PayloadAction<DashboardSummary>) {
      state.summary = action.payload;
      state.error = null;
      state.lastFetched = Date.now();
    },
    setDashboardLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setDashboardError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearDashboard(state) {
      state.summary = null;
      state.error = null;
      state.lastFetched = null;
    },
  },
});

export const {
  setDashboardSummary,
  setDashboardLoading,
  setDashboardError,
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
