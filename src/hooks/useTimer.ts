import { useState, useEffect, useCallback, useRef } from 'react';

export interface Alarm {
  id: number;
  name: string;
  seconds: number;
}

interface TimerState {
  total: number;
  left: number;
  isRunning: boolean;
}

export function useTimer() {
  const [timer, setTimer] = useState<TimerState>({
    total: 300,
    left: 300,
    isRunning: false,
  });

  const [activeTask, setActiveTask] = useState<string>('');
  const [savedAlarms, setSavedAlarms] = useState<Alarm[]>([]);
  const intervalRef = useRef<number | null>(null);

  const fmt = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  const loadAlarms = useCallback(() => {
    try {
      const stored = localStorage.getItem('savedAlarms');
      if (stored) {
        setSavedAlarms(JSON.parse(stored));
      }
    } catch {
      setSavedAlarms([]);
    }
  }, []);

  const addAlarm = useCallback((name: string, seconds: number) => {
    if (!name && !seconds) return;
    const newAlarm: Alarm = {
      name: name || 'Sin nombre',
      seconds,
      id: Date.now(),
    };
    setSavedAlarms(prev => {
      const updated = [newAlarm, ...prev].slice(0, 8);
      localStorage.setItem('savedAlarms', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteAlarm = useCallback((id: number) => {
    setSavedAlarms(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('savedAlarms', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadTimerFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('timerState');
      if (!stored) return;

      const s = JSON.parse(stored);
      if (!s.timerRunning) return;

      const elapsed = Math.floor((Date.now() - s.savedAt) / 1000);
      const remaining = Math.max(0, s.timerLeft - elapsed);

      setTimer({
        total: s.timerTotal,
        left: remaining,
        isRunning: false,
      });

      setActiveTask(s.activeTask || '');

      if (remaining > 0 && s.timerRunning) {
        setTimeout(() => {
          setTimer(prev => ({ ...prev, isRunning: true }));
        }, 100);
      }

      localStorage.removeItem('timerState');
    } catch {
      localStorage.removeItem('timerState');
    }
  }, []);

  const saveTimerToStorage = useCallback(() => {
    if (!timer.isRunning) return;
    localStorage.setItem('timerState', JSON.stringify({
      timerLeft: timer.left,
      timerTotal: timer.total,
      timerRunning: timer.isRunning,
      activeTask,
      savedAt: Date.now(),
    }));
  }, [timer, activeTask]);

  const setTimerValue = useCallback((seconds: number) => {
    setTimer({
      total: seconds,
      left: seconds,
      isRunning: false,
    });
    localStorage.removeItem('timerState');
  }, []);

  const startTimer = useCallback((taskName?: string) => {
    if (timer.left <= 0) return;

    if (taskName?.trim()) {
      setActiveTask(taskName.trim());
      addAlarm(taskName.trim(), timer.total);
    }

    setTimer(prev => ({ ...prev, isRunning: true }));
  }, [timer.left, timer.total, addAlarm]);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isRunning: false }));
    localStorage.removeItem('timerState');
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, left: prev.total, isRunning: false }));
    setActiveTask('');
    localStorage.removeItem('timerState');
  }, []);

  const tick = useCallback(() => {
    setTimer(prev => {
      if (prev.left <= 1) {
        localStorage.removeItem('timerState');
        return { ...prev, left: 0, isRunning: false };
      }
      return { ...prev, left: prev.left - 1 };
    });
  }, []);

  useEffect(() => {
    loadAlarms();
    loadTimerFromStorage();
  }, [loadAlarms, loadTimerFromStorage]);

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = window.setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, tick]);

  useEffect(() => {
    if (timer.isRunning && timer.left > 0 && timer.left % 60 === 0) {
      saveTimerToStorage();
    }
  }, [timer.left, timer.isRunning, saveTimerToStorage]);

  useEffect(() => {
    const handleBeforeUnload = () => saveTimerToStorage();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveTimerToStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveTimerToStorage]);

  return {
    timer,
    activeTask,
    savedAlarms,
    setTimerValue,
    startTimer,
    pauseTimer,
    resetTimer,
    deleteAlarm,
    fmt,
    setActiveTask,
  };
}
