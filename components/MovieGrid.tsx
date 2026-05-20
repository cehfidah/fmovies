import MovieCard from './MovieCard';
import type { Movie } from '@/types';

interface Props {
  movies: Movie[];
  heading?: string;
}

export default function MovieGrid({ movies, heading }: Props) {
  if (!movies || movies.length === 0) return null;
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      {heading && <h2 className="section-heading">{heading}</h2>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '1rem',
        }}
      >
        {movies.map((m, i) => (
          <MovieCard key={`${m.id}-${i}`} movie={m} priority={i < 6} />
        ))}
      </div>
    </section>
  );
}
