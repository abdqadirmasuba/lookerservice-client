import api from './api';
import type { 
  PaymentMethod, 
  Transaction,
  PaymentMethodType,
  ApiResponse 
} from '../types';

// Get Payment Methods
export const getPaymentMethods = async (): Promise<ApiResponse<PaymentMethod[]>> => {
  const response = await api.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
  return response.data;
};

// Add Payment Method
export const addPaymentMethod = async (data: {
  type: PaymentMethodType;
  details: Record<string, unknown>;
}): Promise<ApiResponse<PaymentMethod>> => {
  const response = await api.post<ApiResponse<PaymentMethod>>('/payments/methods', data);
  return response.data;
};

// Delete Payment Method
export const deletePaymentMethod = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/payments/methods/${id}`);
  return response.data;
};

// Set Default Payment Method
export const setDefaultMethod = async (id: string): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>(`/payments/methods/${id}/set-default`);
  return response.data;
};

// Initiate Payment
export const initiatePayment = async (
  bookingId: string,
  methodId: string
): Promise<ApiResponse<{ transactionId: string }>> => {
  const response = await api.post<ApiResponse<{ transactionId: string }>>('/payments/initiate', {
    bookingId,
    methodId,
  });
  return response.data;
};

// Verify Payment
export const verifyPayment = async (transactionId: string): Promise<ApiResponse<Transaction>> => {
  const response = await api.get<ApiResponse<Transaction>>(`/payments/verify/${transactionId}`);
  return response.data;
};

// Get Transaction History
export const getTransactionHistory = async (): Promise<ApiResponse<Transaction[]>> => {
  const response = await api.get<ApiResponse<Transaction[]>>('/payments/transactions');
  return response.data;
};
