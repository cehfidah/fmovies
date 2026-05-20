import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import { discoverMovies, discoverTV, getGenres } from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Filter Movies & TV Shows — Fmovies',
  description: 'Filter and browse movies and TV shows by genre, year, rating, and more on Fmovies.',
  alternates: { canonical: 'https://fmoviesz.cyou/filter' },
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{
    type?: string;
    genre?: string;
    year?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function FilterPage({ searchParams }: Props) {
  const { type: typeStr, genre: genreStr, year: yearStr, sort: sortStr, page: pageStr } = await searchParams;
  const type = typeStr === 'tv' ? 'tv' : 'movie';
  const genre = genreStr || '';
  const year = yearStr || '';
  const sort = sortStr || 'popularity.desc';
  const page = Math.max(1, parseInt(pageStr || '1', 10));

  const discoverParams: Record<string, string> = { sort_by: sort, page: String(page) };
  if (genre) discoverParams.with_genres = genre;
  if (year) {
    if (type === 'movie') discoverParams.primary_release_year = year;
    else discoverParams.first_air_date_year = year;
  }

  const [data, genreList] = await Promise.all([
    (type === 'tv' ? discoverTV(discoverParams) : discoverMovies(discoverParams)).catch(() => ({
      results: [],
      total_pages: 1,
    })),
    getGenres(type).catch(() => ({ genres: [] })),
  ]);

  const genres: { id: number; name: string }[] = genreList.genres || [];
  const years = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 className="section-heading" style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
          Filter
        </h1>

        {/* Filter bar */}
        <form method="GET" action="/filter" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
          {/* Type */}
          <div>
            <label className="form-label">Type</label>
            <select name="type" defaultValue={type} className="form-control" style={{ width: 'auto', minWidth: '120px' }}>
              <option value="movie">Movies</option>
              <option value="tv">TV Series</option>
            </select>
          </div>

          {/* Genre */}
          <div>
            <label className="form-label">Genre</label>
            <select name="genre" defaultValue={genre} className="form-control" style={{ width: 'auto', minWidth: '150px' }}>
              <option value="">All Genres</option>
              {genres.map(g => (
                <option key={g.id} value={String(g.id)}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="form-label">Year</label>
            <select name="year" defaultValue={year} className="form-control" style={{ width: 'auto', minWidth: '120px' }}>
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="form-label">Sort By</label>
            <select name="sort" defaultValue={sort} className="form-control" style={{ width: 'auto', minWidth: '170px' }}>
              <option value="popularity.desc">Popularity ↓</option>
              <option value="vote_average.desc">Rating ↓</option>
              <option value="release_date.desc">Newest First</option>
              <option value="release_date.asc">Oldest First</option>
            </select>
          </div>

          <button type="submit" className="btn-gradient" style={{ marginTop: 'auto', padding: '0.55rem 1.25rem' }}>
            Apply <i className="uil uil-filter" />
          </button>
        </form>

        <MovieGrid movies={data.results || []} />

        {/* Simple pagination */}
        {data.total_pages > 1 && (
          <div className="pagination" style={{ marginTop: '2rem' }}>
            {page > 1 && (
              <a
                href={`/filter?type=${type}&genre=${genre}&year=${year}&sort=${sort}&page=${page - 1}`}
                className="page-btn"
              >
                ← Prev
              </a>
            )}
            <span className="page-btn active">{page}</span>
            {page < data.total_pages && (
              <a
                href={`/filter?type=${type}&genre=${genre}&year=${year}&sort=${sort}&page=${page + 1}`}
                className="page-btn"
              >
                Next →
              </a>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
