import React, { useMemo } from 'react';
import { getTimezones, detectTimezone } from '../../utils/calendar.utils';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
}

export const TimezoneSelector = ({ value, onChange }: TimezoneSelectorProps) => {
  const timezones = useMemo(() => getTimezones(), []);
  const detectedTz = useMemo(() => detectTimezone(), []);

  const popularTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Timezone</label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <optgroup label="Detected">
          <option value={detectedTz}>{detectedTz} (Auto-detected)</option>
        </optgroup>
        
        <optgroup label="Popular">
          {popularTimezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </optgroup>
        
        <optgroup label="All Timezones">
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};
