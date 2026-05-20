'use client';
import { useEffect, useRef } from 'react';

function fireAd() {
  const adUrl = process.env.NEXT_PUBLIC_POPUNDER_URL;
  if (!adUrl) return;
  try { window.open(adUrl, '_blank', 'noopener,noreferrer'); } catch { /* blocked */ }
}

const MIN_AWAY_MS = 30_000;   // must be away at least 30s
const COOLDOWN_MS = 300_000;  // max once every 5 minutes

/**
 * TabRefocusAd — fires a popunder whenever the user returns to the tab
 * after being away for 30+ seconds. Capped at once every 5 minutes.
 * No UI — purely a passive revenue trigger.
 */
export default function TabRefocusAd() {
  const hiddenAtRef = useRef<number | null>(null);
  const lastFiredRef = useRef<number>(0);

  useEffect(() => {
    function handleVisibility() {
      const now = Date.now();

      if (document.hidden) {
        hiddenAtRef.current = now;
      } else {
        // Tab just became visible
        const hiddenAt = hiddenAtRef.current;
        if (hiddenAt === null) return;
        const awayMs = now - hiddenAt;
        if (awayMs < MIN_AWAY_MS) return;
        if (now - lastFiredRef.current < COOLDOWN_MS) return;

        lastFiredRef.current = now;
        fireAd();
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return null;
}
