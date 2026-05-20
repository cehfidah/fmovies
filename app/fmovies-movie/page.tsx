import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import PaginationBar from '@/components/PaginationBar';
import { discoverMovies } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Watch Free Movies Online — Fmovies',
  description:
    'Watch free movies online in HD quality on Fmovies. Browse thousands of movies — action, comedy, drama, horror, and more.',
  alternates: { canonical: 'https://fmoviesz.cyou/fmovies-movie' },
};

export const revalidate = 3600;

const SORT_OPTIONS = [
  { label: 'Latest Release', value: 'primary_release_date.desc' },
  { label: 'Recent Update', value: 'popularity.desc' },
  { label: 'Most Favorite', value: 'vote_count.desc' },
  { label: 'Most Rating', value: 'vote_average.desc' },
  { label: 'Top IMDb', value: 'vote_average.desc' },
];

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019'];

interface Props {
  searchParams: Promise<{ page?: string; sort?: string; year?: string }>;
}

export default async function MoviesPage({ searchParams }: Props) {
  const { page: pageStr, sort = 'primary_release_date.desc', year = '' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10));

  const params: Record<string, string> = {
    sort_by: SORT_OPTIONS.find(s => s.value === sort)?.value || 'primary_release_date.desc',
    page: String(page),
    'vote_count.gte': '10',
  };
  if (year) {
    params.primary_release_year = year;
  }

  const data = await discoverMovies(params).catch(() => ({ results: [], total_pages: 1 }));

  const basePath = `/fmovies-movie?sort=${sort}${year ? `&year=${year}` : ''}&`;

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Page title */}
        <h1 className="section-heading" style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Watch Movies</h1>

        {/* Inline filter bar — no dropdown, no overlap */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px',
          padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem',
        }}>
          {/* Sort row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#8b949e', fontSize: '0.78rem', fontWeight: 600, minWidth: '58px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sort by</span>
            {SORT_OPTIONS.map(opt => (
              <a key={opt.value + opt.label}
                href={`/fmovies-movie?sort=${opt.value}${year ? `&year=${year}` : ''}`}
                style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem',
                  background: sort === opt.value ? 'var(--primary)' : 'var(--surface)',
                  color: sort === opt.value ? '#fff' : '#c9d1d9',
                  border: `1px solid ${sort === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                  textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: sort === opt.value ? 600 : 400,
                }}>
                {opt.label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Year row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#8b949e', fontSize: '0.78rem', fontWeight: 600, minWidth: '58px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Year</span>
            <a href={`/fmovies-movie?sort=${sort}`}
              style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem',
                background: !year ? 'var(--primary)' : 'var(--surface)',
                color: !year ? '#fff' : '#c9d1d9',
                border: `1px solid ${!year ? 'var(--primary)' : 'var(--border)'}`,
                textDecoration: 'none', fontWeight: !year ? 600 : 400,
              }}>All</a>
            {YEARS.map(y => (
              <a key={y} href={`/fmovies-movie?sort=${sort}&year=${y}`}
                style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem',
                  background: year === y ? 'var(--primary)' : 'var(--surface)',
                  color: year === y ? '#fff' : '#c9d1d9',
                  border: `1px solid ${year === y ? 'var(--primary)' : 'var(--border)'}`,
                  textDecoration: 'none', fontWeight: year === y ? 600 : 400,
                }}>{y}</a>
            ))}
          </div>
        </div>

        <MovieGrid movies={(data.results || []).map((m: any) => ({ ...m, media_type: 'movie' }))} />
        <PaginationBar
          current={page}
          total={Math.min(data.total_pages || 1, 500)}
          basePath={basePath}
        />
      </main>
      <Footer />
    </>
  );
}
