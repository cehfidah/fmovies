import Link from 'next/link';
import { poster, slugify } from '@/lib/tmdb';
import type { Movie } from '@/types';

interface Props {
  movie: Movie;
  priority?: boolean;
}

export default function MovieCard({ movie, priority = false }: Props) {
  const title = movie.title || movie.name || 'Untitled';
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const isTV = !!movie.name || movie.media_type === 'tv';
  const slug = slugify(title, year);
  const href = isTV ? `/tv/${slug}?id=${movie.id}` : `/movie/${slug}?id=${movie.id}`;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <Link href={href} className="movie-card" style={{ display: 'block' }}>
      <div className="poster-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster(movie.poster_path)}
          alt={title}
          loading={priority ? 'eager' : 'lazy'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* HD badge — top-left like fmoviess.org */}
        <span style={{
          position: 'absolute', top: '6px', left: '6px',
          background: '#00acc1', color: '#fff',
          fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em',
          padding: '2px 6px', borderRadius: '4px', lineHeight: 1.4,
        }}>HD</span>
        {rating && <span className="rating-badge">⭐ {rating}</span>}
        <span className="type-badge">{isTV ? 'TV' : 'Movie'}</span>
      </div>
      <div className="card-body">
        <div className="card-title">{title}</div>
        {year && <div className="card-year">{year}</div>}
      </div>
    </Link>
  );
}
