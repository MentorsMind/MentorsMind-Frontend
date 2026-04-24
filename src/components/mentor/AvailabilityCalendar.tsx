import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

type Slot = { day: string; hour: string };

export default function AvailabilityCalendar() {
  const [slots, setSlots] = useState<Slot[]>([]);

  const toggle = (day: string, hour: string) => {
    const key = `${day}-${hour}`;
    setSlots(prev =>
      prev.some(s => `${s.day}-${s.hour}` === key)
        ? prev.filter(s => `${s.day}-${s.hour}` !== key)
        : [...prev, { day, hour }]
    );
  };

  const isActive = (day: string, hour: string) =>
    slots.some(s => s.day === day && s.hour === hour);

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse w-full">
        <thead>
          <tr>
            <th className="w-14 p-2 text-gray-400 font-normal" />
            {DAYS.map(d => <th key={d} className="p-2 text-gray-600 font-medium">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(h => (
            <tr key={h}>
              <td className="p-2 text-gray-400 text-right pr-3">{h}</td>
              {DAYS.map(d => (
                <td key={d} className="p-1">
                  <button
                    onClick={() => toggle(d, h)}
                    className={`w-full h-7 rounded transition-colors
                      ${isActive(d, h) ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-3">{slots.length} slot{slots.length !== 1 ? 's' : ''} selected</p>
    </div>
  );
}
