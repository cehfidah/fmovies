import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import PaginationBar from '@/components/PaginationBar';
import { searchMulti } from '@/lib/tmdb';

interface Props {
  params: Promise<{ query: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { query } = await params;
  const q = decodeURIComponent(query);
  return {
    title: `Search: "${q}" â€” Fmovies`,
    description: `Watch "${q}" online for free. Find movies, TV series and more on Fmovies.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { query } = await params;
  const { page: pageStr } = await searchParams;
  const q = decodeURIComponent(query);
  const page = Math.max(1, parseInt(pageStr || '1', 10));
  const data = await searchMulti(q, page).catch(() => ({ results: [], total_results: 0, total_pages: 1 }));
  const results = (data.results || []).filter((r: any) => r.media_type !== 'person');
  const totalPages = Math.min(data.total_pages || 1, 10); // TMDB caps at 500 pages, we cap at 10

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Search bar repeat â€” lets user refine without scrolling to header */}
        <form action="" method="GET" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', maxWidth: '520px' }}
          onSubmit={undefined}>
          <a href={`/search/${encodeURIComponent(q)}`} style={{ display: 'none' }} />
        </form>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Search Results For: {q}
          </h1>
          <span style={{ color: '#8b949e', fontSize: '0.82rem' }}>
            {data.total_results || 0} results found
          </span>
        </div>

        {results.length > 0 ? (
          <>
            <MovieGrid movies={results} />
            <div style={{ marginTop: '2rem' }}>
              <PaginationBar current={page} total={totalPages} basePath={`/search/${encodeURIComponent(q)}?`} />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#8b949e' }}>
            <i className="uil uil-search" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>No results found for &quot;{q}&quot;</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try a different search term or browse our categories.</p>
            <a href="/home" className="btn-gradient" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Back to Home
            </a>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

