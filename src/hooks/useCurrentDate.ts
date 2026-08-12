import { useEffect, useRef, useState } from 'react';

const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

interface UseCurrentDateOptions {
  /** Interval (in milliseconds) to check for day rollover. */
  intervalMs?: number;
}

interface UseCurrentDateResult {
  todayDate: string;
  currentMonth: string;
}

/**
 * Keeps track of the current local date and month, updating automatically when the day rolls over.
 * Useful for keeping “today” dependent views in sync with real-world time without requiring a refresh.
 */
export const useCurrentDate = (options: UseCurrentDateOptions = {}): UseCurrentDateResult => {
  const { intervalMs = 60_000 } = options;
  const [todayDate, setTodayDate] = useState<string>(() => getLocalDateString());
  const [currentMonth, setCurrentMonth] = useState<string>(() => getLocalMonthString());
  const lastValuesRef = useRef<{ day: string; month: string }>({
    day: todayDate,
    month: currentMonth,
  });
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkForUpdates = () => {
      const nextDay = getLocalDateString();
      const nextMonth = getLocalMonthString();

      if (nextDay !== lastValuesRef.current.day) {
        lastValuesRef.current.day = nextDay;
        setTodayDate(nextDay);
      }

      if (nextMonth !== lastValuesRef.current.month) {
        lastValuesRef.current.month = nextMonth;
        setCurrentMonth(nextMonth);
      }
    };

    const scheduleInterval = () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(checkForUpdates, intervalMs);
    };

    const now = new Date();
    const elapsed = now.getSeconds() * 1000 + now.getMilliseconds();
    const millisUntilNextInterval = (intervalMs - (elapsed % intervalMs)) % intervalMs;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    checkForUpdates();

    timeoutRef.current = window.setTimeout(() => {
      checkForUpdates();
      scheduleInterval();
    }, millisUntilNextInterval || intervalMs);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs]);

  return { todayDate, currentMonth };
};
