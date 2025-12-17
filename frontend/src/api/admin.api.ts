import { apiClient } from './axios';
import type { 
  AdminDashboardStats, 
  FinanceReport, 
  UserActivityReport, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types/api.types';
import type { User } from '@/types/user.types';
import type { Team } from '@/types/team.types';
import type { Transaction, PaymentRequest } from '@/types/finance.types';

export const adminApi = {
  // Get admin dashboard stats
  getDashboard: async (): Promise<ApiResponse<{ stats: AdminDashboardStats }>> => {
    const response = await apiClient.get<ApiResponse<{ stats: AdminDashboardStats }>>('/admin/dashboard');
    return response.data;
  },

  // Get all users
  getUsers: async (params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (userId: string): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  // Get all teams
  getTeams: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Team>> => {
    const response = await apiClient.get<PaginatedResponse<Team>>('/admin/teams', { params });
    return response.data;
  },

  // Get team details
  getTeamDetails: async (teamId: string): Promise<ApiResponse<{ team: Team }>> => {
    const response = await apiClient.get<ApiResponse<{ team: Team }>>(`/admin/teams/${teamId}`);
    return response.data;
  },

  // Get all transactions
  getAllTransactions: async (params?: {
    teamId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>('/admin/transactions', { params });
    return response.data;
  },

  // Get all payment requests
  getAllPaymentRequests: async (params?: {
    status?: string;
    teamId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ requests: PaymentRequest[]; statusCount: Record<string, number> }>> => {
    const response = await apiClient.get<ApiResponse<{ requests: PaymentRequest[]; statusCount: Record<string, number> }>>(
      '/admin/payment-requests',
      { params }
    );
    return response.data;
  },

  // Get finance report
  getFinanceReport: async (): Promise<ApiResponse<{ report: FinanceReport }>> => {
    const response = await apiClient.get<ApiResponse<{ report: FinanceReport }>>('/admin/reports/finance');
    return response.data;
  },

  // Get user activity report
  getUserActivityReport: async (): Promise<ApiResponse<{ report: UserActivityReport }>> => {
    const response = await apiClient.get<ApiResponse<{ report: UserActivityReport }>>('/admin/reports/users');
    return response.data;
  },
};
