import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter, Button, Input } from '@/components/ui';
import { teamApi } from '@/api/team.api';
import toast from 'react-hot-toast';

const createTeamSchema = z.object({
  teamName: z.string().min(3, 'Team name must be at least 3 characters'),
  monthlyFeeAmount: z.number().min(0, 'Monthly fee must be positive'),
});

type CreateTeamFormInput = z.infer<typeof createTeamSchema>;

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTeamFormInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      monthlyFeeAmount: 0,
    },
  });

  const onSubmit = async (data: CreateTeamFormInput) => {
    try {
      setIsLoading(true);
      const response = await teamApi.createTeam(data);
      console.log('Team created:', response);
      toast.success('Team created successfully!');
      reset();
      onClose();
      // Wait a bit for backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Calling onSuccess to refetch...');
      await onSuccess();
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Team">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Input
            label="Team Name"
            placeholder="Enter team name"
            error={errors.teamName?.message}
            {...register('teamName')}
            required
          />

          <Input
            type="number"
            label="Monthly Fee Amount (VNĐ)"
            placeholder="0"
            error={errors.monthlyFeeAmount?.message}
            {...register('monthlyFeeAmount', { valueAsNumber: true })}
            helperText="Optional: Set a monthly fee for team members"
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Team
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
