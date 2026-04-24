interface PublicAvailabilityProps {
  availability?: Array<{ date: string; duration: number }>;
}

const defaultAvailability = [
  { date: '2026-04-24T10:00:00Z', duration: 60 },
  { date: '2026-04-24T14:00:00Z', duration: 60 },
  { date: '2026-04-25T13:00:00Z', duration: 60 },
];

function formatSlot(dateStr: string, duration: number) {
  const date = new Date(dateStr);
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dayStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${dayStr} at ${timeStr} (${duration}min)`;
}

export default function PublicAvailability({ availability = defaultAvailability }: PublicAvailabilityProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8" id="availability">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Next Available Sessions</h2>

      {availability.length > 0 ? (
        <div className="space-y-3">
          {availability.map((slot, index) => (
            <div key={index} className="flex items-center justify-between rounded-2xl bg-stellar/5 px-5 py-3">
              <span className="text-sm font-medium text-gray-700">
                {formatSlot(slot.date, slot.duration)}
              </span>
              <button className="rounded-xl bg-stellar px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-stellar-dark transition">
                Book
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No upcoming availability</p>
          <button className="rounded-xl bg-stellar px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-stellar-dark transition">
            Request Availability
          </button>
        </div>
      )}
    </div>
  );
}
