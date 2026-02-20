import api from './api';
import type { 
  ServiceRequest, 
  CreateRequestData, 
  Bid,
  ApiResponse, 
  PaginatedResponse 
} from '../types';

// Create Service Request
export const createRequest = async (data: CreateRequestData): Promise<ApiResponse<ServiceRequest>> => {
  const response = await api.post<ApiResponse<ServiceRequest>>('/requests', data);
  return response.data;
};

// Get My Requests
export const getMyRequests = async (status?: string): Promise<ApiResponse<ServiceRequest[]>> => {
  const response = await api.get<ApiResponse<ServiceRequest[]>>('/requests/my-requests', {
    params: { status },
  });
  return response.data;
};

// Get Request by ID
export const getRequestById = async (id: string): Promise<ApiResponse<ServiceRequest>> => {
  const response = await api.get<ApiResponse<ServiceRequest>>(`/requests/${id}`);
  return response.data;
};

// Update Request
export const updateRequest = async (id: string, data: Partial<CreateRequestData>): Promise<ApiResponse<ServiceRequest>> => {
  const response = await api.put<ApiResponse<ServiceRequest>>(`/requests/${id}`, data);
  return response.data;
};

// Delete Request
export const deleteRequest = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/requests/${id}`);
  return response.data;
};

// Get Bids for Request
export const getBidsForRequest = async (requestId: string): Promise<ApiResponse<Bid[]>> => {
  const response = await api.get<ApiResponse<Bid[]>>(`/requests/${requestId}/bids`);
  return response.data;
};

// Accept Bid
export const acceptBid = async (bidId: string): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(`/bids/${bidId}/accept`);
  return response.data;
};

// Reject Bid
export const rejectBid = async (bidId: string): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(`/bids/${bidId}/reject`);
  return response.data;
};
