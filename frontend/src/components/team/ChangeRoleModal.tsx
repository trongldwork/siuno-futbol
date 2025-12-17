import { useState } from 'react';
import { Modal, Button, Select } from '@/components/ui';
import type { TeamRole } from '@/types/team.types';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newRole: TeamRole) => void;
  memberName: string;
  currentRole: TeamRole;
  isLoading?: boolean;
}

export function ChangeRoleModal({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  currentRole,
  isLoading = false,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<TeamRole>(currentRole);

  const handleConfirm = () => {
    if (selectedRole === currentRole) {
      return;
    }
    onConfirm(selectedRole);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Member Role">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Change role for <span className="font-semibold">{memberName}</span>
          </p>
          
          <Select
            label="New Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
            disabled={isLoading}
          >
            <option value="Member">Member</option>
            <option value="Treasurer">Treasurer</option>
            <option value="Leader">Leader</option>
          </Select>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Role Descriptions:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li><strong>Leader:</strong> Full control over team, can manage members and finances</li>
              <li><strong>Treasurer:</strong> Can manage team finances and transactions</li>
              <li><strong>Member:</strong> Basic access, can view team info and vote</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || selectedRole === currentRole}
            isLoading={isLoading}
          >
            Change Role
          </Button>
        </div>
      </div>
    </Modal>
  );
}
