import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { detectUserTimezone } from '../utils/datetime.utils';

export type TimeFormat = '12h' | '24h';

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const TimezoneProvider = ({ children }: { children: ReactNode }) => {
  const [timezone, setTimezone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('userTimezone');
      if (saved) return saved;
      const detected = detectUserTimezone();
      return detected;
    } catch (error) {
      console.warn('Failed to detect user timezone:', error);
      return 'UTC';
    }
  });
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() => {
    try {
      const saved = localStorage.getItem('userTimeFormat');
      if (saved === '12h' || saved === '24h') return saved;
      // Auto-detect from browser
      const formatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
      const formatted = formatter.format(new Date());
      const is12h = /AM|PM/i.test(formatted);
      return is12h ? '12h' : '24h';
    } catch (error) {
      console.warn('Failed to detect time format:', error);
      return '12h';
    }
  });

  useEffect(() => {
    localStorage.setItem('userTimezone', timezone);
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('userTimeFormat', timeFormat);
  }, [timeFormat]);

  const value = useMemo(() => ({
    timezone,
    setTimezone,
    timeFormat,
    setTimeFormat,
  }), [timezone, timeFormat]);

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};