import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import WatcherCount from '@/components/WatcherCount';
import TrailerPlayer from '@/components/TrailerPlayer';
import DownloadButton from '@/components/DownloadButton';
import { getTVDetailsMemo, getTVDetailsFresh, backdrop, poster } from '@/lib/tmdb';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string; s?: string; e?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { id: idStr } = await searchParams;
  const id = idStr ? parseInt(idStr, 10) : null;
  if (!id) return { title: 'TV Show — Fmovies' };
  const data = await getTVDetailsMemo(id).catch(() => null);
  if (!data) return { title: 'TV Show — Fmovies', robots: { index: false, follow: true } };
  const year = (data.first_air_date || '').slice(0, 4);
  return {
    title: `Watch ${data.name} ${year ? `(${year})` : ''} Online Free — Fmovies`,
    description: data.overview ? `${data.overview.slice(0, 155)}…` : `Watch ${data.name} online for free.`,
    openGraph: { title: data.name, description: data.overview, images: data.poster_path ? [poster(data.poster_path, 'w500')] : undefined },
    alternates: { canonical: `https://fmoviesz.cyou/tv/${slug}` },
  };
}

export default async function TVDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { id: idStr, s = '1', e = '1' } = await searchParams;
  const id = idStr ? parseInt(idStr, 10) : null;
  if (!id || isNaN(id)) notFound();   // genuinely invalid URL — show 404

  // Fetch TV — Memo shares result with generateMetadata (1 TMDB call, not 2).
  // On failure, retry with timestamped fresh fetch (guaranteed no dedup).
  const is404 = (e: unknown) => e instanceof Error && e.message.includes('→ 404');
  let data = await getTVDetailsMemo(id!).catch((e) => { if (is404(e)) notFound(); return null; });
  if (!data) {
    await new Promise(r => setTimeout(r, 800));
    data = await getTVDetailsFresh(id!).catch((e) => { if (is404(e)) notFound(); return null; });
  }
  if (!data) throw new Error(`Failed to load TV show ${id}`);

  const title = data.name || 'Unknown';
  const year = (data.first_air_date || '').slice(0, 4);
  const genres: { id: number; name: string }[] = data.genres || [];
  const cast: { id: number; name: string }[] = (data.credits?.cast || []).slice(0, 8);
  const creator = data.created_by?.[0]?.name || null;
  const seasons: { season_number: number; episode_count: number }[] =
    (data.seasons || []).filter((sv: any) => sv.season_number > 0);
  const similar = (data.similar?.results || data.recommendations?.results || []).slice(0, 12);

  const currentSeason = Math.max(1, parseInt(s, 10) || 1);
  const currentEpisode = Math.max(1, parseInt(e, 10) || 1);
  const currentSeasonData = seasons.find(sv => sv.season_number === currentSeason) || seasons[0];
  const episodeCount = currentSeasonData?.episode_count || 12;
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1);
  const embedId = data.imdb_id || id;

  // Official trailer
  const trailerKey: string | null = ((data.videos?.results || []) as any[])
    .find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))?.key ?? null;

  // Viewer count based on popularity
  const watcherBase = Math.max(80, Math.min(9800, Math.floor((data.popularity || 10) * 4.2)));

  const servers = [
    `https://vid.hostapi.top/vidsrcicu.php?id=${embedId}&s=${currentSeason}&e=${currentEpisode}`,
    `https://vid.hostapi.top/vidsrcpro.php?id=${embedId}&s=${currentSeason}&e=${currentEpisode}`,
    `https://vid.hostapi.top/vidsrcme.php?id=${embedId}&s=${currentSeason}&e=${currentEpisode}`,
  ];

  return (
    <>
      {/* Monetag Multitag — only fires on TV pages */}
      <Script src="https://quge5.com/88/tag.min.js" data-zone="241423" strategy="afterInteractive" data-cfasync="false" />
      <Header />
      <main>
        {data.backdrop_path && (
          <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
            <img src={backdrop(data.backdrop_path) || ''} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0b0c0e 0%, rgba(11,12,14,0.6) 60%, transparent 100%)' }} />
          </div>
        )}

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
          <nav style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            <a href="/home" style={{ color: '#8b949e', textDecoration: 'none' }}>Home</a>
            <span style={{ margin: '0 0.4rem' }}>/</span>
            <a href="/fmovies-series" style={{ color: '#8b949e', textDecoration: 'none' }}>TV Series</a>
            <span style={{ margin: '0 0.4rem' }}>/</span>
            <span style={{ color: '#c9d1d9' }}>{title}</span>
          </nav>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={poster(data.poster_path, 'w342')} alt={title}
                style={{ width: '200px', borderRadius: '10px', objectFit: 'cover', marginTop: data.backdrop_path ? '-120px' : 0, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: '2px solid #30363d', position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'absolute', top: 8, left: 8, background: '#00acc1', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', zIndex: 2 }}>HD</span>
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#e6edf3', marginBottom: '0.4rem' }}>
                {title} {year && <span style={{ color: '#8b949e', fontWeight: 400, fontSize: '0.75em' }}>({year})</span>}
              </h1>
              <div style={{ marginBottom: '0.75rem' }}>
                <WatcherCount base={watcherBase} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem' }}>
                {genres.map(g => <a key={g.id} href={`/genre/${g.name.toLowerCase().replace(/\s+/g, '-')}`} className="genre-badge">{g.name}</a>)}
              </div>
              <table style={{ fontSize: '0.85rem', color: '#c9d1d9', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {cast.length > 0 && <tr><td style={{ color: '#8b949e', paddingRight: '1rem', paddingBottom: '0.35rem', whiteSpace: 'nowrap' }}>Stars:</td><td>{cast.map((a: any) => a.name).join(', ')}</td></tr>}
                  {creator && <tr><td style={{ color: '#8b949e', paddingRight: '1rem', paddingBottom: '0.35rem' }}>Creator:</td><td>{creator}</td></tr>}
                  {data.origin_country?.length > 0 && <tr><td style={{ color: '#8b949e', paddingRight: '1rem', paddingBottom: '0.35rem' }}>Country:</td><td>{(data.origin_country as string[]).join(', ')}</td></tr>}
                  {data.status && <tr><td style={{ color: '#8b949e', paddingRight: '1rem', paddingBottom: '0.35rem' }}>Status:</td><td>{data.status}</td></tr>}
                  {seasons.length > 0 && <tr><td style={{ color: '#8b949e', paddingRight: '1rem', paddingBottom: '0.35rem' }}>Seasons:</td><td>{seasons.length}</td></tr>}
                  {data.vote_average > 0 && <tr><td style={{ color: '#8b949e', paddingRight: '1rem', paddingBottom: '0.35rem' }}>IMDb:</td><td style={{ color: '#fbbf24' }}>⭐ {data.vote_average.toFixed(1)}</td></tr>}
                </tbody>
              </table>
              {data.overview && <p style={{ color: '#c9d1d9', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '600px', marginBottom: '1.25rem' }}>{data.overview}</p>}
              <a href="#watch" className="btn-gradient">▶ Watch Now</a>
              <div className="mt-3">
                <DownloadButton title={title} />
              </div>
            </div>
          </div>

          {/* Season tabs */}
          {seasons.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {seasons.map(sv => (
                <a key={sv.season_number} href={`/tv/${slug}?id=${id}&s=${sv.season_number}&e=1#watch`}
                  style={{ padding: '5px 14px', borderRadius: '6px', fontSize: '0.82rem', textDecoration: 'none',
                    background: currentSeason === sv.season_number ? 'var(--primary)' : 'var(--surface)',
                    color: currentSeason === sv.season_number ? '#fff' : '#c9d1d9', border: '1px solid var(--border)' }}>
                  S{sv.season_number}
                </a>
              ))}
            </div>
          )}

          {/* Episode list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
            {episodes.map(ep => (
              <a key={ep} href={`/tv/${slug}?id=${id}&s=${currentSeason}&e=${ep}#watch`}
                style={{ padding: '4px 10px', borderRadius: '5px', fontSize: '0.78rem', textDecoration: 'none',
                  background: currentEpisode === ep ? 'var(--primary)' : 'var(--surface)',
                  color: currentEpisode === ep ? '#fff' : '#c9d1d9', border: '1px solid var(--border)' }}>
                Ep {ep}
              </a>
            ))}
          </div>

          {/* Trailer — keeps users engaged before the main player */}
          {trailerKey && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '16px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }} />
                Official Trailer
              </h2>
              <TrailerPlayer trailerKey={trailerKey} title={title} posterUrl={poster(data.poster_path, 'w780')} />
            </div>
          )}

          {/* Player */}
          <div id="watch" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #30363d' }}>
              {['Server 1', 'Server 2', 'Server 3'].map((label, i) => (
                <span key={label} style={{ padding: '8px 18px', fontSize: '0.8rem', background: i === 0 ? 'var(--primary)' : 'transparent', color: '#fff', borderRight: '1px solid #30363d', cursor: 'pointer' }}>{label}</span>
              ))}
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
              <iframe src={servers[0]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="autoplay; fullscreen" />
            </div>
          </div>

          {similar.length > 0 && <MovieGrid heading="You May Also Like" movies={similar.map((m: any) => ({ ...m, media_type: 'tv' }))} />}
        </div>
      </main>
      <Footer />
    </>
  );
}
