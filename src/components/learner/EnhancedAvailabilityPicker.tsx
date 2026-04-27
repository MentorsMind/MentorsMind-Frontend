import { useMemo } from 'react';
import type { AvailabilitySlot } from '../../types';

interface EnhancedAvailabilityPickerProps {
  groupedAvailability: Record<string, AvailabilitySlot[]>;
  selectedDateKey: string | null;
  selectedSlotId: string | undefined;
  onSelect: (slot: AvailabilitySlot) => void;
  userTimezone: string;
  mentorTimezone: string;
}

export default function EnhancedAvailabilityPicker({
  groupedAvailability,
  selectedDateKey,
  selectedSlotId,
  onSelect,
  userTimezone,
  mentorTimezone,
}: EnhancedAvailabilityPickerProps) {
  const dateKeys = useMemo(
    () => Object.keys(groupedAvailability).sort(),
    [groupedAvailability]
  );

  const formatTimeInTimezone = (dateStr: string, timezone: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return dateStr;
    }
  };

  const formatDateLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (dateKeys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">📅</p>
        <p className="text-sm">No availability in the next 14 days</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dateKeys.map((dateKey) => {
        const slots = groupedAvailability[dateKey];
        const isSelected = selectedDateKey === dateKey;

        return (
          <div
            key={dateKey}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">
                {formatDateLabel(dateKey)}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(dateKey).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSlotSelected = selectedSlotId === slot.id;
                const userTime = formatTimeInTimezone(slot.start, userTimezone);
                const mentorTime =
                  userTimezone !== mentorTimezone
                    ? formatTimeInTimezone(slot.start, mentorTimezone)
                    : null;

                return (
                  <button
                    key={slot.id}
                    onClick={() => onSelect(slot)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      isSlotSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="font-semibold">{userTime}</div>
                    {mentorTime && (
                      <div
                        className={`text-xs mt-0.5 ${
                          isSlotSelected ? 'text-indigo-200' : 'text-gray-500'
                        }`}
                      >
                        ({mentorTime} mentor)
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
