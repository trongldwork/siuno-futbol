import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/layout';
import { Button, Card, CardBody, Loading } from '@/components/ui';
import { TeamCard } from '@/components/team/TeamCard';
import { CreateTeamModal } from '@/components/team/CreateTeamModal';
import { JoinTeamModal } from '@/components/team/JoinTeamModal';
import { authApi } from '@/api/auth.api';

function TeamsPageContent() {
  const { user, setUser } = useAuthStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Refresh user data to get updated teams
  const { isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authApi.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleTeamAction = async () => {
    // Refetch profile to get updated teams
    console.log('Refetching teams...');
    const result = await refetch();
    console.log('Teams refetched:', result.data?.data?.user?.teams);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading teams..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
          <p className="mt-2 text-gray-600">
            Manage your teams and create new ones
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setJoinModalOpen(true)} variant="outline">
            Join Team
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Teams List */}
      {!user?.teams || user.teams.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚽</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No teams yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create a new team or join an existing one to get started
            </p>
            <div className="flex justify-center space-x-3">
              <Button onClick={() => setJoinModalOpen(true)} variant="outline">
                Join Team
              </Button>
              <Button onClick={() => setCreateModalOpen(true)}>
                Create Team
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.teams.map((team) => (
            <TeamCard key={team.teamId} team={team} onAction={handleTeamAction} />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleTeamAction}
      />
      <JoinTeamModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSuccess={handleTeamAction}
      />
    </div>
  );
}

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsPageContent />
    </ProtectedRoute>
  );
}
