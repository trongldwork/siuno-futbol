import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter, Button, Input } from '@/components/ui';
import { teamApi } from '@/api/team.api';
import toast from 'react-hot-toast';

const joinTeamSchema = z.object({
  inviteCode: z.string().min(6, 'Invite code must be at least 6 characters'),
});

type JoinTeamInput = z.infer<typeof joinTeamSchema>;

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinTeamModal({ isOpen, onClose, onSuccess }: JoinTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinTeamInput>({
    resolver: zodResolver(joinTeamSchema),
  });

  const onSubmit = async (data: JoinTeamInput) => {
    try {
      setIsLoading(true);
      await teamApi.joinTeam(data.inviteCode);
      toast.success('Successfully joined team!');
      reset();
      onClose();
      // Wait a bit for backend to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      await onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Team">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Input
            label="Invite Code"
            placeholder="Enter 6-digit invite code"
            error={errors.inviteCode?.message}
            {...register('inviteCode')}
            required
            helperText="Ask your team leader for the invite code"
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Join Team
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
