import api from './api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  VerificationData, 
  ResetPasswordData,
  ApiResponse 
} from '../types';

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// Google OAuth
export const googleAuth = async (token: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/google', { token });
  return response.data;
};

// Verify Email
export const verifyEmail = async (data: VerificationData): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/verify-email', data);
  return response.data;
};

// Verify Phone (OTP)
export const verifyPhone = async (data: VerificationData): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/verify-phone', data);
  return response.data;
};

// Resend Verification Email
export const resendVerificationEmail = async (): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/resend-verification-email');
  return response.data;
};

// Resend Phone OTP
export const resendPhoneOTP = async (): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/resend-phone-otp');
  return response.data;
};

// Forgot Password
export const forgotPassword = async (emailOrPhone: string): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/forgot-password', { emailOrPhone });
  return response.data;
};

// Reset Password
export const resetPassword = async (data: ResetPasswordData): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/reset-password', data);
  return response.data;
};

// Refresh Token
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  return response.data;
};

// Logout
export const logout = async (): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/logout');
  return response.data;
};
