export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  profileImage?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  location?: {
    city: string;
    district: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  city: string;
  district: string;
  additionalDirections?: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
