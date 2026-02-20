export * from './auth.types';
export * from './user.types';
export * from './category.types';
export * from './provider.types';
export * from './request.types';
export * from './bid.types';
export * from './booking.types';
export * from './message.types';
export * from './payment.types';
export * from './notification.types';

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
