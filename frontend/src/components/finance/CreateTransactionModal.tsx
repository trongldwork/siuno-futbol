import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalBody, ModalFooter, Button, Input, Select, Textarea, FileInput } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { financeApi } from '@/api/finance.api';
import toast from 'react-hot-toast';

const transactionSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  type: z.enum(['FundCollection', 'Expense', 'GuestPayment']),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  file: z.any().optional(),
});

type TransactionFormInput = z.infer<typeof transactionSchema>;

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTransactionModal({ isOpen, onClose, onSuccess }: CreateTransactionModalProps) {
  const { currentTeam, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'Expense',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: TransactionFormInput) => {
    if (!currentTeam) {
      toast.error('No team selected');
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('teamId', currentTeam.teamId);
      formData.append('amount', data.amount.toString());
      formData.append('type', data.type);
      formData.append('description', data.description);

      if (file) {
        formData.append('proofImage', file);
      }

      await financeApi.createTransaction(formData);
      
      // Refresh user profile to get updated team fund balance
      const { authApi } = await import('@/api/auth.api');
      const profileResponse = await authApi.getProfile();
      if (profileResponse.data?.user) {
        setUser(profileResponse.data.user);
      }
      
      // Refetch stats
      await onSuccess();
      
      toast.success('Transaction created successfully!');
      reset();
      setFile(null);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Transaction" size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Select
            label="Transaction Type"
            error={errors.type?.message}
            {...register('type')}
            required
          >
            <option value="FundCollection">Fund Collection</option>
            <option value="Expense">Expense</option>
            <option value="GuestPayment">Guest Payment</option>
          </Select>

          <Input
            type="number"
            label="Amount (VNĐ)"
            placeholder="0"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
            required
            helperText={
              selectedType === 'FundCollection' || selectedType === 'GuestPayment'
                ? 'This will increase the team fund'
                : 'This will decrease the team fund'
            }
          />

          <Textarea
            label="Description"
            placeholder="Enter transaction description"
            error={errors.description?.message}
            {...register('description')}
            required
          />

          <FileInput
            label="Proof Image (Optional)"
            accept="image/*,.pdf"
            onFileChange={setFile}
            helperText="Upload a proof image or receipt"
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Transaction
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
