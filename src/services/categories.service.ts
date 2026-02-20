import api from './api';
import type { Category, ApiResponse } from '../types';

// Get All Categories
export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  return response.data;
};

// Get Category by ID
export const getCategoryById = async (id: string): Promise<ApiResponse<Category>> => {
  const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return response.data;
};
