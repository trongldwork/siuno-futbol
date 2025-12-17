import { useQuery } from '@tanstack/react-query';
import { Users, Shield, DollarSign, AlertCircle, Activity } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout';
import { Card, CardHeader, CardBody, Loading, Badge } from '@/components/ui';
import { adminApi } from '@/api/admin.api';
import { formatCurrency } from '@/utils/format';

function AdminDashboardContent() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminApi.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  const dashboardStats = stats?.data?.stats;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardStats?.totalUsers || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teams</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardStats?.totalTeams || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardStats?.totalMembers || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {dashboardStats?.pendingPayments || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fund</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(dashboardStats?.totalFund || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
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
                  {formatCurrency(dashboardStats?.totalDebt || 0)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Teams</span>
                <Badge variant="success">
                  {dashboardStats?.systemHealth?.activeTeams || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Members</span>
                <Badge variant="success">
                  {dashboardStats?.systemHealth?.activeMembers || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <p className="font-medium text-gray-900">View Teams</p>
                <p className="text-sm text-gray-600">Browse all teams in the system</p>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <p className="font-medium text-gray-900">Financial Reports</p>
                <p className="text-sm text-gray-600">View financial overview and reports</p>
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireRole="SuperAdmin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
