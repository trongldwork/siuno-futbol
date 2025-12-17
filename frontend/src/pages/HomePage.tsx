import { useAuthStore } from '@/stores/authStore';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout';
import { Card, CardHeader, CardBody, Loading, Badge } from '@/components/ui';
import { matchApi } from '@/api/match.api';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Match } from '@/types/match.types';

function DashboardContent() {
  const { user, currentTeam } = useAuthStore();

  // Fetch upcoming matches
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['matches', currentTeam?.teamId, 'Upcoming'],
    queryFn: async () => {
      if (!currentTeam) return [];
      const response = await matchApi.getMatches(currentTeam.teamId, 'Upcoming');
      return response.data?.matches || [];
    },
    enabled: !!currentTeam,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! ⚽
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your team
        </p>
      </div>

      {/* Current Team Info */}
      {currentTeam ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Team</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {currentTeam.teamName}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <Badge variant="primary" size="sm" className="mt-2">
                  {currentTeam.role}
                </Badge>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Fund Balance</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(currentTeam.currentFundBalance)}
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
                    <p className="text-sm text-gray-600">Monthly Fee</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(currentTeam.monthlyFeeAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Your Debt</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      currentTeam.debt > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {formatCurrency(currentTeam.debt)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    currentTeam.debt > 0 ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <AlertCircle className={`h-6 w-6 ${
                      currentTeam.debt > 0 ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upcoming Matches
                </h2>
                <Link 
                  to="/matches" 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : matches && matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.slice(0, 5).map((match) => (
                    <Link
                      key={match._id}
                      to={`/matches/${match._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            vs {match.opponentName}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(match.time)} • {match.location}
                          </p>
                        </div>
                        <Badge variant={
                          new Date() < new Date(match.votingDeadline) 
                            ? 'success' 
                            : 'default'
                        }>
                          {new Date() < new Date(match.votingDeadline) 
                            ? 'Vote Open' 
                            : 'Voting Closed'
                          }
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No upcoming matches
                </p>
              )}
            </CardBody>
          </Card>
        </>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No team selected
            </h3>
            <p className="text-gray-600 mb-6">
              Select a team from the navigation bar or create/join one to get started
            </p>
            <Link
              to="/teams"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Teams
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
