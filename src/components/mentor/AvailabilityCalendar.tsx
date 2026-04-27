import { useState } from 'react';
import Button from '../ui/Button';
import { useAvailabilityUpdate } from '../../hooks/queries/useMentors';
import type { AvailabilitySchedule } from '../../services/mentor.service';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

interface AvailabilityCalendarProps {
  mentorId: string;
  initialSchedule?: AvailabilitySchedule;
  initialIsAvailable?: boolean;
  onScheduleChange: (schedule: AvailabilitySchedule, isAvailable: boolean) => void;
}

function scheduleToSlots(schedule: AvailabilitySchedule): Set<string> {
  const set = new Set<string>();
  for (const [day, hours] of Object.entries(schedule)) {
    hours.forEach((h) => set.add(`${day}-${h}`));
  }
  return set;
}

function slotsToSchedule(slots: Set<string>): AvailabilitySchedule {
  const schedule: AvailabilitySchedule = {};
  slots.forEach((key) => {
    const [day, hour] = key.split(/-(?=\d)/);
    if (!schedule[day]) schedule[day] = [];
    schedule[day].push(hour);
  });
  return schedule;
}

export default function AvailabilityCalendar({
  mentorId,
  initialSchedule = {},
  initialIsAvailable = true,
  onScheduleChange,
}: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<Set<string>>(() => scheduleToSlots(initialSchedule));
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);

  const { save, saving } = useAvailabilityUpdate(mentorId, onScheduleChange);

  const toggle = (day: string, hour: string) => {
    const key = `${day}-${hour}`;
    setSlots((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    const schedule = slotsToSchedule(slots);
    const prevSlots = new Set(slots);
    const prevIsAvailable = isAvailable;

    // Optimistic update
    onScheduleChange(schedule, isAvailable);

    await save(schedule, isAvailable, () => {
      // Rollback
      setSlots(prevSlots);
      setIsAvailable(prevIsAvailable);
      onScheduleChange(slotsToSchedule(prevSlots), prevIsAvailable);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Availability</h3>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="rounded"
          />
          Available for bookings
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr>
              <th className="w-14 p-2 text-gray-400 font-normal" />
              {DAYS.map((d) => (
                <th key={d} className="p-2 text-gray-600 font-medium">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h}>
                <td className="p-2 text-gray-400 text-right pr-3">{h}</td>
                {DAYS.map((d) => (
                  <td key={d} className="p-1">
                    <button
                      onClick={() => toggle(d, h)}
                      className={`w-full h-7 rounded transition-colors ${
                        slots.has(`${d}-${h}`)
                          ? 'bg-indigo-500 hover:bg-indigo-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      aria-label={`${slots.has(`${d}-${h}`) ? 'Deselect' : 'Select'} ${d} ${h}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {slots.size} slot{slots.size !== 1 ? 's' : ''} selected
        </p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Availability'}
        </Button>
      </div>
    </div>
  );
}
