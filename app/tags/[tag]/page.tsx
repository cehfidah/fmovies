import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import PaginationBar from '@/components/PaginationBar';
import { searchMulti } from '@/lib/tmdb';

interface Props {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${label} — Watch Free Online — Fmovies`,
    description: `Find and stream "${label}" movies and TV series online for free in HD quality on Fmovies.`,
    keywords: `${label}, watch ${label} online free, Fmovies, movies, series`,
    alternates: { canonical: `https://fmoviesz.cyou/tags/${tag}` },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { page: pageStr } = await searchParams;

  // Tags on the original site were freeform — treat as keyword search
  // Strip common prefix: "watch-series-show-name-season-..." → extract the useful part
  // Tags are typically: "watch-series-{title}-{year}-season-{s}-episode-{e}-on-fmovies"
  let query = tag
    .replace(/^watch-(series|movie)-/, '')
    .replace(/-season-\d+-episode-\d+.*$/, '')
    .replace(/-on-fmovies.*$/, '')
    .replace(/-\d{4}$/, '')
    .replace(/-/g, ' ')
    .trim();

  // Fallback if too short
  if (query.length < 2) query = tag.replace(/-/g, ' ');

  const label = query.replace(/\b\w/g, c => c.toUpperCase());
  const page = Math.max(1, parseInt(pageStr || '1', 10));

  const data = await searchMulti(query, page).catch(() => ({ results: [], total_results: 0, total_pages: 1 }));
  const results = (data.results || []).filter((r: any) => r.media_type !== 'person');
  const totalPages = Math.min(data.total_pages || 1, 20);

  if (results.length === 0) notFound();

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="section-heading" style={{ fontSize: '1.5rem' }}>{label}</h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {data.total_results || 0} results
          </p>
        </div>

        <MovieGrid
          movies={results.map((m: any) => ({
            id: m.id, title: m.title || m.name, poster_path: m.poster_path,
            vote_average: m.vote_average, release_date: m.release_date || m.first_air_date,
            media_type: m.media_type || 'movie',
          }))}
        />
        {totalPages > 1 && (
          <PaginationBar
            current={page}
            total={totalPages}
            basePath={`/tags/${tag}?`}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
