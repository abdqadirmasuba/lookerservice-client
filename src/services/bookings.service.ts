import api from './api';
import type { 
  Booking, 
  CreateBookingData, 
  ReviewData,
  ApiResponse 
} from '../types';

// Create Booking
export const createBooking = async (data: CreateBookingData): Promise<ApiResponse<Booking>> => {
  const response = await api.post<ApiResponse<Booking>>('/bookings', data);
  return response.data;
};

// Get My Bookings
export const getMyBookings = async (status?: string): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get<ApiResponse<Booking[]>>('/bookings/my-bookings', {
    params: { status },
  });
  return response.data;
};

// Get Booking by ID
export const getBookingById = async (id: string): Promise<ApiResponse<Booking>> => {
  const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  return response.data;
};

// Reschedule Booking
export const rescheduleBooking = async (
  id: string,
  newDateTime: { date: string; time: string; reason?: string }
): Promise<ApiResponse<Booking>> => {
  const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/reschedule`, newDateTime);
  return response.data;
};

// Cancel Booking
export const cancelBooking = async (id: string, reason: string): Promise<ApiResponse<Booking>> => {
  const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
  return response.data;
};

// Submit Review
export const submitReview = async (bookingId: string, review: ReviewData): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(`/bookings/${bookingId}/review`, review);
  return response.data;
};
