import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/layout';
import { Card, CardHeader, CardBody, Button, Input, Select, Alert } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

import { formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  position: z.enum(['Striker', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger']),
  dob: z.string().min(1, 'Date of birth is required'),
});

type ProfileFormInput = z.infer<typeof profileSchema>;

function ProfileContent() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      position: user?.position || 'Midfielder',
      dob: user?.dob ? user.dob.split('T')[0] : '',
    },
  });

  const onSubmit = async (_data: ProfileFormInput) => {
    try {
      setIsLoading(true);
      
      // Note: We need an update profile endpoint
      // For now, just show success
      toast.success('Profile would be updated (API endpoint needed)');
      
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">User not found</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">Manage your personal information</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                error={errors.name?.message}
                {...register('name')}
                disabled={!isEditing}
                required
              />

              <Input
                type="email"
                label="Email Address"
                error={errors.email?.message}
                {...register('email')}
                disabled={!isEditing}
                required
              />

              <Input
                type="tel"
                label="Phone Number"
                error={errors.phone?.message}
                {...register('phone')}
                disabled={!isEditing}
                required
              />

              <Input
                type="date"
                label="Date of Birth"
                error={errors.dob?.message}
                {...register('dob')}
                disabled={!isEditing}
                required
              />

              <Select
                label="Position"
                error={errors.position?.message}
                {...register('position')}
                disabled={!isEditing}
                required
              >
                <option value="Striker">Striker</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Defender">Defender</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Winger">Winger</option>
              </Select>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" isLoading={isLoading}>
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="font-medium text-gray-900">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Teams</p>
              <p className="font-medium text-gray-900">{user.teams?.length || 0}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">My Teams</h2>
        </CardHeader>
        <CardBody>
          {user.teams && user.teams.length > 0 ? (
            <div className="space-y-3">
              {user.teams.map((team) => (
                <div
                  key={team.teamId}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.teamName}</h3>
                      <p className="text-sm text-gray-600 mt-1">Role: {team.role}</p>
                    </div>
                    <div className="text-right">
                      {team.debt > 0 && (
                        <p className="text-sm font-semibold text-red-600">
                          Debt: {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(team.debt)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {formatDate(team.joinedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              You haven't joined any teams yet
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
