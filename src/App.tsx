import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalogClock } from './components/AnalogClock';
import { DigitalClock } from './components/DigitalClock';
import { TimerPanel } from './components/TimerPanel';
import { ThemePanel } from './components/ThemePanel';
import { Navigation } from './components/Navigation';
import { LandscapeButton } from './components/LandscapeButton';
import { useTimer } from './hooks/useTimer';
import { useWakeLock } from './hooks/useWakeLock';
import { type ScreenType, THEMES } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    return (localStorage.getItem('screen') as ScreenType) || 'screenAnalog';
  });
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || '';
  });
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [focusText, setFocusText] = useState<string>('');
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);

  const { isActive: wakeLockActive, toggleWakeLock } = useWakeLock();

  const timer = useTimer();
  const lastTapRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isLightTheme = ['t-fog', 't-sand', 't-stone', 't-chalk', 't-light'].some(
    c => currentTheme === c
  );

  // Handle screen navigation
  const handleNavigate = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen);
    localStorage.setItem('screen', screen);
  }, []);

  // Handle theme change
  const handleThemeChange = useCallback((className: string) => {
    setCurrentTheme(className);
    localStorage.setItem('theme', className);
  }, []);

  // Handle landscape mode toggle
  const handleLandscapeToggle = useCallback(async () => {
    const newMode = !isLandscapeMode;
    setIsLandscapeMode(newMode);

    if (newMode) {
      await toggleWakeLock();
      // Auto switch to digital in landscape
      handleNavigate('screenDigital');
      // Try fullscreen
      try {
        const el = document.documentElement;
        const req = el.requestFullscreen || (el as any).webkitRequestFullscreen || (el as any).mozRequestFullScreen;
        if (req) req.call(el).catch(() => {});
      } catch {}
    } else {
      if (wakeLockActive) {
        await toggleWakeLock();
      }
      // Exit fullscreen
      try {
        const exit = document.exitFullscreen || (document as any).webkitExitFullscreen;
        if (exit && (document.fullscreenElement || (document as any).webkitFullscreenElement)) {
          exit.call(document).catch(() => {});
        }
      } catch {}
    }
  }, [isLandscapeMode, wakeLockActive, toggleWakeLock, handleNavigate]);

  // Handle double tap
  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const ignoredSelectors = ['.tab', '.t-btn', '.preset-btn', '.t-set-btn', '.t-input', '.task-input', '.alarm-del', '.alarm-item', '.swatch', '.close-panel', '.landscape-btn'];
    if (ignoredSelectors.some(s => target.closest(s))) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      const screens: ScreenType[] = ['screenAnalog', 'screenDigital', 'screenTimer'];
      const currentIndex = screens.indexOf(currentScreen);
      const nextScreen = screens[(currentIndex + 1) % screens.length];
      handleNavigate(nextScreen);
      e.preventDefault();
    }
    lastTapRef.current = now;
  }, [currentScreen, handleNavigate]);

  // Handle long press for theme panel
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const ignoredSelectors = ['.tab', '.t-btn', '.preset-btn', '.t-set-btn', '.t-input', '.task-input', '.alarm-del', '.alarm-item', '.swatch', '.close-panel', '.landscape-btn'];
    if (ignoredSelectors.some(s => target.closest(s))) return;

    longPressTimerRef.current = setTimeout(() => {
      setIsThemeOpen(true);
      longPressTimerRef.current = null;
    }, 520);
  }, []);

  const handleLongPressCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Sync task from timer
  useEffect(() => {
    if (timer.activeTask && timer.timer.isRunning) {
      setFocusText(timer.activeTask);
    } else if (!timer.timer.isRunning) {
      setFocusText('');
    }
  }, [timer.activeTask, timer.timer.isRunning]);

  // Handle visibility change for wake lock
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isLandscapeMode && !wakeLockActive) {
        toggleWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLandscapeMode, wakeLockActive, toggleWakeLock]);

  // Apply theme to body
  useEffect(() => {
    THEMES.forEach(t => {
      if (t.className) document.body.classList.remove(t.className);
    });
    if (currentTheme) {
      document.body.classList.add(currentTheme);
    }
  }, [currentTheme]);

  // Apply landscape mode to body
  useEffect(() => {
    if (isLandscapeMode) {
      document.body.classList.add('landscape-mode');
      // Lock to landscape if supported
      if (screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock?.('landscape').catch(() => {});
      }
    } else {
      document.body.classList.remove('landscape-mode');
      if (screen.orientation && 'unlock' in screen.orientation) {
        screen.orientation.unlock?.();
      }
    }
  }, [isLandscapeMode]);

  const activeTaskTime = timer.timer.isRunning && timer.activeTask
    ? timer.fmt(timer.timer.left)
    : undefined;

  return (
    <div
      className={`app-container ${currentTheme} ${isLandscapeMode ? 'landscape-mode' : ''}`}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleLongPressCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={(e: React.MouseEvent) => {
        handleLongPressCancel();
        handleTouchEnd(e);
      }}
    >
      <LandscapeButton
        isLandscapeMode={isLandscapeMode}
        wakeLockActive={wakeLockActive}
        onToggle={handleLandscapeToggle}
      />

      {/* Wake lock indicator */}
      {wakeLockActive && (
        <div
          className="fixed top-4 right-4 w-2.5 h-2.5 rounded-full z-[300]"
          style={{
            background: '#22dd55',
            opacity: 0.65,
            boxShadow: '0 0 8px rgba(34, 221, 85, 0.6)',
          }}
        />
      )}

      {/* Analog Screen */}
      {currentScreen === 'screenAnalog' && (
        <div className="screen active">
          <AnalogClock
            taskName={timer.activeTask || undefined}
            taskTime={activeTaskTime}
            isLightTheme={isLightTheme}
          />
        </div>
      )}

      {/* Digital Screen */}
      {currentScreen === 'screenDigital' && (
        <div className="screen active">
          <DigitalClock
            focusText={focusText}
            isLandscapeMode={isLandscapeMode}
          />
        </div>
      )}

      {/* Timer Screen */}
      {currentScreen === 'screenTimer' && (
        <div className="screen active">
          <TimerPanel
            total={timer.timer.total}
            left={timer.timer.left}
            isRunning={timer.timer.isRunning}
            alarms={timer.savedAlarms}
            onStart={timer.startTimer}
            onPause={timer.pauseTimer}
            onReset={timer.resetTimer}
            onSetTime={timer.setTimerValue}
            onDeleteAlarm={timer.deleteAlarm}
            fmt={timer.fmt}
            onTaskChange={setFocusText}
          />
        </div>
      )}

      <Navigation
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isLandscape={isLandscapeMode}
      />

      <ThemePanel
        isOpen={isThemeOpen}
        currentTheme={currentTheme}
        onSelectTheme={handleThemeChange}
        onClose={() => setIsThemeOpen(false)}
      />

      {!isLandscapeMode && (
        <p className="hint">
          mantén pulsado = colores · doble tap = cambiar pantalla
        </p>
      )}
    </div>
  );
}

export default App;
