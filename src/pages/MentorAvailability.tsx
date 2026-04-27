import { useState } from 'react';
import { useAvailability, type TimeSlot } from '../hooks/useAvailability';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { TimezoneSelector } from '../components/mentor/TimezoneSelector';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 – 22:00

function slotColor(slot: TimeSlot | undefined, isPending: boolean): string {
  if (!slot) return isPending ? 'bg-indigo-200 hover:bg-indigo-300' : 'bg-gray-100 hover:bg-gray-200';
  if (slot.isBooked)  return 'bg-emerald-400 cursor-not-allowed';
  if (slot.isBlocked) return 'bg-red-300 cursor-not-allowed';
  if (slot.recurring) return 'bg-violet-500 hover:bg-violet-600';
  return 'bg-indigo-500 hover:bg-indigo-600';
}

function fmt(hour: number) {
  const h = hour % 12 || 12;
  return `${h}${hour < 12 ? 'am' : 'pm'}`;
}

export default function MentorAvailability() {
  const { user } = useAuth();
  const {
    slots, pending, timezone, setTimezone,
    syncedCalendars, conflicts, loading, saving,
    hasPendingChanges, toggleSlot, save, connectCalendar, discardChanges,
  } = useAvailability(user?.id ?? '');

  const [recurring, setRecurring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getSlot = (day: number, hour: number) =>
    slots.find((s) => s.day === day && s.hour === hour);

  const isPendingAdd = (day: number, hour: number) =>
    pending.some((p) => !p.id.startsWith('rm-') && p.day === day && p.hour === hour);

  const handleCellClick = (day: number, hour: number) => {
    const s = getSlot(day, hour);
    if (s?.isBooked || s?.isBlocked) return;
    toggleSlot(day, hour, recurring);
  };

  const pendingAdds    = pending.filter((p) => !p.id.startsWith('rm-'));
  const pendingRemoves = pending.filter((p) => p.id.startsWith('rm-'));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading availability…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-sm text-gray-500 mt-0.5">Click cells to mark open time slots</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Calendar sync buttons */}
          {(['google', 'outlook'] as const).map((p) => (
            <button
              key={p}
              onClick={() => connectCalendar(p)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                ${syncedCalendars.includes(p)
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {p === 'google' ? '📅' : '📧'}
              {syncedCalendars.includes(p) ? `${p === 'google' ? 'Google' : 'Outlook'} ✓` : `Sync ${p === 'google' ? 'Google' : 'Outlook'}`}
            </button>
          ))}
        </div>
      </div>

      {/* Timezone + recurring row */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-72">
          <TimezoneSelector value={timezone} onChange={setTimezone} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none pb-1">
          <div
            onClick={() => setRecurring((r) => !r)}
            className={`relative w-10 h-6 rounded-full transition-colors ${recurring ? 'bg-violet-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${recurring ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Recurring (every week)</span>
        </label>
      </div>

      {/* Conflict warnings */}
      {conflicts.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
          <p className="text-sm font-semibold text-amber-800">⚠️ Conflict detected</p>
          {conflicts.map((c) => (
            <p key={c.slotId} className="text-xs text-amber-700">{c.message}</p>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        {[
          { color: 'bg-indigo-500', label: 'Available (one-off)' },
          { color: 'bg-violet-500', label: 'Available (recurring)' },
          { color: 'bg-emerald-400', label: 'Booked' },
          { color: 'bg-red-300',    label: 'Blocked' },
          { color: 'bg-gray-100 border border-gray-300', label: 'Free' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Weekly grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-14 p-2 text-gray-400 font-normal border-b border-gray-200" />
              {DAYS.map((d) => (
                <th key={d} className="p-2 text-gray-600 font-semibold border-b border-gray-200 text-center">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h} className="border-b border-gray-100 last:border-0">
                <td className="p-2 text-gray-400 text-right pr-3 whitespace-nowrap">{fmt(h)}</td>
                {DAYS.map((_, d) => {
                  const slot = getSlot(d, h);
                  const pendingAdd = isPendingAdd(d, h);
                  const hasConflict = conflicts.some((c) => slot && c.slotId === slot.id);
                  return (
                    <td key={d} className="p-0.5">
                      <button
                        onClick={() => handleCellClick(d, h)}
                        disabled={slot?.isBooked || slot?.isBlocked}
                        title={slot?.isBooked ? 'Booked' : slot?.isBlocked ? 'Blocked' : slot?.recurring ? 'Recurring' : ''}
                        className={`w-full h-8 rounded transition-colors
                          ${slotColor(slot, pendingAdd)}
                          ${hasConflict ? 'ring-2 ring-amber-400' : ''}
                          ${!slot && !pendingAdd ? 'text-transparent' : 'text-white text-[10px] font-medium'}
                        `}
                      >
                        {slot?.isBooked ? '●' : slot?.recurring ? '↻' : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save bar */}
      {hasPendingChanges && (
        <div className="sticky bottom-4 flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl shadow-lg px-5 py-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-indigo-600">{pendingAdds.length} added</span>
            {pendingRemoves.length > 0 && (
              <>, <span className="font-semibold text-red-500">{pendingRemoves.length} removed</span></>
            )}
            {' '}— unsaved changes
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={discardChanges}>Discard</Button>
            <Button size="sm" onClick={() => setShowConfirm(true)}>Review & Save</Button>
          </div>
        </div>
      )}

      {/* Save confirmation modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm availability changes" size="md">
        <div className="space-y-4">
          {pendingAdds.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Adding {pendingAdds.length} slot{pendingAdds.length > 1 ? 's' : ''}:</p>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {pendingAdds.map((s) => (
                  <li key={s.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.recurring ? 'bg-violet-500' : 'bg-indigo-500'}`} />
                    {DAYS[s.day]} {fmt(s.hour)} – {fmt(s.hour + 1)}
                    {s.recurring && <span className="text-xs text-violet-600">(every week)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pendingRemoves.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Removing {pendingRemoves.length} slot{pendingRemoves.length > 1 ? 's' : ''}:</p>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {pendingRemoves.map((s) => {
                  const origId = s.id.slice(3);
                  const orig = slots.find((x) => x.id === origId);
                  if (!orig) return null;
                  return (
                    <li key={s.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      {DAYS[orig.day]} {fmt(orig.hour)} – {fmt(orig.hour + 1)}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-semibold text-amber-800">⚠️ Some slots conflict with confirmed bookings. Proceed anyway?</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={saving}
              onClick={async () => { await save(); setShowConfirm(false); }}
            >
              Confirm & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
