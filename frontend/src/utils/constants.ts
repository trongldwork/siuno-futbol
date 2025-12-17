import type { Position, UserRole } from '@/types/user.types';
import type { TeamRole } from '@/types/team.types';
import type { MatchStatus } from '@/types/match.types';
import type { VoteStatus } from '@/types/vote.types';
import type { TransactionType, PaymentRequestStatus } from '@/types/finance.types';

// User positions
export const USER_POSITIONS: Position[] = [
  'Striker',
  'Midfielder',
  'Defender',
  'Goalkeeper',
  'Winger',
];

// User roles
export const USER_ROLES: UserRole[] = ['User', 'SuperAdmin'];

// Team roles
export const TEAM_ROLES: TeamRole[] = ['Leader', 'Treasurer', 'Member'];

// Match statuses
export const MATCH_STATUSES: MatchStatus[] = ['Upcoming', 'Completed', 'Cancelled'];

// Vote statuses
export const VOTE_STATUSES: VoteStatus[] = ['Participate', 'Absent', 'Late'];

// Transaction types
export const TRANSACTION_TYPES: TransactionType[] = [
  'FundCollection',
  'Expense',
  'GuestPayment',
  'MatchExpense',
  'MonthlyFee',
];

// Payment request statuses
export const PAYMENT_REQUEST_STATUSES: PaymentRequestStatus[] = [
  'Pending',
  'Approved',
  'Rejected',
];

// Role display names
export const ROLE_LABELS: Record<TeamRole, string> = {
  Leader: 'Trưởng nhóm',
  Treasurer: 'Thủ quỹ',
  Member: 'Thành viên',
};

// Position display names
export const POSITION_LABELS: Record<Position, string> = {
  Striker: 'Tiền đạo',
  Midfielder: 'Tiền vệ',
  Defender: 'Hậu vệ',
  Goalkeeper: 'Thủ môn',
  Winger: 'Cánh',
};

// Vote status display names
export const VOTE_STATUS_LABELS: Record<VoteStatus, string> = {
  Participate: 'Tham gia',
  Absent: 'Vắng mặt',
  Late: 'Đến muộn',
};

// Transaction type display names
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  FundCollection: 'Thu quỹ',
  Expense: 'Chi phí',
  GuestPayment: 'Khách thanh toán',
  MatchExpense: 'Chi phí trận đấu',
  MonthlyFee: 'Phí tháng',
};

// Match status display names
export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  Upcoming: 'Sắp diễn ra',
  Completed: 'Đã kết thúc',
  Cancelled: 'Đã hủy',
};

// Status colors
export const VOTE_STATUS_COLORS: Record<VoteStatus, string> = {
  Participate: 'bg-green-100 text-green-800',
  Absent: 'bg-red-100 text-red-800',
  Late: 'bg-yellow-100 text-yellow-800',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentRequestStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  Upcoming: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-800',
};

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// App Info
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Siuno Futbol';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
