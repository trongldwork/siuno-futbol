import { apiClient } from './axios';
import type { LoginInput, RegisterInput, AuthResponse, User } from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

export const authApi = {
  // Register new user
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (credentials: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data;
  },
};
