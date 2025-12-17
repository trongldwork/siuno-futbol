import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout';
import { Card, CardHeader, CardBody, Button, Loading, Badge, Alert } from '@/components/ui';
import { VoteModal } from '@/components/match/VoteModal';
import { useAuthStore } from '@/stores/authStore';
import { matchApi } from '@/api/match.api';
import { formatDate, formatTime, formatDateTime } from '@/utils/format';
import type { Match } from '@/types/match.types';
import type { Vote } from '@/types/vote.types';
import toast from 'react-hot-toast';

function MatchDetailContent() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, currentTeam } = useAuthStore();
  const [voteModalOpen, setVoteModalOpen] = useState(false);

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const response = await matchApi.getMatchById(matchId!);
      if (!response.data?.match) {
        throw new Error('Match not found');
      }
      return response.data.match;
    },
    enabled: !!matchId,
  }) as { data: Match | undefined; isLoading: boolean };

  const handleVoteSuccess = () => {
    // Invalidate and refetch match details
    queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    // Also invalidate matches list
    queryClient.invalidateQueries({ queryKey: ['matches'] });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    
    try {
      await matchApi.deleteMatch(matchId!);
      toast.success('Match deleted successfully');
      navigate('/matches');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete match');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading match details..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">Match not found</Alert>
      </div>
    );
  }

  console.log('Match data:', match);
  console.log('Match status:', match.status);
  console.log('Voting deadline:', match.votingDeadline);
  console.log('Is voting open:', new Date() < new Date(match.votingDeadline));

  const userVote = match.votes?.find((v: Vote) => 
    typeof v.userId === 'string' ? v.userId === user?.id : v.userId._id === user?.id
  );
  
  const isVotingOpen = new Date() < new Date(match.votingDeadline);
  const canManage = currentTeam && (currentTeam.role === 'Leader' || currentTeam.role === 'Treasurer');

  // Calculate total guests
  const totalGuests = match.votes?.reduce((total, vote: Vote) => {
    return total + (vote.guestCount || 0);
  }, 0) || 0;

  // Calculate total participants (people participating/late + all guests)
  const totalParticipants = match.votes?.reduce((total, vote: Vote) => {
    if (vote.status === 'Participate' || vote.status === 'Late') {
      return total + 1 + (vote.guestCount || 0);
    }
    return total;
  }, 0) || 0;

  const getVoteStatusBadge = (status: string) => {
    switch (status) {
      case 'Participate':
        return <Badge variant="success">Participating</Badge>;
      case 'Absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'Late':
        return <Badge variant="warning">Late</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/matches')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              vs {match.opponentName}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={match.status === 'Upcoming' ? 'success' : 'default'}>
                {match.status}
              </Badge>
              {match.isLocked && <Badge variant="warning">Locked</Badge>}
            </div>
          </div>
          
          {canManage && match.status === 'Upcoming' && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Vote Action Banner */}
      {isVotingOpen && !userVote && (
        <Card className="mb-6 border-2 border-yellow-400 bg-yellow-50">
          <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">⚠️ You haven't voted yet!</p>
              <p className="text-sm text-gray-600">
                Please vote before the deadline: {formatDateTime(match.votingDeadline)}
              </p>
            </div>
            <Button size="lg" onClick={() => setVoteModalOpen(true)}>
              Vote Now
            </Button>
          </CardBody>
        </Card>
      )}

      {userVote && (
        <Card className="mb-6 border-2 border-blue-400 bg-blue-50">
          <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">✓</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Your vote recorded</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  {getVoteStatusBadge(userVote.status)}
                </div>
              </div>
            </div>
            {isVotingOpen && (
              <Button 
                variant="outline"
                onClick={() => setVoteModalOpen(true)}
              >
                Change Vote
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Match Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(match.time)} at {formatTime(match.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{match.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Voting Deadline</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(match.votingDeadline)}
                  </p>
                  <p className={`text-sm ${isVotingOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {isVotingOpen ? 'Voting is open' : 'Voting closed'}
                  </p>
                </div>
              </div>
            
              {match.contactPerson && (
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium text-gray-900">{match.contactPerson}</p>
                  </div>
                </div>
              )}

              {(match.matchCost || 0) > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5 text-gray-400 mt-0.5">💰</div>
                  <div>
                    <p className="text-sm text-gray-600">Match Cost</p>
                    <p className="font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(match.matchCost || 0)}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Votes List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Votes</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-600">✓ {match.participantCount || 0} Participating</span>
                  <span className="text-red-600">✗ {match.absentCount || 0} Absent</span>
                  <span className="text-yellow-600">⏰ {match.lateCount || 0} Late</span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {match.votes && match.votes.length > 0 ? (
                <div className="space-y-3">
                  {match.votes.map((vote: Vote) => {
                    const userName = typeof vote.userId === 'string' ? 'Unknown' : vote.userId.name;
                    const userPosition = typeof vote.userId === 'string' ? '' : vote.userId.position;
                    
                    return (
                      <div
                        key={vote._id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{userName}</p>
                          {userPosition && (
                            <p className="text-sm text-gray-500">{userPosition}</p>
                          )}
                          {vote.note && (
                            <p className="text-sm text-gray-600 mt-1">Note: {vote.note}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {(vote.guestCount || 0) > 0 && (
                            <span className="text-sm text-gray-600">
                              +{vote.guestCount} guest{(vote.guestCount || 0) > 1 ? 's' : ''}
                            </span>
                          )}
                          {getVoteStatusBadge(vote.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No votes yet</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vote Action */}
          {match.status === 'Upcoming' && (
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-4">Your Vote</h3>
                {userVote ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">{getVoteStatusBadge(userVote.status)}</div>
                    </div>
                    {isVotingOpen && (
                      <Button
                        fullWidth
                        variant="outline"
                        onClick={() => setVoteModalOpen(true)}
                      >
                        Change Vote
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => setVoteModalOpen(true)}
                    disabled={!isVotingOpen}
                  >
                    {isVotingOpen ? 'Vote Now' : 'Voting Closed'}
                  </Button>
                )}
              </CardBody>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Statistics</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Votes</span>
                <span className="font-semibold">{match.votes?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Participants</span>
                <span className="font-semibold text-green-600">{match.participantCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Absent</span>
                <span className="font-semibold text-red-600">{match.absentCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Late</span>
                <span className="font-semibold text-yellow-600">{match.lateCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Guests</span>
                <span className="font-semibold text-purple-600">{totalGuests}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                <span className="text-gray-900 font-medium">Total Participants</span>
                <span className="font-bold text-blue-600 text-lg">{totalParticipants}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Includes participants + late + guests
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Vote Modal */}
      <VoteModal
        isOpen={voteModalOpen}
        onClose={() => setVoteModalOpen(false)}
        match={match}
        existingVote={userVote}
        onSuccess={handleVoteSuccess}
      />
    </div>
  );
}

export default function MatchDetailPage() {
  return (
    <ProtectedRoute>
      <MatchDetailContent />
    </ProtectedRoute>
  );
}
