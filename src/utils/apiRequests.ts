import axios from 'axios';
import { config } from './apiConfig';
import { RootState,store } from '../store';

const api = axios.create({
  baseURL: config.domain_url,
});

console.log('API Base URL:', config.domain_url);
// Add interceptor to include Authorization header only if token exists
api.interceptors.request.use(
  async (config) => {
    const state: RootState = store.getState();
    const authtoken = state.auth.token;

    if (authtoken) {
      config.headers.Authorization = `Bearer ${authtoken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiRequests = {
  get: (url: string, params?: any) => api.get(url, { params }),
  post: (url: string, data?: any) => api.post(url, data),
  put: (url: string, data?: any) => api.put(url, data),
  patch: (url: string, data?: any) => api.patch(url, data),
};

export default api;