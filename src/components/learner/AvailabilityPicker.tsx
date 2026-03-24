import React from 'react';
import type { AvailabilitySlot } from '../../types';

interface AvailabilityPickerProps {
  groupedAvailability: Record<string, AvailabilitySlot[]>;
  selectedDateKey: string;
  selectedSlotId?: string;
  onSelect: (slot: AvailabilitySlot) => void;
}

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  groupedAvailability,
  selectedDateKey,
  selectedSlotId,
  onSelect,
}) => {
  const dates = Object.entries(groupedAvailability);

  if (dates.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
        No available slots match this duration right now. Try another duration or mentor.
      </div>
    );
  }

  const activeDateKey = groupedAvailability[selectedDateKey] ? selectedDateKey : dates[0][0];
  const activeSlots = groupedAvailability[activeDateKey] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {dates.map(([dateKey, slots]) => {
          const active = dateKey === activeDateKey;
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelect(slots[0])}
              className={`min-w-[120px] rounded-2xl border px-4 py-3 ${
                active ? 'border-stellar bg-stellar/5' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                {slots[0].dateLabel}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">{slots.length} slots</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeSlots.map((slot) => {
          const active = slot.id === selectedSlotId;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelect(slot)}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                active
                  ? 'border-stellar bg-stellar text-white shadow-xl shadow-stellar/20'
                  : 'border-gray-100 bg-white hover:border-stellar/30 hover:bg-gray-50'
              }`}
            >
              <div className={`text-sm font-black ${active ? 'text-white' : 'text-gray-900'}`}>
                {slot.label}
              </div>
              <div className={`mt-1 text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                {slot.dateLabel} · {slot.timezone}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityPicker;
