import React, { useEffect, useState } from 'react';
import { Clock, MapPin, CheckCircle } from 'lucide-react';
import {
  getMentorLocalTime,
  formatTime,
  formatTimezoneOffset,
  parseTimezoneOffset,
} from '../../utils/timezone.utils';

interface MentorTimeDisplayProps {
  timezone: string;
  userTimezone?: string;
  isAvailableNow?: boolean;
  nextAvailableTime?: Date | undefined;
  showFullTimezone?: boolean;
}

export const MentorTimeDisplay: React.FC<MentorTimeDisplayProps> = ({
  timezone,
  userTimezone = 'UTC',
  isAvailableNow = false,
  nextAvailableTime,
  showFullTimezone = false,
}) => {
  const [localTime, setLocalTime] = useState<string>('');
  const [timezoneOffset, setTimezoneOffset] = useState<string>('');

  useEffect(() => {
    // Update local time immediately
    const mentorLocalTime = getMentorLocalTime(timezone);
    setLocalTime(formatTime(mentorLocalTime));

    // Calculate timezone offset from user
    const userOffset = parseTimezoneOffset(userTimezone);
    const mentorOffset = parseTimezoneOffset(timezone);
    const offsetDiff = mentorOffset - userOffset;
    setTimezoneOffset(formatTimezoneOffset(offsetDiff));

    // Update time every minute
    const interval = setInterval(() => {
      const newTime = getMentorLocalTime(timezone);
      setLocalTime(formatTime(newTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [timezone, userTimezone]);

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
      {/* Time Display */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{localTime}</span>
          <span className="text-xs text-gray-500">their time</span>
        </div>
      </div>

      {/* Timezone Offset */}
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-gray-200">
        <MapPin className="h-3 w-3 text-gray-400" />
        <span className="text-xs font-medium text-gray-600">{timezoneOffset}</span>
      </div>

      {/* Availability Status */}
      {isAvailableNow && (
        <div className="flex items-center gap-1 ml-auto rounded-full bg-green-50 px-2 py-1">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">Available</span>
        </div>
      )}

      {/* Show timezone name if requested */}
      {showFullTimezone && (
        <div className="text-xs text-gray-500 truncate">
          {timezone}
        </div>
      )}
    </div>
  );
};

/**
 * Minimal time display - just shows time and availability
 */
export const MentorTimeDisplayCompact: React.FC<Omit<MentorTimeDisplayProps, 'showFullTimezone'>> = (props) => {
  const [localTime, setLocalTime] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState(props.isAvailableNow || false);

  useEffect(() => {
    const mentorLocalTime = getMentorLocalTime(props.timezone);
    setLocalTime(formatTime(mentorLocalTime));
    setIsAvailable(props.isAvailableNow || false);

    const interval = setInterval(() => {
      const newTime = getMentorLocalTime(props.timezone);
      setLocalTime(formatTime(newTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [props.timezone, props.isAvailableNow]);

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">{localTime}</span>
      {isAvailable && (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-600"></span>
          Available
        </span>
      )}
    </div>
  );
};
