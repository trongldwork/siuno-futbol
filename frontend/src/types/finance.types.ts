// Transaction types
export interface Transaction {
  _id: string;
  teamId: string;
  amount: number;
  type: TransactionType;
  description: string;
  proofImage?: string;
  relatedMatchId?: string;
  relatedUserId?: string | TransactionUser;
  createdBy: string | TransactionUser;
  status: TransactionStatus;
  approvedBy?: string | TransactionUser;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface TransactionUser {
  _id: string;
  name: string;
}

export type TransactionType = 
  | 'FundCollection' 
  | 'Expense' 
  | 'GuestPayment' 
  | 'MatchExpense' 
  | 'MonthlyFee';

export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected';

// PaymentRequest types
export interface PaymentRequest {
  _id: string;
  teamId: string;
  userId: string | PaymentRequestUser;
  amount: number;
  description: string;
  proofImage: string;
  status: PaymentRequestStatus;
  reason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

export interface PaymentRequestUser {
  _id: string;
  name: string;
  email: string;
}

export type PaymentRequestStatus = 'Pending' | 'Approved' | 'Rejected';

// Finance Stats types
export interface FinanceStats {
  currentFundBalance: number;
  monthlyFeeAmount: number;
  totalOutstandingDebt: number;
  usersWithDebt: UserDebt[];
  recentTransactions: Transaction[];
}

export interface UserDebt {
  userId: string;
  name: string;
  email: string;
  debt: number;
}
