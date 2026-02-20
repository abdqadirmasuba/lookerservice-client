import api from './api';
import type { 
  Provider, 
  Service, 
  Review, 
  SearchFilters, 
  ProviderGallery,
  PaginatedResponse, 
  ApiResponse 
} from '../types';

// Search Providers
export const searchProviders = async (
  query: string,
  filters?: SearchFilters,
  page: number = 1
): Promise<PaginatedResponse<Provider>> => {
  const response = await api.get<PaginatedResponse<Provider>>('/providers/search', {
    params: {
      q: query,
      ...filters,
      page,
    },
  });
  return response.data;
};

// Get Featured Providers
export const getFeaturedProviders = async (): Promise<ApiResponse<Provider[]>> => {
  const response = await api.get<ApiResponse<Provider[]>>('/providers/featured');
  return response.data;
};

// Get Provider by ID
export const getProviderById = async (id: string): Promise<ApiResponse<Provider>> => {
  const response = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
  return response.data;
};

// Get Provider Services
export const getProviderServices = async (id: string): Promise<ApiResponse<Service[]>> => {
  const response = await api.get<ApiResponse<Service[]>>(`/providers/${id}/services`);
  return response.data;
};

// Get Provider Reviews
export const getProviderReviews = async (
  id: string,
  page: number = 1
): Promise<PaginatedResponse<Review>> => {
  const response = await api.get<PaginatedResponse<Review>>(`/providers/${id}/reviews`, {
    params: { page },
  });
  return response.data;
};

// Get Provider Gallery
export const getProviderGallery = async (id: string): Promise<ApiResponse<ProviderGallery[]>> => {
  const response = await api.get<ApiResponse<ProviderGallery[]>>(`/providers/${id}/gallery`);
  return response.data;
};
