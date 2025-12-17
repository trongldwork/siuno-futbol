// Team types
export interface Team {
  _id: string;
  name: string;
  inviteCode: string;
  monthlyFeeAmount: number;
  currentFundBalance: number;
  createdBy: string;
  createdAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    position: string;
    phone: string;
  };
  role: TeamRole;
  debt: number;
  isActive: boolean;
  joinedAt: string;
}

export type TeamRole = 'Leader' | 'Treasurer' | 'Member';

// Team Input types
export interface CreateTeamInput {
  teamName: string;
  monthlyFeeAmount: number;
}

export interface JoinTeamInput {
  inviteCode: string;
}

export interface ChangeRoleInput {
  teamId: string;
  userId: string;
  newRole: TeamRole;
}

export interface KickMemberInput {
  teamId: string;
  userId: string;
}
