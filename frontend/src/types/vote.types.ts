// Vote types
export interface Vote {
  _id: string;
  userId: string | VoteUser;
  matchId: string;
  status: VoteStatus;
  guestCount?: number;
  note?: string;
  changeReason?: string;
  changeRequestedAt?: string;
  isApprovedChange: boolean;
  createdAt: string;
}

export interface VoteUser {
  _id: string;
  name: string;
  position: string;
}

export type VoteStatus = 'Participate' | 'Absent' | 'Late';

// Vote Input types
export interface VoteInput {
  status: VoteStatus;
  guestCount?: number;
  note?: string;
}

export interface VoteChangeRequest {
  status: VoteStatus;
  note?: string;
  reason: string;
}
