import { apiClient } from './axios';
import type { Match, CreateMatchInput, UpdateMatchInput, Lineup, LineupInput } from '@/types/match.types';
import type { VoteInput } from '@/types/vote.types';
import type { ApiResponse } from '@/types/api.types';

export const matchApi = {
  // Get all matches for a team
  getMatches: async (teamId: string, status?: string): Promise<ApiResponse<{ matches: Match[] }>> => {
    const response = await apiClient.get<ApiResponse<{ matches: Match[] }>>('/matches', {
      params: { teamId, status },
    });
    return response.data;
  },

  // Get match by ID
  getMatchById: async (matchId: string): Promise<ApiResponse<{ match: Match }>> => {
    const response = await apiClient.get<ApiResponse<{ match: Match }>>(`/matches/${matchId}`);
    return response.data;
  },

  // Create match (Leader/Treasurer only)
  createMatch: async (data: CreateMatchInput): Promise<ApiResponse<{ match: Match }>> => {
    const response = await apiClient.post<ApiResponse<{ match: Match }>>('/matches', data);
    return response.data;
  },

  // Update match (Leader/Treasurer only)
  updateMatch: async (matchId: string, data: UpdateMatchInput): Promise<ApiResponse<{ match: Match }>> => {
    const response = await apiClient.put<ApiResponse<{ match: Match }>>(`/matches/${matchId}`, data);
    return response.data;
  },

  // Delete match (Leader/Treasurer only)
  deleteMatch: async (matchId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/matches/${matchId}`);
    return response.data;
  },

  // Vote for match
  vote: async (matchId: string, voteData: VoteInput): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/matches/${matchId}/vote`, voteData);
    return response.data;
  },

  // Set lineup (Leader/Treasurer only)
  setLineup: async (matchId: string, data: LineupInput): Promise<ApiResponse<{ lineup: Lineup }>> => {
    const response = await apiClient.put<ApiResponse<{ lineup: Lineup }>>(`/matches/${matchId}/lineup`, data);
    return response.data;
  },

  // Get lineup
  getLineup: async (matchId: string): Promise<ApiResponse<{ lineup: Lineup }>> => {
    const response = await apiClient.get<ApiResponse<{ lineup: Lineup }>>(`/matches/${matchId}/lineup`);
    return response.data;
  },
};
