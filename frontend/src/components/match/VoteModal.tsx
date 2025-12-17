import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea, Alert } from '@/components/ui';
import { matchApi } from '@/api/match.api';
import type { Match, Vote } from '@/types/match.types';
import toast from 'react-hot-toast';

const voteSchema = z.object({
  status: z.enum(['Participate', 'Absent', 'Late']),
  guestCount: z.number().min(0).optional(),
  note: z.string().optional(),
});

type VoteFormInput = z.infer<typeof voteSchema>;

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  existingVote?: Vote;
  onSuccess: () => void;
}

export function VoteModal({ isOpen, onClose, match, existingVote, onSuccess }: VoteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isAfterDeadline = new Date() > new Date(match.votingDeadline);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<VoteFormInput>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      status: existingVote?.status || 'Participate',
      guestCount: existingVote?.guestCount || 0,
      note: existingVote?.note || '',
    },
  });

  const selectedStatus = watch('status');

  const onSubmit = async (data: VoteFormInput) => {
    try {
      setIsLoading(true);
      
      await matchApi.vote(match._id, {
        status: data.status,
        guestCount: data.status === 'Participate' ? data.guestCount : 0,
        note: data.note,
      });
      
      toast.success(existingVote ? 'Vote updated successfully!' : 'Vote recorded successfully!');
      reset();
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit vote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={existingVote ? 'Change Your Vote' : 'Vote for Match'}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {isAfterDeadline && (
            <Alert variant="warning" className="mb-4">
              Voting deadline has passed. Changes require approval from team leader.
            </Alert>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="Participate"
                  {...register('status')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium text-gray-900">✓ I will participate</span>
                  <p className="text-sm text-gray-500">I'll be there on time</p>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="Late"
                  {...register('status')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium text-gray-900">⏰ I'll be late</span>
                  <p className="text-sm text-gray-500">I'll join but might be late</p>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="Absent"
                  {...register('status')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium text-gray-900">✗ I cannot attend</span>
                  <p className="text-sm text-gray-500">I won't be able to make it</p>
                </div>
              </label>
            </div>
          </div>

          {selectedStatus === 'Participate' && (
            <Input
              type="number"
              label="Guest Count (Optional)"
              placeholder="0"
              error={errors.guestCount?.message}
              {...register('guestCount', { valueAsNumber: true })}
              helperText="Number of guests joining with you"
              min={0}
            />
          )}

          <Textarea
            label="Note (Optional)"
            placeholder="Add any additional notes..."
            error={errors.note?.message}
            {...register('note')}
            rows={3}
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {existingVote ? 'Update Vote' : 'Submit Vote'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
