// src/components/ui/TimeDisplay.tsx
import React from "react";
import {
  formatDateTime,
  getTimezoneShortName,
  relativeTimeFromNow,
} from "../../utils/datetime.utils";

interface TimeDisplayProps {
  date: Date | string;
  userTimezone: string;
  mentorTimezone?: string;
  use24h?: boolean;
  showRelative?: boolean;
  options?: Intl.DateTimeFormatOptions;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  date,
  userTimezone,
  mentorTimezone,
  use24h,
  showRelative = false,
  options,
}) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: !use24h,
    ...options,
  };

  const localTime = formatDateTime(date, formatOptions, userTimezone);
  const mentorTime = mentorTimezone
    ? formatDateTime(date, formatOptions, mentorTimezone)
    : null;
  const localTimezoneLabel = getTimezoneShortName(date, userTimezone);
  const mentorTimezoneLabel = mentorTimezone
    ? getTimezoneShortName(date, mentorTimezone)
    : null;
  const relativeTime = showRelative ? relativeTimeFromNow(date) : null;
  const showMentorTime = Boolean(
    mentorTime &&
      mentorTimezone &&
      (mentorTimezone !== userTimezone || mentorTime !== localTime)
  );

  return (
    <span
      title={
        showMentorTime
          ? `Your time: ${localTime} (${localTimezoneLabel}) | Mentor time: ${mentorTime} (${mentorTimezoneLabel})`
          : `Your time: ${localTime} (${localTimezoneLabel})`
      }
    >
      <span>{localTime} ({localTimezoneLabel})</span>
      {showMentorTime && (
        <span className="text-gray-400"> | Mentor: {mentorTime} ({mentorTimezoneLabel})</span>
      )}
      {relativeTime && <span className="text-gray-400"> | {relativeTime}</span>}
    </span>
  );
};

export default TimeDisplay;
