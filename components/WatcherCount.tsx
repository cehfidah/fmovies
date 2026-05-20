'use client';
import { useEffect, useState } from 'react';

interface Props {
  /** Base count derived from TMDB popularity so popular movies show higher numbers */
  base: number;
}

export default function WatcherCount({ base }: Props) {
  const [count, setCount] = useState(base);

  useEffect(() => {
    // Slight drift every 4–9 seconds to look live
    const tick = () => {
      setCount(c => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(base - 30, c + delta);
      });
    };
    const id = setInterval(tick, 4000 + Math.random() * 5000);
    return () => clearInterval(id);
  }, [base]);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '3px 10px',
        fontSize: '0.72rem',
        color: '#d1d5db',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#ef4444',
          display: 'inline-block',
          animation: 'wpulse 1.8s ease-in-out infinite',
          flexShrink: 0,
        }}
      />
      <style>{`@keyframes wpulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
      {count.toLocaleString()} watching now
    </span>
  );
}
