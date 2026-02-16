/**
 * Common TypeScript types and interfaces used throughout the app
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
