/**
 * App-wide constants
 */

export const Colors = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#ffffff',
  text: '#1f2937',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
