'use client';
import { useEffect, useState } from 'react';
import { tvPlayerUrls } from '@/lib/slug-map';

interface Season {
  season_number: number;
  episode_count: number;
  name: string;
}

interface Props {
  imdbId: string;
  slug: string;
  seasons: Season[];
}

export default function SeriesPlayer({ imdbId, slug, seasons }: Props) {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [activeServer, setActiveServer] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Read s/e from URL on mount (after hydration)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = Math.max(1, parseInt(params.get('s') || '1', 10));
    const e = Math.max(1, parseInt(params.get('e') || '1', 10));
    setSeason(s);
    setEpisode(e);
    setHydrated(true);
  }, []);

  const activeSeason = seasons.find(s => s.season_number === season) || seasons[0];
  const episodeCount = activeSeason?.episode_count || 1;

  const players = tvPlayerUrls(imdbId, season, episode);
  const playerNames = Object.keys(players) as (keyof typeof players)[];
  const currentSrc = players[playerNames[activeServer]];

  const navigate = (s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
    setActiveServer(0);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('s', String(s));
      url.searchParams.set('e', String(e));
      window.history.pushState({}, '', url.toString());
    }
  };

  if (!hydrated) {
    // Skeleton shown during SSR / before hydration — keeps layout stable
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '6px' }} />
      </div>
    );
  }

  return (
    <>
      {/* Player */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#3fb950', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Server — S{season} E{episode}
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {playerNames.map((name, i) => (
            <button
              key={name}
              onClick={() => setActiveServer(i)}
              style={{
                background: i === activeServer ? 'var(--primary)' : 'var(--surface)',
                color: '#fff', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <p style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '1rem' }}>
          If the current server doesn&apos;t work please try other servers below.
        </p>

        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
          <iframe
            key={`${currentSrc}`}
            src={currentSrc}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            allowFullScreen
            scrolling="no"
            allow="autoplay; encrypted-media; fullscreen"
          />
        </div>
      </div>

      {/* Season / Episode Navigator */}
      {seasons.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>Episodes</h3>

          {/* Season tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {seasons.map(s => (
              <button
                key={s.season_number}
                onClick={() => navigate(s.season_number, 1)}
                style={{
                  background: s.season_number === season ? 'var(--primary)' : 'var(--surface)',
                  color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem',
                  cursor: 'pointer', border: '1px solid var(--border)',
                }}
              >
                Season {s.season_number}
              </button>
            ))}
          </div>

          {/* Episode links */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {Array.from({ length: episodeCount }, (_, i) => i + 1).map(ep => (
              <button
                key={ep}
                onClick={() => navigate(season, ep)}
                style={{
                  background: ep === episode ? 'var(--primary)' : 'var(--surface)',
                  color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem',
                  cursor: 'pointer', border: '1px solid var(--border)', minWidth: '44px',
                  textAlign: 'center',
                }}
              >
                E{ep}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
