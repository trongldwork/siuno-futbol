import type { Vote } from './vote.types';

// Re-export Vote for convenience
export type { Vote };

// Match types
export interface Match {
  _id: string;
  teamId: string;
  opponentName: string;
  time: string;
  location: string;
  contactPerson?: string;
  votingDeadline: string;
  matchCost?: number;
  totalParticipants?: number;
  guestCount?: number;
  status: MatchStatus;
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
  votes?: Vote[];
  participantCount?: number;
  absentCount?: number;
  lateCount?: number;
}

export type MatchStatus = 'Upcoming' | 'Completed' | 'Cancelled';

// Match Input types
export interface CreateMatchInput {
  teamId: string;
  opponentName: string;
  time: string;
  location: string;
  contactPerson?: string;
  votingDeadline: string;
}

export interface UpdateMatchInput {
  opponentName?: string;
  time?: string;
  location?: string;
  contactPerson?: string;
  votingDeadline?: string;
  status?: MatchStatus;
}

// Lineup types
export interface Lineup {
  _id: string;
  matchId: string;
  teamId: string;
  teamA: LineupPlayer[];
  teamB: LineupPlayer[];
  createdAt: string;
}

export interface LineupPlayer {
  userId: string;
  name: string;
  position: string;
}

export interface LineupInput {
  teamId: string;
  teamA?: string[];
  teamB?: string[];
  autoGenerate?: boolean;
}
