import type { TeamRole } from './team.types';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  dob: string;
  position: Position;
  phone: string;
  role: UserRole;
  teams?: TeamMembership[];
  createdAt?: string;
}

export interface TeamMembership {
  teamId: string;
  teamName: string;
  inviteCode: string;
  monthlyFeeAmount: number;
  currentFundBalance: number;
  role: TeamRole;
  debt: number;
  isActive: boolean;
  joinedAt: string;
}

export type Position = 'Striker' | 'Midfielder' | 'Defender' | 'Goalkeeper' | 'Winger';
export type UserRole = 'User' | 'SuperAdmin';

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  dob: string;
  position: Position;
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
