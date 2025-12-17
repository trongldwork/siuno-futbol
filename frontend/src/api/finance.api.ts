import { apiClient } from './axios';
import type { FinanceStats, Transaction, PaymentRequest } from '@/types/finance.types';
import type { ApiResponse } from '@/types/api.types';

export const financeApi = {
  // Get finance stats (Treasurer/Leader only)
  getStats: async (teamId: string): Promise<ApiResponse<{ stats: FinanceStats }>> => {
    const response = await apiClient.get<ApiResponse<{ stats: FinanceStats }>>('/finance/stats', {
      params: { teamId },
    });
    return response.data;
  },

  // Trigger monthly fee (Treasurer/Leader only)
  triggerMonthlyFee: async (teamId: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/finance/monthly-fee', { teamId });
    return response.data;
  },

  // Create transaction (Treasurer/Leader only)
  createTransaction: async (data: FormData): Promise<ApiResponse<{ transaction: Transaction; newFundBalance: number }>> => {
    const response = await apiClient.post<ApiResponse<{ transaction: Transaction; newFundBalance: number }>>(
      '/finance/transaction',
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // Clear debt (Treasurer/Leader only)
  clearDebt: async (data: FormData): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/finance/clear-debt', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Assign debt (Treasurer/Leader only)
  assignDebt: async (data: FormData): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/finance/assign-debt', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Create payment request (All members)
  createPaymentRequest: async (data: FormData): Promise<ApiResponse<{ paymentRequest: PaymentRequest }>> => {
    const response = await apiClient.post<ApiResponse<{ paymentRequest: PaymentRequest }>>(
      '/finance/payment-request',
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  // Approve payment request (Treasurer/Leader only)
  approvePaymentRequest: async (requestId: string, teamId: string): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(
      `/finance/payment-request/${requestId}/approve`,
      { teamId }
    );
    return response.data;
  },

  // Reject payment request (Treasurer/Leader only)
  rejectPaymentRequest: async (requestId: string, teamId: string, reason: string): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(
      `/finance/payment-request/${requestId}/reject`,
      { teamId, reason }
    );
    return response.data;
  },

  // Get payment requests (Treasurer/Leader only)
  getPaymentRequests: async (
    teamId: string,
    status?: string
  ): Promise<ApiResponse<{ paymentRequests: PaymentRequest[] }>> => {
    const response = await apiClient.get<ApiResponse<{ paymentRequests: PaymentRequest[] }>>(
      '/finance/payment-requests',
      {
        params: { teamId, status },
      }
    );
    return response.data;
  },

  // Get pending transactions (Treasurer/Leader only)
  getPendingTransactions: async (teamId: string): Promise<ApiResponse<{ transactions: Transaction[] }>> => {
    const response = await apiClient.get<ApiResponse<{ transactions: Transaction[] }>>(
      '/finance/pending-transactions',
      {
        params: { teamId },
      }
    );
    return response.data;
  },

  // Approve transaction (Treasurer/Leader only)
  approveTransaction: async (transactionId: string, teamId: string): Promise<ApiResponse<{ transaction: Transaction; newFundBalance: number }>> => {
    const response = await apiClient.put<ApiResponse<{ transaction: Transaction; newFundBalance: number }>>(
      `/finance/transaction/${transactionId}/approve`,
      { teamId }
    );
    return response.data;
  },

  // Reject transaction (Treasurer/Leader only)
  rejectTransaction: async (transactionId: string, teamId: string): Promise<ApiResponse<{ transaction: Transaction }>> => {
    const response = await apiClient.put<ApiResponse<{ transaction: Transaction }>>(
      `/finance/transaction/${transactionId}/reject`,
      { teamId }
    );
    return response.data;
  },
};
