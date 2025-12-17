import { apiClient } from './axios';
import type { CreateTeamInput, ChangeRoleInput, KickMemberInput } from '@/types/team.types';
import type { ApiResponse } from '@/types/api.types';

export const teamApi = {
  // Create new team
  createTeam: async (data: CreateTeamInput): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/users/create-team', data);
    return response.data;
  },

  // Join team with invite code
  joinTeam: async (inviteCode: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/users/join', { inviteCode });
    return response.data;
  },

  // Leave team
  leaveTeam: async (teamId: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/users/leave', { teamId });
    return response.data;
  },

  // Renew invite code (Leader only)
  renewInviteCode: async (teamId: string): Promise<ApiResponse<{ inviteCode: string }>> => {
    const response = await apiClient.post<ApiResponse<{ inviteCode: string }>>(
      '/users/invite-link/renew',
      { teamId }
    );
    return response.data;
  },

  // Change member role (Leader only)
  changeRole: async (data: ChangeRoleInput): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>('/users/change-role', data);
    return response.data;
  },

  // Kick member (Leader only)
  kickMember: async (data: KickMemberInput): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/users/kick-member', data);
    return response.data;
  },

  // Delete team (Leader only)
  deleteTeam: async (teamId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/users/team/${teamId}`);
    return response.data;
  },

  // Get team members
  getTeamMembers: async (teamId: string): Promise<ApiResponse<{ 
    members: Array<{
      id: string;
      name: string;
      email: string;
      position: string;
      role: 'Leader' | 'Treasurer' | 'Member';
      debt: number;
      joinedAt: string;
    }>;
    total: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{ 
      members: Array<{
        id: string;
        name: string;
        email: string;
        position: string;
        role: 'Leader' | 'Treasurer' | 'Member';
        debt: number;
        joinedAt: string;
      }>;
      total: number;
    }>>(`/users/team/${teamId}/members`);
    return response.data;
  },
};
