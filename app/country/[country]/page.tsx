import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import PaginationBar from '@/components/PaginationBar';
import { discoverMovies, discoverTV } from '@/lib/tmdb';
import { COUNTRY_MAP } from '@/lib/slug-map';

export async function generateStaticParams() {
  return Object.keys(COUNTRY_MAP).map(country => ({ country }));
}
export const revalidate = 3600;
export const dynamicParams = false;

interface Props {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ page?: string; type?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const c = COUNTRY_MAP[country];
  if (!c) return { title: 'Country — Fmovies' };
  return {
    title: `Watch ${c.label} Movies & TV Shows Online Free — Fmovies`,
    description: `Stream the best movies and TV series from ${c.label} online for free in HD. Watch ${c.label} content on Fmovies.`,
    keywords: `${c.label} movies, ${c.label} series, watch ${c.label} movies online free, Fmovies ${c.label}`,
    alternates: { canonical: `https://fmoviesz.cyou/country/${country}` },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export default async function CountryPage({ params, searchParams }: Props) {
  const { country } = await params;
  const { page: pageStr, type: typeStr } = await searchParams;

  const c = COUNTRY_MAP[country];
  if (!c) notFound();

  const page = Math.max(1, parseInt(pageStr || '1', 10));
  const type = typeStr === 'tv' ? 'tv' : 'movie';

  const data = type === 'tv'
    ? await discoverTV({ with_origin_country: c.code, page: String(page), sort_by: 'popularity.desc' }).catch(() => ({ results: [], total_pages: 1 }))
    : await discoverMovies({ with_origin_country: c.code, page: String(page), sort_by: 'popularity.desc' }).catch(() => ({ results: [], total_pages: 1 }));

  const totalPages = Math.min(data.total_pages || 1, 100);

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="section-heading" style={{ fontSize: '1.5rem' }}>
            {c.label} {type === 'tv' ? 'TV Shows' : 'Movies'}
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Stream {c.label} {type === 'tv' ? 'TV shows' : 'movies'} online for free in HD
          </p>
        </div>

        {/* Type Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <a href={`/country/${country}?type=movie`}
            style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none',
              background: type === 'movie' ? 'var(--primary)' : 'var(--surface)',
              color: '#fff', border: '1px solid var(--border)' }}>
            Movies
          </a>
          <a href={`/country/${country}?type=tv`}
            style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none',
              background: type === 'tv' ? 'var(--primary)' : 'var(--surface)',
              color: '#fff', border: '1px solid var(--border)' }}>
            TV Shows
          </a>
        </div>

        {data.results?.length > 0 ? (
          <>
            <MovieGrid
              movies={(data.results || []).map((m: any) => ({
                id: m.id, title: m.title || m.name, poster_path: m.poster_path,
                vote_average: m.vote_average, release_date: m.release_date || m.first_air_date,
                media_type: type,
              }))}
            />
            <PaginationBar
              current={page}
              total={totalPages}
              basePath={`/country/${country}?type=${type}&`}
            />
          </>
        ) : (
          <p style={{ color: '#8b949e', textAlign: 'center', padding: '3rem' }}>No results found.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
