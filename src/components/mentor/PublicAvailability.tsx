const availability = [
  { day: 'Monday',    slots: ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM'] },
  { day: 'Tuesday',   slots: ['1:00 PM - 3:00 PM'] },
  { day: 'Wednesday', slots: [] },
  { day: 'Thursday',  slots: ['9:00 AM - 11:00 AM'] },
  { day: 'Friday',    slots: ['3:00 PM - 5:00 PM'] },
  { day: 'Saturday',  slots: [] },
  { day: 'Sunday',    slots: [] },
];

export default function PublicAvailability() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Availability</h2>

      <div className="space-y-3">
        {availability.map(({ day, slots }) => (
          <div key={day} className="flex items-start gap-4">
            {/* Day label */}
            <span className="w-28 shrink-0 text-sm font-semibold text-gray-500 pt-1">{day}</span>

            {/* Slots or unavailable */}
            {slots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <span
                    key={slot}
                    className="rounded-full bg-stellar/10 px-3 py-1 text-xs font-semibold text-stellar"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-400">
                Unavailable
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
