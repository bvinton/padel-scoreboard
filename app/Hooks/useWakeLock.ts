import { useEffect, useRef } from 'react';

export function useWakeLock(appStarted: boolean) {
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      // Silently catch rejections (e.g., low battery)
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && appStarted) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [appStarted]);

  return { requestWakeLock };
}