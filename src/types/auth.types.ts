export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      fullName: string;
      email?: string;
      phone?: string;
      profileImage?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface VerificationData {
  code?: string;
  otp?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
