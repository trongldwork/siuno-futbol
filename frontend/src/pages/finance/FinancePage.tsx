import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Users, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/layout';
import { Card, CardHeader, CardBody, Button, Loading, Badge, ConfirmDialog } from '@/components/ui';
import { CreateTransactionModal } from '@/components/finance/CreateTransactionModal';
import { financeApi } from '@/api/finance.api';
import { formatCurrency, formatDate } from '@/utils/format';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function FinancePageContent() {
  const { currentTeam } = useAuthStore();
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState<{ open: boolean; transactionId: string | null }>({ open: false, transactionId: null });
  const [confirmReject, setConfirmReject] = useState<{ open: boolean; transactionId: string | null }>({ open: false, transactionId: null });

  // Define canManageFinance first, before using it in queries
  const canManageFinance = currentTeam && (currentTeam.role === 'Leader' || currentTeam.role === 'Treasurer');

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['financeStats', currentTeam?.teamId],
    queryFn: async () => {
      if (!currentTeam) return null;
      const response = await financeApi.getStats(currentTeam.teamId);
      console.log('Finance stats response:', response);
      console.log('Stats data:', response.data?.stats);
      return response.data?.stats || null;
    },
    enabled: !!currentTeam,
  });

  const { data: pendingTransactions, refetch: refetchPending } = useQuery({
    queryKey: ['pendingTransactions', currentTeam?.teamId],
    queryFn: async () => {
      if (!currentTeam) return [];
      const response = await financeApi.getPendingTransactions(currentTeam.teamId);
      return response.data?.transactions || [];
    },
    enabled: !!currentTeam,
  });

  console.log('Stats in component:', stats);

  const handleApproveTransaction = async () => {
    if (!currentTeam || !confirmApprove.transactionId) return;
    try {
      await financeApi.approveTransaction(confirmApprove.transactionId, currentTeam.teamId);
      toast.success('Transaction approved successfully');
      refetch();
      refetchPending();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async () => {
    if (!currentTeam || !confirmReject.transactionId) return;
    try {
      await financeApi.rejectTransaction(confirmReject.transactionId, currentTeam.teamId);
      toast.success('Transaction rejected');
      refetchPending();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject transaction');
    }
  };

  if (!currentTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No team selected
            </h3>
            <p className="text-gray-600">
              Please select a team to view finance information
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading finance data..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="mt-2 text-gray-600">
            Manage team finances and transactions
          </p>
        </div>
        <Button onClick={() => setCreateTransactionOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Fund</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(currentTeam.currentFundBalance || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Debt</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(stats?.totalOutstandingDebt || 0)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Fee</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(currentTeam.monthlyFeeAmount)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Members with Debt</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.usersWithDebt?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions && pendingTransactions.length > 0 && (
        <Card className="mb-8 border-2 border-yellow-400">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              ⚠️ {canManageFinance ? 'Pending Transactions' : 'Your Pending Transactions'} ({pendingTransactions.length})
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {pendingTransactions.map((transaction: any) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-yellow-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="warning">Pending</Badge>
                      <Badge variant={
                        transaction.type === 'FundCollection' ? 'success' :
                        transaction.type === 'Expense' ? 'danger' : 'default'
                      }>
                        {transaction.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-900 mt-1">{transaction.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Created by: {typeof transaction.createdBy === 'string' ? 'Unknown' : transaction.createdBy.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'FundCollection' || transaction.type === 'GuestPayment'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'FundCollection' || transaction.type === 'GuestPayment' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    {canManageFinance && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmApprove({ open: true, transactionId: transaction._id })}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmReject({ open: true, transactionId: transaction._id })}
                        >
                          ✗ Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <Link 
              to="/finance/transactions" 
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTransactions.slice(0, 5).map((transaction: any) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        transaction.type === 'FundCollection' ? 'success' :
                        transaction.type === 'Expense' ? 'danger' : 'default'
                      }>
                        {transaction.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-900 mt-1">{transaction.description}</p>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'FundCollection' || transaction.type === 'GuestPayment'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'FundCollection' || transaction.type === 'GuestPayment' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No transactions yet
            </p>
          )}
        </CardBody>
      </Card>

      {/* Payment Requests Note */}
      {canManageFinance && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              Payment Requests
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-center text-gray-500 py-8">
              Payment requests feature will be available soon
            </p>
          </CardBody>
        </Card>
      )}

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={createTransactionOpen}
        onClose={() => setCreateTransactionOpen(false)}
        onSuccess={() => {
          refetch();
          refetchPending();
        }}
      />

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        isOpen={confirmApprove.open}
        onClose={() => setConfirmApprove({ open: false, transactionId: null })}
        onConfirm={handleApproveTransaction}
        title="Approve Transaction"
        message="Are you sure you want to approve this transaction? The team fund balance will be updated immediately."
        confirmText="Approve"
        cancelText="Cancel"
        variant="primary"
      />

      {/* Confirm Reject Dialog */}
      <ConfirmDialog
        isOpen={confirmReject.open}
        onClose={() => setConfirmReject({ open: false, transactionId: null })}
        onConfirm={handleRejectTransaction}
        title="Reject Transaction"
        message="Are you sure you want to reject this transaction? This action cannot be undone."
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default function FinancePage() {
  return (
    <ProtectedRoute>
      <FinancePageContent />
    </ProtectedRoute>
  );
}
