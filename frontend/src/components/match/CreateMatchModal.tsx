import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { matchApi } from '@/api/match.api';
import toast from 'react-hot-toast';

const createMatchSchema = z.object({
  opponentName: z.string().min(2, 'Opponent name is required'),
  time: z.string().min(1, 'Match time is required'),
  location: z.string().min(2, 'Location is required'),
  votingDeadline: z.string().min(1, 'Voting deadline is required'),
  contactPerson: z.string().optional(),
  matchCost: z.number().min(0).optional(),
});

type CreateMatchFormInput = z.infer<typeof createMatchSchema>;

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMatchModal({ isOpen, onClose, onSuccess }: CreateMatchModalProps) {
  const { currentTeam } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateMatchFormInput>({
    resolver: zodResolver(createMatchSchema),
  });

  const onSubmit = async (data: CreateMatchFormInput) => {
    if (!currentTeam) {
      toast.error('No team selected');
      return;
    }

    try {
      setIsLoading(true);
      await matchApi.createMatch({
        teamId: currentTeam.teamId,
        opponentName: data.opponentName,
        time: data.time,
        location: data.location,
        votingDeadline: data.votingDeadline,
        contactPerson: data.contactPerson,
      });
      toast.success('Match created successfully!');
      reset();
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create match');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Get minimum datetime for match (current time)
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Match" size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Input
            label="Opponent Name"
            placeholder="Enter opponent team name"
            error={errors.opponentName?.message}
            {...register('opponentName')}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              label="Match Date & Time"
              error={errors.time?.message}
              {...register('time')}
              min={minDateTime}
              required
            />

            <Input
              type="datetime-local"
              label="Voting Deadline"
              error={errors.votingDeadline?.message}
              {...register('votingDeadline')}
              min={minDateTime}
              required
              helperText="Set when voting closes"
            />
          </div>

          <Input
            label="Location"
            placeholder="Enter match location"
            error={errors.location?.message}
            {...register('location')}
            required
          />

          <Input
            label="Contact Person (Optional)"
            placeholder="Enter contact person name"
            error={errors.contactPerson?.message}
            {...register('contactPerson')}
          />

          <Input
            type="number"
            label="Match Cost (Optional)"
            placeholder="0"
            error={errors.matchCost?.message}
            {...register('matchCost', { valueAsNumber: true })}
            helperText="Cost per person in VNĐ"
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Match
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
