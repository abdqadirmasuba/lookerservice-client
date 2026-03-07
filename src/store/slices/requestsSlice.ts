import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServiceRequest } from '../../types';

interface RequestsState {
  requests: ServiceRequest[];
  activeRequests: ServiceRequest[];
  selectedRequest: ServiceRequest | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;
  limit: number;
}

const initialState: RequestsState = {
  requests: [],
  activeRequests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  hasMore: true,
  offset: 0,
  limit: 20,
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setRequests(state, action: PayloadAction<ServiceRequest[]>) {
      state.requests = action.payload;
      state.activeRequests = action.payload.filter(
        (req) => req.status !== 'closed' && req.status !== 'cancelled'
      );
      state.offset = action.payload.length;
      state.error = null;
    },
    appendRequests(state, action: PayloadAction<ServiceRequest[]>) {
      state.requests = [...state.requests, ...action.payload];
      state.activeRequests = state.requests.filter(
        (req) => req.status !== 'closed' && req.status !== 'cancelled'
      );
      state.offset = state.requests.length;
      state.hasMore = action.payload.length === state.limit;
      state.error = null;
    },
    addRequest(state, action: PayloadAction<ServiceRequest>) {
      state.requests = [action.payload, ...state.requests];
      if (action.payload.status !== 'closed' && action.payload.status !== 'cancelled') {
        state.activeRequests = [action.payload, ...state.activeRequests];
      }
      state.offset += 1;
    },
    updateRequest(state, action: PayloadAction<ServiceRequest>) {
      const index = state.requests.findIndex((req) => req.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      const activeIndex = state.activeRequests.findIndex((req) => req.id === action.payload.id);
      if (activeIndex !== -1) {
        if (action.payload.status === 'closed' || action.payload.status === 'cancelled') {
          state.activeRequests.splice(activeIndex, 1);
        } else {
          state.activeRequests[activeIndex] = action.payload;
        }
      }
    },
    deleteRequest(state, action: PayloadAction<string>) {
      state.requests = state.requests.filter((req) => req.id !== action.payload);
      state.activeRequests = state.activeRequests.filter((req) => req.id !== action.payload);
      state.offset = Math.max(0, state.offset - 1);
    },
    setSelectedRequest(state, action: PayloadAction<ServiceRequest | null>) {
      state.selectedRequest = action.payload;
    },
    setRequestsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setRequestsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetPagination(state) {
      state.offset = 0;
      state.hasMore = true;
    },
  },
});

export const {
  setRequests,
  appendRequests,
  addRequest,
  updateRequest,
  deleteRequest,
  setSelectedRequest,
  setRequestsLoading,
  setRequestsError,
  resetPagination,
} = requestsSlice.actions;

export default requestsSlice.reducer;
