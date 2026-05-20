import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import PaginationBar from '@/components/PaginationBar';
import { getTrending } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Trending Movies & TV Shows — Fmovies',
  description: 'Watch the most trending movies and TV series right now. Stream the hottest content online for free in HD quality on Fmovies.',
  keywords: 'trending movies, trending TV shows, trending series, most popular movies, popular TV shows, Fmovies trending',
  alternates: { canonical: 'https://fmoviesz.cyou/trending' },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string; type?: string }>;
}

export default async function TrendingPage({ searchParams }: Props) {
  const { page: pageStr, type: typeStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10));
  const type = typeStr === 'tv' ? 'tv' : typeStr === 'all' ? 'all' : 'movie';

  const mediaType = type === 'all' ? 'all' : type;
  const data = await getTrending(mediaType as 'all' | 'movie' | 'tv', 'week', page).catch(() => ({ results: [], total_pages: 1 }));

  // getTrending returns page 1 from TMDB — for pagination we'd need to pass page param
  // TMDB trending endpoint supports page param via discoverMovies workaround
  const results = (data.results || []).filter((r: any) => r.media_type !== 'person');
  const totalPages = Math.min(data.total_pages || 1, 50);

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="section-heading" style={{ fontSize: '1.5rem' }}>Trending Now</h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Most popular movies and TV shows this week
          </p>
        </div>

        {/* Type Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['movie', 'tv', 'all'] as const).map(t => (
            <a key={t} href={`/trending?type=${t}`}
              style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none',
                background: type === t ? 'var(--primary)' : 'var(--surface)',
                color: '#fff', border: '1px solid var(--border)' }}>
              {t === 'all' ? 'All' : t === 'tv' ? 'TV Shows' : 'Movies'}
            </a>
          ))}
        </div>

        {results.length > 0 ? (
          <>
            <MovieGrid
              movies={results.map((m: any) => ({
                id: m.id, title: m.title || m.name, poster_path: m.poster_path,
                vote_average: m.vote_average, release_date: m.release_date || m.first_air_date,
                media_type: m.media_type || type,
              }))}
            />
            {totalPages > 1 && (
              <PaginationBar
                current={page}
                total={totalPages}
                basePath={`/trending?type=${type}&`}
              />
            )}
          </>
        ) : (
          <p style={{ color: '#8b949e', textAlign: 'center', padding: '3rem' }}>No trending content right now.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
