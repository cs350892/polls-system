import { useEffect, useRef, useState } from 'react';

interface UsePollTimerOptions {
  initialSeconds?: number;
  isRunning?: boolean;
}

const usePollTimer = ({ initialSeconds = 0, isRunning = false }: UsePollTimerOptions) => {
  const [remainingTime, setRemainingTime] = useState<number>(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = (seconds: number) => {
    setRemainingTime(seconds);
    clearTimer();

    intervalRef.current = window.setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const stopTimer = () => {
    clearTimer();
  };

  const syncWithServer = (seconds: number) => {
    setRemainingTime(seconds);
  };

  useEffect(() => {
    if (isRunning) {
      startTimer(initialSeconds);
    }

    return () => clearTimer();
  }, [initialSeconds, isRunning]);

  return {
    remainingTime,
    setRemainingTime,
    startTimer,
    stopTimer,
    syncWithServer,
  };
};

export default usePollTimer;
