import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServiceRequest, RequestStatus } from '../../types';

interface RequestsState {
  requests: ServiceRequest[];
  activeRequests: ServiceRequest[];
  selectedRequest: ServiceRequest | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  activeRequests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
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
      state.error = null;
    },
    addRequest(state, action: PayloadAction<ServiceRequest>) {
      state.requests = [action.payload, ...state.requests];
      if (action.payload.status !== 'closed' && action.payload.status !== 'cancelled') {
        state.activeRequests = [action.payload, ...state.activeRequests];
      }
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
    },
    setSelectedRequest(state, action: PayloadAction<ServiceRequest | null>) {
      state.selectedRequest = action.payload;
    },
    filterRequestsByStatus(state, action: PayloadAction<RequestStatus | 'all'>) {
      if (action.payload === 'all') {
        state.activeRequests = state.requests;
      } else {
        state.activeRequests = state.requests.filter((req) => req.status === action.payload);
      }
    },
    setRequestsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setRequestsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setRequests,
  addRequest,
  updateRequest,
  deleteRequest,
  setSelectedRequest,
  filterRequestsByStatus,
  setRequestsLoading,
  setRequestsError,
} = requestsSlice.actions;

export default requestsSlice.reducer;
