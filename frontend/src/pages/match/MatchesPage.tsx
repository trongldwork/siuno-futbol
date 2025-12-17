import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/layout';
import { Button, Card, CardBody, Loading, Select } from '@/components/ui';
import { MatchCard } from '@/components/match/MatchCard';
import { CreateMatchModal } from '@/components/match/CreateMatchModal';
import { matchApi } from '@/api/match.api';
import type { Match } from '@/types/match.types';

function MatchesPageContent() {
  const queryClient = useQueryClient();
  const { currentTeam } = useAuthStore();
  const [status, setStatus] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['matches', currentTeam?.teamId, status],
    queryFn: async () => {
      if (!currentTeam) return [];
      try {
        const response = await matchApi.getMatches(currentTeam.teamId, status || undefined);
        return response.data?.matches || [];
      } catch (error) {
        console.error('Error fetching matches:', error);
        return [];
      }
    },
    enabled: !!currentTeam,
  });

  const handleMatchCreated = () => {
    // Invalidate all match queries to refetch
    queryClient.invalidateQueries({ queryKey: ['matches'] });
  };

  const handleMatchAction = () => {
    // Invalidate all match queries to refetch
    queryClient.invalidateQueries({ queryKey: ['matches'] });
  };

  const canCreateMatch = currentTeam && (currentTeam.role === 'Leader' || currentTeam.role === 'Treasurer');

  if (!currentTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No team selected
            </h3>
            <p className="text-gray-600 mb-6">
              Please select a team from the navigation bar to view matches
            </p>
            <Button onClick={() => window.location.href = '/teams'}>
              Go to Teams
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading matches..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <p className="mt-2 text-gray-600">
            Manage and vote for upcoming matches
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-40"
            >
              <option value="">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </div>
          {canCreateMatch && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Match
            </Button>
          )}
        </div>
      </div>

      {/* Matches List */}
      {!matches || matches.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚽</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No matches yet
            </h3>
            <p className="text-gray-600 mb-6">
              {canCreateMatch 
                ? 'Create your first match to get started'
                : 'No matches available at the moment'
              }
            </p>
            {canCreateMatch && (
              <Button onClick={() => setCreateModalOpen(true)}>
                Create Match
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard key={match._id} match={match} onAction={handleMatchAction} />
          ))}
        </div>
      )}

      {/* Create Match Modal */}
      {canCreateMatch && (
        <CreateMatchModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleMatchCreated}
        />
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <ProtectedRoute>
      <MatchesPageContent />
    </ProtectedRoute>
  );
}
