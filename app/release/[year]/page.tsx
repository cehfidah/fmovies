import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import { discoverMovies, discoverTV } from '@/lib/tmdb';

interface Props {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ type?: string; page?: string }>;
}

const CURRENT_YEAR = new Date().getFullYear();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  const y = parseInt(year, 10);
  if (isNaN(y) || y < 1900 || y > CURRENT_YEAR + 1) return { title: 'FMoviesz' };
  return {
    title: `Watch ${y} Movies & TV Shows Online Free — FMoviesz`,
    description: `Browse and watch all ${y} movies and TV shows online free in HD on FMoviesz. Latest ${y} releases.`,
    keywords: `${y} movies, watch ${y} movies online, ${y} films free, new movies ${y}, fmovies ${y}`,
    alternates: { canonical: `https://fmoviesz.cyou/release/${year}` },
  };
}

export default async function ReleasePage({ params, searchParams }: Props) {
  const { year } = await params;
  const { type = 'movies', page: pageStr = '1' } = await searchParams;
  const y = parseInt(year, 10);

  if (isNaN(y) || y < 1900 || y > CURRENT_YEAR + 1) notFound();

  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const isTV = type === 'tv';

  const data = isTV
    ? await discoverTV({
        sort_by: 'popularity.desc',
        'first_air_date.gte': `${y}-01-01`,
        'first_air_date.lte': `${y}-12-31`,
        page: String(page),
      }).catch(() => ({ results: [], total_pages: 1 }))
    : await discoverMovies({
        sort_by: 'popularity.desc',
        primary_release_year: String(y),
        'vote_count.gte': '5',
        page: String(page),
      }).catch(() => ({ results: [], total_pages: 1 }));

  const items = (data.results || []).map((m: any) => ({
    ...m,
    media_type: isTV ? 'tv' : 'movie',
    title: m.title || m.name,
  }));
  const totalPages = Math.min(data.total_pages || 1, 20);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b0c0e]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
            <a href="/" className="hover:text-[#00acc1]">Home</a>
            <span>/</span>
            <span className="text-gray-300">Release {y}</span>
          </nav>

          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-extrabold text-white">
              {y} {isTV ? 'TV Shows' : 'Movies'}
            </h1>
            <div className="flex gap-2">
              <a
                href={`/release/${year}?type=movies`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!isTV ? 'bg-[#00acc1] text-white' : 'bg-[#1c2128] border border-[#30363d] text-gray-300 hover:border-[#00acc1]'}`}
              >
                Movies
              </a>
              <a
                href={`/release/${year}?type=tv`}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${isTV ? 'bg-[#00acc1] text-white' : 'bg-[#1c2128] border border-[#30363d] text-gray-300 hover:border-[#00acc1]'}`}
              >
                TV Shows
              </a>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-20">No results found for {y}.</p>
          ) : (
            <MovieGrid heading="" movies={items} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {page > 1 && (
                <a href={`/release/${year}?type=${type}&page=${page - 1}`} className="px-4 py-2 bg-[#1c2128] border border-[#30363d] text-gray-300 rounded-lg text-sm hover:border-[#00acc1] transition">
                  ← Prev
                </a>
              )}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, page - 2) + i;
                if (p > totalPages) return null;
                return (
                  <a key={p} href={`/release/${year}?type=${type}&page=${p}`}
                    className={`px-4 py-2 rounded-lg text-sm transition ${p === page ? 'bg-[#00acc1] text-white' : 'bg-[#1c2128] border border-[#30363d] text-gray-300 hover:border-[#00acc1]'}`}>
                    {p}
                  </a>
                );
              })}
              {page < totalPages && (
                <a href={`/release/${year}?type=${type}&page=${page + 1}`} className="px-4 py-2 bg-[#1c2128] border border-[#30363d] text-gray-300 rounded-lg text-sm hover:border-[#00acc1] transition">
                  Next →
                </a>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
