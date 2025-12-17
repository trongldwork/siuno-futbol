import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardBody, Badge } from '@/components/ui';
import { formatDate, formatTime } from '@/utils/format';
import type { Match } from '@/types/match.types';

interface MatchCardProps {
  match: Match;
  onAction: () => void;
}

export function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'success';
      case 'Completed':
        return 'default';
      case 'Cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const isVotingOpen = new Date() < new Date(match.votingDeadline);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/matches/${match._id}`)}
    >
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              vs {match.opponentName}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(match.time)}
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(match.status)}>
            {match.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{formatTime(match.time)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{match.location}</span>
          </div>

          {match.participantCount !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{match.participantCount} participants</span>
            </div>
          )}
        </div>

        {/* Voting Deadline */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Voting {isVotingOpen ? 'closes' : 'closed'}
            </span>
            <span className={`text-xs font-medium ${isVotingOpen ? 'text-green-600' : 'text-red-600'}`}>
              {formatDate(match.votingDeadline)}
            </span>
          </div>
        </div>

        {match.isLocked && (
          <div className="mt-2">
            <Badge variant="warning" size="sm">Locked</Badge>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
