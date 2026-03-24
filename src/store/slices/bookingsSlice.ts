import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Booking } from '../../types';

interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  offset: number;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  offset: 0,
  error: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings(state, action: PayloadAction<Booking[]>) {
      state.bookings = action.payload;
      state.offset = action.payload.length;
      state.hasMore = action.payload.length >= 20;
      state.error = null;
    },
    appendBookings(state, action: PayloadAction<Booking[]>) {
      state.bookings = [...state.bookings, ...action.payload];
      state.offset = state.bookings.length;
      state.hasMore = action.payload.length >= 20;
    },
    setSelectedBooking(state, action: PayloadAction<Booking | null>) {
      state.selectedBooking = action.payload;
    },
    setBookingsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setBookingsLoadingMore(state, action: PayloadAction<boolean>) {
      state.isLoadingMore = action.payload;
    },
    setBookingsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetBookings(state) {
      state.bookings = [];
      state.offset = 0;
      state.hasMore = true;
      state.error = null;
    },
  },
});

export const {
  setBookings,
  appendBookings,
  setSelectedBooking,
  setBookingsLoading,
  setBookingsLoadingMore,
  setBookingsError,
  resetBookings,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
