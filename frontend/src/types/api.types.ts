// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

// Admin types
export interface AdminDashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalMembers: number;
  pendingPayments: number;
  totalFund: number;
  totalDebt: number;
  systemHealth: {
    timestamp: string;
    activeTeams: number;
    activeMembers: number;
  };
}

export interface FinanceReport {
  timestamp: string;
  transactionsByType: {
    _id: string;
    count: number;
    totalAmount: number;
  }[];
  teamRevenue: {
    _id: string;
    name: string;
    currentFundBalance: number;
    monthlyFeeAmount: number;
  }[];
  highestDebtUsers: {
    userId: string;
    userName: string;
    userEmail: string;
    teamName: string;
    debt: number;
  }[];
  totalStats: {
    totalTeams: number;
    totalMembers: number;
    totalTransactions: number;
    pendingPayments: number;
  };
}

export interface UserActivityReport {
  timestamp: string;
  period: string;
  newUsers: number;
  totalActiveUsers: number;
  newTeams: number;
  activeTeams: {
    teamId: string;
    teamName: string;
    memberCount: number;
  }[];
}
