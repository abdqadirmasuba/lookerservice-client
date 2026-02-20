import api from './api';
import type { User, UpdateProfileData, ApiResponse } from '../types';

// Get User Profile
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/user/profile');
  return response.data;
};

// Update Profile
export const updateProfile = async (data: UpdateProfileData): Promise<ApiResponse<User>> => {
  const response = await api.put<ApiResponse<User>>('/user/profile', data);
  return response.data;
};

// Upload Profile Image
export const uploadProfileImage = async (formData: FormData): Promise<ApiResponse<{ imageUrl: string }>> => {
  const response = await api.post<ApiResponse<{ imageUrl: string }>>('/user/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Change Password
export const changePassword = async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/user/change-password', {
    oldPassword,
    newPassword,
  });
  return response.data;
};
