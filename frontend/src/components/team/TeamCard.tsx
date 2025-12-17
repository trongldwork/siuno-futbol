import { useNavigate } from 'react-router-dom';
import { DollarSign, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { TeamMembership } from '@/types/user.types';
import { Card, CardBody, Badge } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';

interface TeamCardProps {
  team: TeamMembership;
  onAction: () => void;
}

export function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(team.inviteCode);
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Leader':
        return 'primary';
      case 'Treasurer':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/teams/${team.teamId}`)}
    >
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{team.teamName}</h3>
          <Badge variant={getRoleBadgeVariant(team.role)}>
            {team.role}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Fund Balance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Fund Balance
            </span>
            <span className="font-semibold text-green-600">
              {formatCurrency(team.currentFundBalance)}
            </span>
          </div>

          {/* Monthly Fee */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Monthly Fee</span>
            <span className="font-medium">{formatCurrency(team.monthlyFeeAmount)}</span>
          </div>

          {/* Debt */}
          {team.debt > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Debt</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(team.debt)}
              </span>
            </div>
          )}

          {/* Invite Code */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Invite Code</span>
              <button
                onClick={handleCopyInviteCode}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {team.inviteCode}
                </code>
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Status */}
          {!team.isActive && (
            <div className="pt-2">
              <Badge variant="danger" size="sm">Inactive</Badge>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
