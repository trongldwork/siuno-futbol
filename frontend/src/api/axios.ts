import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { getStorageItem, removeStorageItem } from '@/utils/storage';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getStorageItem<string>('TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      removeStorageItem('TOKEN');
      removeStorageItem('USER');
      window.location.href = '/login';
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default apiClient;
