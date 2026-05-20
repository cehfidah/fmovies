import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import { getTrending, getPopularMovies, getPopularTV } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Fmovies — Watch Free Movies & TV Shows Online',
  description:
    'Browse thousands of movies and TV shows on Fmovies. Stream free HD content — no registration required.',
  alternates: { canonical: 'https://fmoviesz.cyou/home' },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, popularMovies, popularTV] = await Promise.all([
    getTrending('all', 'week').catch(() => ({ results: [] })),
    getPopularMovies(1).catch(() => ({ results: [] })),
    getPopularTV(1).catch(() => ({ results: [] })),
  ]);

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0b1a1c, #0b0c0e)',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e6edf3', marginBottom: '0.25rem' }}>
              Watch Free HD Movies &amp; TV Shows
            </h1>
            <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
              Stream the latest releases &mdash; no signup, no cost.
            </p>
          </div>
          <a href="/fmovies-movie" className="btn-gradient" style={{ fontSize: '0.9rem', padding: '0.55rem 1.25rem' }}>
            Browse Movies <i className="uil uil-arrow-right" />
          </a>
        </div>

        <MovieGrid
          heading="Trending This Week"
          movies={trending.results?.slice(0, 20) || []}
        />
        <MovieGrid
          heading="Popular Movies"
          movies={popularMovies.results?.slice(0, 20) || []}
        />
        <MovieGrid
          heading="Popular TV Series"
          movies={popularTV.results?.slice(0, 20) || []}
        />
      </main>
      <Footer />
    </>
  );
}
