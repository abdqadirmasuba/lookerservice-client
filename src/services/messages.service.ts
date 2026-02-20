import api from './api';
import type { Conversation, Message, PaginatedResponse, ApiResponse } from '../types';

// Get Conversations
export const getConversations = async (): Promise<ApiResponse<Conversation[]>> => {
  const response = await api.get<ApiResponse<Conversation[]>>('/messages/conversations');
  return response.data;
};

// Get Messages
export const getMessages = async (
  conversationId: string,
  page: number = 1
): Promise<PaginatedResponse<Message>> => {
  const response = await api.get<PaginatedResponse<Message>>(`/messages/conversations/${conversationId}/messages`, {
    params: { page },
  });
  return response.data;
};

// Send Message
export const sendMessage = async (conversationId: string, text: string): Promise<ApiResponse<Message>> => {
  const response = await api.post<ApiResponse<Message>>(`/messages/conversations/${conversationId}/messages`, {
    text,
  });
  return response.data;
};

// Mark as Read
export const markAsRead = async (conversationId: string): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/messages/conversations/${conversationId}/read`);
  return response.data;
};
