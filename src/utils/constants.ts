// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@lookerservice_access_token',
  REFRESH_TOKEN: '@lookerservice_refresh_token',
  USER_DATA: '@lookerservice_user_data',
  ONBOARDING_COMPLETE: '@lookerservice_onboarding_complete',
  REDUX_PERSIST: 'root',
};

// API Base URL - Update this with your actual API URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.lookerservice.com/v1';

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Request Status
export const REQUEST_STATUS = {
  AWAITING_BIDS: 'awaiting_bids',
  BIDS_RECEIVED: 'bids_received',
  ACCEPTED: 'accepted',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  MOBILE_MONEY: 'mobile_money',
  CARD: 'card',
} as const;

// Mobile Money Providers
export const MOBILE_MONEY_PROVIDERS = {
  MTN: 'MTN',
  AIRTEL: 'Airtel',
} as const;

// File Upload Limits
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_PHOTOS_PER_REQUEST = 5;
export const MAX_REVIEW_PHOTOS = 5;

// Pagination
export const DEFAULT_PAGINATION_LIMIT = 20;
export const DEFAULT_PAGE = 1;

// Search & Filters
export const MAX_SEARCH_DISTANCE = 50; // kilometers
export const MIN_RATING_FILTER = 1;
export const MAX_RATING_FILTER = 5;

// Service Request
export const MIN_BUDGET = 1000; // UGX
export const MAX_BUDGET = 10000000; // UGX

// Validation
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 50;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

// Time
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
export const RESEND_OTP_DELAY = 60; // seconds
export const RESEND_EMAIL_DELAY = 120; // seconds


// Contact Info
export const SUPPORT_EMAIL = 'support@lookerservice.com';
export const SUPPORT_PHONE = '+256700000000';

// App Version
export const APP_VERSION = '1.0.0';
