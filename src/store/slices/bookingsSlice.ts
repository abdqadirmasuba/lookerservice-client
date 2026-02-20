import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Booking, BookingStatus } from '../../types';

interface BookingsState {
  bookings: Booking[];
  upcomingBookings: Booking[];
  completedBookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  upcomingBookings: [],
  completedBookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings(state, action: PayloadAction<Booking[]>) {
      state.bookings = action.payload;
      state.upcomingBookings = action.payload.filter(
        (b) => b.status === 'confirmed' || b.status === 'in_progress'
      );
      state.completedBookings = action.payload.filter((b) => b.status === 'completed');
      state.error = null;
    },
    addBooking(state, action: PayloadAction<Booking>) {
      state.bookings = [action.payload, ...state.bookings];
      if (action.payload.status === 'confirmed' || action.payload.status === 'in_progress') {
        state.upcomingBookings = [action.payload, ...state.upcomingBookings];
      }
    },
    updateBooking(state, action: PayloadAction<Booking>) {
      const index = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
      
      // Update upcoming bookings
      const upcomingIndex = state.upcomingBookings.findIndex((b) => b.id === action.payload.id);
      if (upcomingIndex !== -1) {
        if (action.payload.status === 'confirmed' || action.payload.status === 'in_progress') {
          state.upcomingBookings[upcomingIndex] = action.payload;
        } else {
          state.upcomingBookings.splice(upcomingIndex, 1);
        }
      }
      
      // Update completed bookings
      if (action.payload.status === 'completed') {
        const completedIndex = state.completedBookings.findIndex((b) => b.id === action.payload.id);
        if (completedIndex === -1) {
          state.completedBookings = [action.payload, ...state.completedBookings];
        }
      }
    },
    cancelBooking(state, action: PayloadAction<string>) {
      const index = state.bookings.findIndex((b) => b.id === action.payload);
      if (index !== -1) {
        // state.bookings[index].status = 'cancelled';
      }
      state.upcomingBookings = state.upcomingBookings.filter((b) => b.id !== action.payload);
    },
    setSelectedBooking(state, action: PayloadAction<Booking | null>) {
      state.selectedBooking = action.payload;
    },
    filterBookingsByStatus(state, action: PayloadAction<BookingStatus | 'all'>) {
      if (action.payload === 'all') {
        state.upcomingBookings = state.bookings;
      } else {
        state.upcomingBookings = state.bookings.filter((b) => b.status === action.payload);
      }
    },
    setBookingsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setBookingsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setBookings,
  addBooking,
  updateBooking,
  cancelBooking,
  setSelectedBooking,
  filterBookingsByStatus,
  setBookingsLoading,
  setBookingsError,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
