import { useState, useEffect, useCallback, useRef } from 'react';

interface WakeLockState {
  isActive: boolean;
  isSupported: boolean;
  error: string | null;
}

export function useWakeLock() {
  const [state, setState] = useState<WakeLockState>({
    isActive: false,
    isSupported: 'wakeLock' in navigator,
    error: null,
  });

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const noSleepVideoRef = useRef<HTMLVideoElement | null>(null);

  const startNoSleepVideo = useCallback(() => {
    if (noSleepVideoRef.current) return;

    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.loop = true;
    video.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
    video.src = 'data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAG1wNDJpc29tAAAAAAADAAABAAAAAAAAAA==';
    document.body.appendChild(video);
    video.play().catch(() => {});
    noSleepVideoRef.current = video;
  }, []);

  const stopNoSleepVideo = useCallback(() => {
    if (noSleepVideoRef.current) {
      noSleepVideoRef.current.pause();
      noSleepVideoRef.current.remove();
      noSleepVideoRef.current = null;
    }
  }, []);

  const acquireWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      startNoSleepVideo();
      setState(prev => ({ ...prev, isActive: true, error: null }));
      return true;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
        setState(prev => ({ ...prev, isActive: false }));
      });
      setState(prev => ({ ...prev, isActive: true, error: null }));
      return true;
    } catch {
      startNoSleepVideo();
      setState(prev => ({ ...prev, isActive: true, error: null }));
      return true;
    }
  }, [startNoSleepVideo]);

  const releaseWakeLock = useCallback(async () => {
    stopNoSleepVideo();

    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch {
        wakeLockRef.current = null;
      }
    }

    setState(prev => ({ ...prev, isActive: false }));
  }, [stopNoSleepVideo]);

  const toggleWakeLock = useCallback(async () => {
    if (state.isActive) {
      await releaseWakeLock();
    } else {
      await acquireWakeLock();
    }
  }, [state.isActive, acquireWakeLock, releaseWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isActive && !wakeLockRef.current) {
        acquireWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [state.isActive, acquireWakeLock, releaseWakeLock]);

  return {
    ...state,
    toggleWakeLock,
    acquireWakeLock,
    releaseWakeLock,
  };
}
