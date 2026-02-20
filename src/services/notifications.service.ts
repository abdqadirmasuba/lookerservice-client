import api from './api';
import type { Notification, NotificationSettings, PaginatedResponse, ApiResponse } from '../types';

// Get Notifications
export const getNotifications = async (page: number = 1): Promise<PaginatedResponse<Notification>> => {
  const response = await api.get<PaginatedResponse<Notification>>('/notifications', {
    params: { page },
  });
  return response.data;
};

// Mark as Read
export const markAsRead = async (notificationId: string): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/notifications/${notificationId}/read`);
  return response.data;
};

// Mark All as Read
export const markAllAsRead = async (): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>('/notifications/read-all');
  return response.data;
};

// Delete Notification
export const deleteNotification = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/notifications/${id}`);
  return response.data;
};

// Get Notification Settings
export const getNotificationSettings = async (): Promise<ApiResponse<NotificationSettings>> => {
  const response = await api.get<ApiResponse<NotificationSettings>>('/notifications/settings');
  return response.data;
};

// Update Notification Settings
export const updateNotificationSettings = async (
  data: Partial<NotificationSettings>
): Promise<ApiResponse<NotificationSettings>> => {
  const response = await api.put<ApiResponse<NotificationSettings>>('/notifications/settings', data);
  return response.data;
};
