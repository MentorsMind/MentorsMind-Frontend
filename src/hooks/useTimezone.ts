// src/hooks/useTimezone.ts
import { useTimezone as useTimezoneContext } from '../contexts/TimeZoneProvider';

export const useTimezone = () => {
  const { timezone, setTimezone, timeFormat, setTimeFormat } = useTimezoneContext();

  return {
    timezone,
    timeFormat,
    setTimezone,
    setTimeFormat,
    updateTimezone: setTimezone,
  };
};
