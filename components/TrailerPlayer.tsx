'use client';
import { useState } from 'react';

interface Props {
  trailerKey: string;
  title: string;
  posterUrl: string;
}

export default function TrailerPlayer({ trailerKey, title, posterUrl }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#0b0c0e',
        cursor: playing ? 'default' : 'pointer',
      }}
      onClick={() => !playing && setPlaying(true)}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
          title={`${title} — Official Trailer`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      ) : (
        <>
          {/* Thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${trailerKey}/maxresdefault.jpg`}
            alt={`${title} trailer`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              // fallback to movie poster if YT thumbnail fails
              (e.target as HTMLImageElement).src = posterUrl;
            }}
          />
          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

          {/* Play button */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Glow ring */}
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.3)',
                  animation: 'tring 1.8s ease-out infinite',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(239,68,68,0.5)',
                }}
              >
                {/* YouTube play triangle */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <span
              style={{
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: 'rgba(239,68,68,0.85)',
                padding: '3px 12px',
                borderRadius: '20px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              ▶ Watch Official Trailer
            </span>
          </div>

          <style>{`@keyframes tring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}`}</style>
        </>
      )}
    </div>
  );
}
