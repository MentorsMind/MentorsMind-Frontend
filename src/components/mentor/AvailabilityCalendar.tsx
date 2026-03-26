import React, { useState } from 'react';
import type { TimeSlot } from '../../hooks/useAvailability';
import { formatTimeSlot } from '../../utils/calendar.utils';
import { useTimezone } from '../../hooks/useTimezone';
import { formatDateTime, getDateKey } from '../../utils/datetime.utils';

interface AvailabilityCalendarProps {
  timeSlots: TimeSlot[];
  onSlotClick: (slot: TimeSlot) => void;
  onDeleteSlot: (id: string) => void;
  onSlotUpdate?: (id: string, updates: Partial<TimeSlot>) => void;
  displayTimezone?: string;
}

export const AvailabilityCalendar = ({
  timeSlots,
  onSlotClick,
  onDeleteSlot,
  onSlotUpdate,
  displayTimezone,
}: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedSlot, setDraggedSlot] = useState<TimeSlot | null>(null);
  const { timezone: userTimezone, timeFormat } = useTimezone();
  const activeTimezone = displayTimezone ?? userTimezone;

  const getWeekDays = (date: Date) => {
    const week: Date[] = [];
    const first = date.getDate() - date.getDay();

    for (let i = 0; i < 7; i++) {
      const day = new Date(date);
      day.setDate(first + i);
      week.push(day);
    }

    return week;
  };

  const weekDays = getWeekDays(currentDate);

  const getSlotsForDay = (day: Date) =>
    timeSlots.filter((slot) => getDateKey(slot.start, activeTimezone) === getDateKey(day, activeTimezone));

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (slot: TimeSlot) => {
    if (!slot.isBooked) {
      setDraggedSlot(slot);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDay: Date) => {
    if (draggedSlot && onSlotUpdate) {
      const duration = draggedSlot.end.getTime() - draggedSlot.start.getTime();
      const newStart = new Date(targetDay);
      newStart.setHours(draggedSlot.start.getHours(), draggedSlot.start.getMinutes());
      const newEnd = new Date(newStart.getTime() + duration);

      onSlotUpdate(draggedSlot.id, { start: newStart, end: newEnd });
      setDraggedSlot(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">
              {formatDateTime(currentDate, { month: 'long', year: 'numeric' }, activeTimezone)}
            </h3>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Previous week"
            >
              {'<'}
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Next week"
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {weekDays.map((day, index) => {
          const slots = getSlotsForDay(day);
          const isToday = getDateKey(day, activeTimezone) === getDateKey(new Date(), activeTimezone);

          return (
            <div
              key={index}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(day)}
              className={`min-h-[120px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                isToday ? 'bg-blue-50' : ''
              } ${draggedSlot ? 'hover:bg-blue-100' : ''}`}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {formatDateTime(day, { day: 'numeric' }, activeTimezone)}
              </div>

              <div className="space-y-1">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    draggable={!slot.isBooked}
                    onDragStart={() => handleDragStart(slot)}
                    onClick={() => onSlotClick(slot)}
                    className={`text-xs p-1 rounded cursor-pointer group relative ${
                      slot.isBooked
                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        : slot.isBlocked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-move'
                    }`}
                    title={formatTimeSlot(
                      slot.start,
                      slot.end,
                      activeTimezone,
                      timeFormat === '24h'
                    )}
                  >
                    <div className="truncate">
                      {formatTimeSlot(slot.start, slot.end, activeTimezone, timeFormat === '24h')}
                    </div>
                    {!slot.isBooked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSlot(slot.id);
                        }}
                        className="absolute top-0 right-0 hidden group-hover:block text-red-600 hover:text-red-800 px-1"
                      >
                        x
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-gray-50 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
};
