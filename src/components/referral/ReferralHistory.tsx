import React from 'react';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
import type { ReferralInvite } from '../../types/referral.types';
import { referralService } from '../../services/referral.service';

interface ReferralHistoryProps {
  history: ReferralInvite[];
  isLoading?: boolean;
  onDelete?: (id: string) => Promise<void>;
}

export const ReferralHistory: React.FC<ReferralHistoryProps> = ({
  history,
  isLoading = false,
  onDelete,
}) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getRewardBadge = (status: string) => {
    switch (status) {
      case 'earned':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            <CheckCircle className="h-4 w-4" />
            Earned
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
        <p className="text-gray-500">No referrals yet. Start inviting friends!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Invitee Email
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Date Joined
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Reward Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Reward Amount
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((invite) => (
            <tr
              key={invite.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-4">
                <span className="text-sm text-gray-700">
                  {referralService.maskEmail(invite.inviteeEmail)}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className="text-sm text-gray-600">
                  {invite.joinedAt
                    ? formatDate(invite.joinedAt)
                    : 'Not joined yet'}
                </span>
              </td>
              <td className="px-4 py-4">
                {getRewardBadge(invite.rewardStatus)}
              </td>
              <td className="px-4 py-4">
                <span className="text-sm font-medium text-gray-900">
                  {invite.rewardAmount ? `$${invite.rewardAmount}` : '—'}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  onClick={() => handleDelete(invite.id)}
                  disabled={deletingId === invite.id}
                  className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50"
                  title="Delete referral record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
