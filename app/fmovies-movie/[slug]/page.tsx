import type { Metadata } from 'next';
import type React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import { getMovieDetails, poster, backdrop } from '@/lib/tmdb';
import { lookupSlug, moviePlayerUrls } from '@/lib/slug-map';
import mappings from '@/lib/slug_mappings.json';

// Pre-render all 180 archived movie slugs at build time
export async function generateStaticParams() {
  return Object.entries(mappings as Record<string, { media_type: string }>)
    .filter(([, v]) => v.media_type === 'movie')
    .map(([slug]) => ({ slug }));
}

// Refresh every 24 hours via ISR; serve stale while revalidating
export const revalidate = 86400;
// Allow new slugs added to DB without a redeploy
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = lookupSlug(slug);
  if (!entry || entry.media_type !== 'movie') return { title: 'Movie â€” Fmovies', robots: { index: false, follow: true } };
  const data = await getMovieDetails(entry.tmdb_id).catch(() => null);
  if (!data) return { title: 'Movie â€” Fmovies', robots: { index: false, follow: true } };
  const year = (data.release_date || '').slice(0, 4);
  const title = `Watch Movie ${data.title}${year ? ` (${year})` : ''} on Fmovies Free Movies & Series Online`;
  const desc = `The best site to watch Movie ${data.title}${year ? ` (${year})` : ''} online in HD for FREE. Watch Movie ${data.title} with a wide range of subtitles. Watch now on Official Fmovies!`;
  return {
    title,
    description: desc,
    keywords: `Fmovies, Movie ${data.title}${year ? ` (${year})` : ''} free download,Movie ${data.title} online streaming,watch movies online,watch movies free online`,
    openGraph: {
      title,
      description: desc,
      images: data.poster_path ? [{ url: poster(data.poster_path, 'w500'), width: 500, height: 750 }] : undefined,
      type: 'video.movie',
    },
    twitter: { card: 'summary_large_image', title, description: desc },
    alternates: { canonical: `https://fmoviesz.cyou/fmovies-movie/${slug}` },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  };
}

export default async function FMovieDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = lookupSlug(slug);
  if (!entry || entry.media_type !== 'movie') notFound();

  let data = await getMovieDetails(entry.tmdb_id).catch(() => null);
  if (!data) {
    await new Promise(r => setTimeout(r, 800));
    data = await getMovieDetails(entry.tmdb_id).catch(() => null);
  }
  if (!data) notFound();

  const title = data.title || entry.title;
  const year = (data.release_date || '').slice(0, 4);
  const genres: { id: number; name: string }[] = data.genres || [];
  const similar = (data.recommendations?.results || data.similar?.results || []).slice(0, 12);
  const players = moviePlayerUrls(entry.imdb_id);
  const playerNames = Object.keys(players) as (keyof typeof players)[];

  // Credits
  const cast: { id: number; name: string }[] = (data.credits?.cast || []).slice(0, 8);
  const director = (data.credits?.crew || []).find((c: any) => c.job === 'Director');
  const keywords: { id: number; name: string }[] = data.keywords?.keywords || [];
  const countries: { iso_3166_1: string; name: string }[] = data.production_countries || [];
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}min` : null;

  const metaRow = (label: string, children: React.ReactNode) => (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <span style={{ color: '#8b949e', fontSize: '0.85rem', minWidth: '80px', flexShrink: 0 }}>{label}:</span>
      <span style={{ color: '#c9d1d9', fontSize: '0.85rem' }}>{children}</span>
    </div>
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    description: data.overview,
    image: data.poster_path ? poster(data.poster_path, 'w500') : undefined,
    dateCreated: data.release_date,
    duration: data.runtime ? `PT${data.runtime}M` : undefined,
    director: director ? { '@type': 'Person', name: director.name } : undefined,
    actor: cast.map(a => ({ '@type': 'Person', name: a.name })),
    aggregateRating: data.vote_average ? {
      '@type': 'AggregateRating',
      ratingValue: data.vote_average.toFixed(1),
      bestRating: '10',
      worstRating: '1',
      ratingCount: data.vote_count,
    } : undefined,
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        {/* Backdrop */}
        {data.backdrop_path && (
          <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
            <img src={backdrop(data.backdrop_path)} alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0b0c0e 0%, rgba(11,12,14,0.4) 60%, transparent 100%)' }} />
          </div>
        )}

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>

          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.82rem', color: '#8b949e', marginBottom: '1.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="/home" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</a>
            <span>/</span>
            <a href="/fmovies-movie" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Movies</a>
            <span>/</span>
            <span style={{ color: '#c9d1d9' }}>{title}</span>
          </nav>

          {/* Main info block */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>

            {/* Poster */}
            {data.poster_path && (
              <div style={{ flexShrink: 0, position: 'relative' }}>
                <img src={poster(data.poster_path, 'w342')} alt={title}
                  style={{ width: '200px', borderRadius: '8px', display: 'block' }} />
                <span style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px',
                }}>HD</span>
              </div>
            )}

            {/* Details */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.6rem', color: '#fff', lineHeight: 1.3 }}>
                {title} {year && <span style={{ color: '#8b949e', fontWeight: 400 }}>({year})</span>}
              </h1>

              {data.overview && (
                <p style={{ color: '#c9d1d9', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {data.overview}
                </p>
              )}

              <div style={{ marginBottom: '1rem' }}>
                {genres.length > 0 && metaRow('Genre',
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {genres.map((g, i) => (
                      <span key={g.id}>
                        <a href={`/genre/${g.name.toLowerCase().replace(/\s+/g, '-')}`}
                          style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                          {g.name}
                        </a>
                        {i < genres.length - 1 && <span style={{ color: '#8b949e' }}>,</span>}
                      </span>
                    ))}
                  </span>
                )}
                {cast.length > 0 && metaRow('Stars',
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {cast.map((a, i) => (
                      <span key={a.id}>
                        <span style={{ color: '#c9d1d9' }}>{a.name}</span>
                        {i < cast.length - 1 && <span style={{ color: '#8b949e' }}>,</span>}
                      </span>
                    ))}
                  </span>
                )}
                {director && metaRow('Director',
                  <span style={{ color: '#c9d1d9' }}>{director.name}</span>
                )}
                {countries.length > 0 && metaRow('Country',
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {countries.map((c, i) => (
                      <span key={c.iso_3166_1}>
                        <a href={`/country/${c.name.toLowerCase().replace(/\s+/g, '-')}`}
                          style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                          {c.name}
                        </a>
                        {i < countries.length - 1 && <span style={{ color: '#8b949e' }}>,</span>}
                      </span>
                    ))}
                  </span>
                )}
                {runtime && metaRow('Duration', <span>{runtime}</span>)}
                {metaRow('Quality', <span style={{ background: 'var(--primary)', color: '#fff', padding: '1px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>HD</span>)}
                {year && metaRow('Release', <a href={`/filter?year=${year}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{year}</a>)}
                {data.vote_average ? metaRow('IMDb', <span>â­ {data.vote_average.toFixed(1)} / 10</span>) : null}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href="#player" style={{ background: 'var(--primary)', color: '#fff', padding: '10px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  â–¶ Stream in HD
                </a>
                <a href="#player" style={{ background: 'var(--surface)', color: '#c9d1d9', padding: '10px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  â¬‡ Download in HD
                </a>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{ color: '#8b949e', fontSize: '0.82rem', marginRight: '0.25rem' }}>Keywords:</span>
              {keywords.slice(0, 20).map(k => (
                <a key={k.id} href={`/tags/${k.name.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#8b949e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', textDecoration: 'none' }}>
                  {k.name}
                </a>
              ))}
            </div>
          )}

          {/* Player */}
          <div id="player" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', scrollMarginTop: '70px' }}>
            <h2 style={{ color: '#3fb950', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Watch {title} Online â€” Select Server
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {playerNames.map((name, i) => (
                <button key={name} id={`btn-${i}`} data-src={players[name]}
                  style={{
                    background: i === 0 ? 'var(--primary)' : 'var(--surface)',
                    color: '#fff', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                  }}>
                  {name}
                </button>
              ))}
            </div>
            <p style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '1rem' }}>
              If the current server doesn&apos;t work please try other servers below.
            </p>
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
              <iframe id="player-iframe" src={players[playerNames[0]]}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                allowFullScreen scrolling="no" allow="autoplay; encrypted-media; fullscreen" />
            </div>
          </div>

          <script dangerouslySetInnerHTML={{ __html: `(function(){var btns=document.querySelectorAll('[data-src]'),iframe=document.getElementById('player-iframe');btns.forEach(function(btn,i){btn.addEventListener('click',function(){btns.forEach(function(b){b.style.background='var(--surface)'});btn.style.background='var(--primary)';iframe.src=btn.getAttribute('data-src')})})})();` }} />

          {/* Related movies */}
          {similar.length > 0 && (
            <section style={{ marginTop: '1.5rem' }}>
              <h2 className="section-heading" style={{ marginBottom: '1rem' }}>Related Movies</h2>
              <MovieGrid movies={similar.map((m: any) => ({
                id: m.id, title: m.title || m.name, poster_path: m.poster_path,
                vote_average: m.vote_average, release_date: m.release_date || m.first_air_date,
                media_type: m.media_type || 'movie',
              }))} />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
