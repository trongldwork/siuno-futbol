import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, DollarSign, Copy, Check, UserMinus, Trash2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout';
import { Card, CardHeader, CardBody, Button, Loading, Badge, Alert } from '@/components/ui';
import { ChangeRoleModal } from '@/components/team/ChangeRoleModal';
import { useAuthStore } from '@/stores/authStore';
import { teamApi } from '@/api/team.api';
import { authApi } from '@/api/auth.api';
import { formatCurrency, formatDate } from '@/utils/format';
import type { TeamRole } from '@/types/team.types';
import toast from 'react-hot-toast';

function TeamDetailContent() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [changeRoleModal, setChangeRoleModal] = useState<{
    isOpen: boolean;
    memberId: string;
    memberName: string;
    currentRole: TeamRole;
  }>({
    isOpen: false,
    memberId: '',
    memberName: '',
    currentRole: 'Member',
  });
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Refetch profile to get latest team info (including role changes)
  const { isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', teamId],
    queryFn: async () => {
      const response = await authApi.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return response.data?.user || null;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Get team info from user's teams
  const team = user?.teams?.find(t => t.teamId === teamId);

  // Fetch team members
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['teamMembers', teamId],
    queryFn: async () => {
      if (!teamId) return { members: [], total: 0 };
      try {
        const response = await teamApi.getTeamMembers(teamId);
        return response.data || { members: [], total: 0 };
      } catch (error: any) {
        console.error('Error fetching team members:', error);
        toast.error(error?.response?.data?.message || 'Failed to load team members');
        return { members: [], total: 0 };
      }
    },
    enabled: !!teamId,
  });

  const isLoading = isLoadingProfile || isLoadingMembers;

  const handleCopyInviteCode = () => {
    if (!team) return;
    navigator.clipboard.writeText(team.inviteCode);
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    
    if (team.debt > 0) {
      toast.error(`You cannot leave the team with outstanding debt of ${formatCurrency(team.debt)}`);
      return;
    }

    if (!window.confirm('Are you sure you want to leave this team?')) return;

    try {
      await teamApi.leaveTeam(teamId!);
      
      // Refresh user data
      const response = await authApi.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      toast.success('Left team successfully');
      navigate('/teams');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave team');
    }
  };

  const handleRenewInviteCode = async () => {
    if (!window.confirm('Are you sure you want to renew the invite code? The old code will no longer work.')) return;

    try {
      await teamApi.renewInviteCode(teamId!);
      
      // Refresh user data
      const response = await authApi.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      toast.success('Invite code renewed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to renew invite code');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone. All members must be removed first.')) return;

    try {
      await teamApi.deleteTeam(teamId!);
      
      // Refresh user data
      const response = await authApi.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      toast.success('Team deleted successfully');
      navigate('/teams');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleOpenChangeRole = (memberId: string, memberName: string, currentRole: TeamRole) => {
    setChangeRoleModal({
      isOpen: true,
      memberId,
      memberName,
      currentRole,
    });
  };

  const handleChangeRole = async (newRole: TeamRole) => {
    setIsChangingRole(true);
    try {
      await teamApi.changeRole({
        teamId: teamId!,
        userId: changeRoleModal.memberId,
        newRole,
      });
      
      toast.success(`Role changed to ${newRole} successfully`);
      
      // Refresh members list and user profile
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
      const response = await authApi.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
      }
      
      setChangeRoleModal({ isOpen: false, memberId: '', memberName: '', currentRole: 'Member' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change role');
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleKickMember = async (memberId: string, memberName: string, memberDebt: number) => {
    // Validation: Cannot kick yourself
    if (memberId === user?._id) {
      toast.error('You cannot kick yourself from the team');
      return;
    }

    // Validation: Cannot kick member with debt
    if (memberDebt > 0) {
      toast.error(
        `Cannot kick ${memberName}. Member has outstanding debt of ${formatCurrency(memberDebt)}`
      );
      return;
    }

    // Confirmation
    if (!window.confirm(`Are you sure you want to kick ${memberName} from the team?`)) {
      return;
    }

    try {
      await teamApi.kickMember({
        teamId: teamId!,
        userId: memberId,
      });
      
      toast.success(`${memberName} has been kicked from the team`);
      
      // Refresh members list and user profile
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
      const response = await authApi.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to kick member');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" text="Loading team details..." />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">Team not found</Alert>
      </div>
    );
  }

  const isLeader = team.role === 'Leader';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/teams')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.teamName}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={
                team.role === 'Leader' ? 'primary' : 
                team.role === 'Treasurer' ? 'info' : 'default'
              }>
                {team.role}
              </Badge>
              {!team.isActive && <Badge variant="danger">Inactive</Badge>}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isLeader && (
              <Button variant="danger" onClick={handleDeleteTeam}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </Button>
            )}
            {!isLeader && (
              <Button variant="danger" onClick={handleLeaveTeam}>
                <UserMinus className="h-4 w-4 mr-2" />
                Leave Team
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fund Balance</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(team.currentFundBalance)}
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
                  {formatCurrency(team.monthlyFeeAmount)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
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
                  team.debt > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatCurrency(team.debt)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                team.debt > 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <DollarSign className={`h-6 w-6 ${
                  team.debt > 0 ? 'text-red-600' : 'text-gray-600'
                }`} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Invite Code Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Invite Code</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Share this code with others to invite them to your team
              </p>
              <div className="flex items-center space-x-3">
                <code className="bg-gray-100 px-4 py-2 rounded-lg text-2xl font-mono font-bold">
                  {team.inviteCode}
                </code>
                <Button variant="outline" onClick={handleCopyInviteCode}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            {isLeader && (
              <Button variant="outline" onClick={handleRenewInviteCode}>
                Renew Code
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>{membersData?.total || 0} Members</span>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <Loading text="Loading team members..." />
              </div>
            ) : membersData?.members && membersData.members.length > 0 ? (
              membersData.members.map((member) => {
                const isCurrentUser = member.id === user?._id;
                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg ${
                      isCurrentUser
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'border border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">
                            {member.name}
                            {isCurrentUser && ' (You)'}
                          </p>
                          <Badge
                            variant={
                              member.role === 'Leader'
                                ? 'primary'
                                : member.role === 'Treasurer'
                                ? 'info'
                                : 'default'
                            }
                          >
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-sm text-gray-500 mt-1">{member.position}</p>
                      </div>
                      <div className="text-right">
                        {member.debt > 0 && (
                          <p className="text-sm font-semibold text-red-600">
                            Debt: {formatCurrency(member.debt)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {formatDate(member.joinedAt)}
                        </p>
                        {isLeader && !isCurrentUser && (
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenChangeRole(member.id, member.name, member.role)}
                            >
                              Change Role
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleKickMember(member.id, member.name, member.debt)}
                            >
                              Kick
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No members found</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={changeRoleModal.isOpen}
        onClose={() => setChangeRoleModal({ isOpen: false, memberId: '', memberName: '', currentRole: 'Member' })}
        onConfirm={handleChangeRole}
        memberName={changeRoleModal.memberName}
        currentRole={changeRoleModal.currentRole}
        isLoading={isChangingRole}
      />
    </div>
  );
}

export default function TeamDetailPage() {
  return (
    <ProtectedRoute>
      <TeamDetailContent />
    </ProtectedRoute>
  );
}
