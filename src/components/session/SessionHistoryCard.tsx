import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import type { BookingRecord } from '../../hooks/useBookingHistory';
import type { SessionStatus } from '../../types';

const STATUS_BADGE: Record<SessionStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info' }> = {
  completed:   { label: 'Completed',   variant: 'success' },
  cancelled:   { label: 'Cancelled',   variant: 'danger'  },
  confirmed:   { label: 'Confirmed',   variant: 'info'    },
  pending:     { label: 'Pending',     variant: 'warning' },
  rescheduled: { label: 'Rescheduled', variant: 'warning' },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

interface Props {
  booking: BookingRecord;
  inDisputeWindow: boolean;
  onLeaveReview: (id: string) => void;
  onOpenDispute: (id: string, transactionId?: string | null) => void;
  onViewReceipt: (id: string) => void;
}

export default function SessionHistoryCard({ booking, inDisputeWindow, onLeaveReview, onOpenDispute, onViewReceipt }: Props) {
  const badge = STATUS_BADGE[booking.status];
  const isPast = booking.status === 'completed' || booking.status === 'cancelled';
  const canOpenDispute = Boolean(booking.transaction_id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {booking.mentorAvatar ? (
            <img src={booking.mentorAvatar} alt={booking.mentorName} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {booking.mentorName[0]}
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-gray-900">{booking.mentorName}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {fmt(booking.scheduledAt)} · {fmtTime(booking.scheduledAt)}
              </p>
            </div>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {booking.duration} min
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {booking.price} {booking.asset}
            </span>
          </div>

          {/* Cancellation reason */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
              <span className="font-medium">Reason: </span>{booking.cancellationReason}
            </p>
          )}

          {/* Quick actions */}
          {isPast && (
            <div className="flex flex-wrap gap-2 mt-3">
              {booking.status === 'completed' && !booking.hasReview && (
                <Button size="sm" variant="outline" onClick={() => onLeaveReview(booking.id)}>
                  ⭐ Leave Review
                </Button>
              )}
              {booking.status === 'completed' && inDisputeWindow && (
                canOpenDispute ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenDispute(booking.id, booking.transaction_id ?? null)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    🚩 Open Dispute
                  </Button>
                ) : (
                  <Tooltip content="A dispute can only be opened after payment is confirmed" position="top">
                    <span className="inline-flex">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenDispute(booking.id, booking.transaction_id ?? null)}
                        disabled
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        🚩 Open Dispute
                      </Button>
                    </span>
                  </Tooltip>
                )
              )}
              {booking.receiptUrl && (
                <Button size="sm" variant="ghost" onClick={() => onViewReceipt(booking.id)}>
                  🧾 View Receipt
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
