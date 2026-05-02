import axios from 'axios';
import { config } from './apiConfig';

const api = axios.create({
  baseURL: config.domain_url,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Authorization header only if token exists
api.interceptors.request.use(
  async (config) => {
    // Lazy import store to avoid circular dependency
    const { store } = await import('../store');
    const state = store.getState();
    const authtoken = state.auth.token;
    // const publicId = state.auth.publicId;

    if (authtoken) {
      config.headers.Authorization = `Bearer ${authtoken}`;
    }

    // if (publicId) {
    //   config.headers['X-Public-ID'] = publicId;
    // }

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
  postheaders: (url: string, data?: any, headers?: any) => api.post(url, data, { headers }),
  // Upload a blob directly to a presigned S3 URL using native fetch (avoids axios header quirks)
  uploadToS3: async (uploadUrl: string, blob: Blob, contentType: string): Promise<void> => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });
    if (!res.ok) {
      throw new Error(`S3 upload failed with status ${res.status}`);
    }
  },
};

export default api;