import { useState, useEffect } from 'react';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  mentorTimezone?: string;
}

// Common timezones for quick selection
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
];

export default function TimezoneSelector({
  value,
  onChange,
  mentorTimezone,
}: TimezoneSelectorProps) {
  const [detectedTimezone, setDetectedTimezone] = useState<string>('');

  useEffect(() => {
    // Auto-detect user's timezone on mount
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(detected);
      if (!value) {
        onChange(detected);
      }
    } catch (error) {
      console.error('Failed to detect timezone:', error);
    }
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Your Timezone
        </label>
        {detectedTimezone && value !== detectedTimezone && (
          <button
            onClick={() => onChange(detectedTimezone)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Use detected: {detectedTimezone}
          </button>
        )}
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">Select timezone...</option>
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
        {detectedTimezone &&
          !COMMON_TIMEZONES.find((tz) => tz.value === detectedTimezone) && (
            <option value={detectedTimezone}>
              {detectedTimezone} (Detected)
            </option>
          )}
      </select>

      {mentorTimezone && value && value !== mentorTimezone && (
        <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900 mb-1">
            📍 Timezone Information
          </p>
          <p>
            <span className="font-medium">Your timezone:</span> {value}
          </p>
          <p>
            <span className="font-medium">Mentor's timezone:</span>{' '}
            {mentorTimezone}
          </p>
          <p className="mt-1 text-blue-700">
            Times shown are automatically converted to your local timezone.
          </p>
        </div>
      )}
    </div>
  );
}
