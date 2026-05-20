import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import PaginationBar from '@/components/PaginationBar';
import { getTopRatedMovies, getTopRatedTV } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Top IMDb Movies & TV Shows — Fmovies',
  description:
    'Discover the highest-rated movies and TV shows on IMDb. Stream the best content for free on Fmovies.',
  alternates: { canonical: 'https://fmoviesz.cyou/top-imdb' },
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string; tab?: string }>;
}

export default async function TopImdbPage({ searchParams }: Props) {
  const { page: pageStr, tab: tabStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10));
  const tab = tabStr === 'tv' ? 'tv' : 'movie';

  const data =
    tab === 'tv'
      ? await getTopRatedTV(page).catch(() => ({ results: [], total_pages: 1 }))
      : await getTopRatedMovies(page).catch(() => ({ results: [], total_pages: 1 }));

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="section-heading" style={{ fontSize: '1.4rem' }}>
            Top IMDb
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
            The highest-rated movies and series of all time.
          </p>
        </div>

        {/* Tabs */}
        <div className="nav-tabs-custom" style={{ marginBottom: '1.5rem' }}>
          <a href="/top-imdb?tab=movie" className={`nav-tab ${tab === 'movie' ? 'active' : ''}`}>
            Movies
          </a>
          <a href="/top-imdb?tab=tv" className={`nav-tab ${tab === 'tv' ? 'active' : ''}`}>
            TV Series
          </a>
        </div>

        <MovieGrid movies={(data.results || []).map((m: any) => ({ ...m, media_type: tab === 'tv' ? 'tv' : 'movie' }))} />
        <PaginationBar
          current={page}
          total={Math.min(data.total_pages || 1, 500)}
          basePath={`/top-imdb?tab=${tab}&`}
          paramName="page"
        />
      </main>
      <Footer />
    </>
  );
}
