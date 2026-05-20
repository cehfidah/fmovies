import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import { getMovieDetails, backdrop, poster } from '@/lib/tmdb';
import { getPostBySlug } from '@/lib/db';
import type { Post } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { id: idStr } = await searchParams;

  // Check if it's a blog post first
  const post = await getPostBySlug(slug).catch(() => null) as Post | null;
  if (post && post.published) {
    return {
      title: post.title,
      description: post.meta_description || undefined,
      keywords: post.meta_keywords || undefined,
      openGraph: {
        title: post.title,
        description: post.meta_description || undefined,
        images: post.featured_image ? [post.featured_image] : undefined,
      },
    };
  }

  // TMDB movie/TV
  const tmdbId = idStr ? parseInt(idStr, 10) : null;
  if (tmdbId) {
    const data = await getMovieDetails(tmdbId).catch(() => null);
    if (data) {
      const title = data.title || data.name || slug;
      const year = (data.release_date || data.first_air_date || '').slice(0, 4);
      return {
        title: `Watch ${title} ${year ? `(${year})` : ''} Online Free — Fmovies`,
        description: data.overview
          ? `${data.overview.slice(0, 155)}…`
          : `Watch ${title} online for free on Fmovies in HD quality.`,
        openGraph: {
          title,
          description: data.overview,
          images: data.poster_path ? [poster(data.poster_path, 'w500')] : undefined,
        },
      };
    }
  }

  return {
    title: `${slug.replace(/-/g, ' ')} — Fmovies`,
    robots: { index: false, follow: true },
  };
}

export default async function SlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { id: idStr } = await searchParams;

  // 1. Try blog post
  const post = await getPostBySlug(slug).catch(() => null) as Post | null;
  if (post && post.published) {
    return <BlogPostPage post={post} />;
  }

  // 2. Try TMDB movie
  const tmdbId = idStr ? parseInt(idStr, 10) : null;
  if (tmdbId) {
    const data = await getMovieDetails(tmdbId).catch(() => null);
    if (data) return <MovieDetailPage data={data} isTV={false} />;
  }

  notFound();
}

// ── Blog Post ──────────────────────────────────────────────────────────────
function BlogPostPage({ post }: { post: Post }) {
  return (
    <>
      <Header />
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem', objectFit: 'cover', maxHeight: '400px' }}
          />
        )}
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#e6edf3', marginBottom: '0.75rem', lineHeight: 1.3 }}>
          {post.title}
        </h1>
        <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        {post.content ? (
          <article
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p style={{ color: '#8b949e' }}>No content available.</p>
        )}
      </main>
      <Footer />
    </>
  );
}

// ── Movie / TV Detail ──────────────────────────────────────────────────────
function MovieDetailPage({ data, isTV }: { data: any; isTV: boolean }) {
  const title = data.title || data.name || 'Unknown';
  const year = (data.release_date || data.first_air_date || '').slice(0, 4);
  const genres: { id: number; name: string }[] = data.genres || [];
  const similar = (data.similar?.results || data.recommendations?.results || []).slice(0, 12);

  return (
    <>
      <Header />
      <main>
        {/* Backdrop hero */}
        {data.backdrop_path && (
          <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
            <img
              src={backdrop(data.backdrop_path) || ''}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0b0c0e 0%, rgba(11,12,14,0.7) 50%, rgba(11,12,14,0.3) 100%)' }} />
          </div>
        )}

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {/* Poster */}
            <img
              src={poster(data.poster_path, 'w342')}
              alt={title}
              style={{ width: '200px', borderRadius: '10px', flexShrink: 0, objectFit: 'cover', marginTop: data.backdrop_path ? '-120px' : 0, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: '2px solid #30363d', zIndex: 1, position: 'relative' }}
            />
            {/* Details */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#e6edf3', marginBottom: '0.4rem', lineHeight: 1.2 }}>
                {title} {year && <span style={{ color: '#8b949e', fontWeight: 400, fontSize: '0.75em' }}>({year})</span>}
              </h1>
              {data.tagline && (
                <p style={{ color: '#00acc1', fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  &ldquo;{data.tagline}&rdquo;
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {genres.map(g => (
                  <a key={g.id} href={`/filter?genre=${g.id}`} className="genre-badge">{g.name}</a>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.9rem', color: '#8b949e' }}>
                {data.vote_average > 0 && (
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                    ⭐ {data.vote_average.toFixed(1)} / 10
                  </span>
                )}
                {data.runtime && <span>🕐 {data.runtime} min</span>}
                {data.number_of_seasons && <span>📺 {data.number_of_seasons} season{data.number_of_seasons > 1 ? 's' : ''}</span>}
                {data.status && <span style={{ background: '#1c2128', padding: '2px 8px', borderRadius: '4px' }}>{data.status}</span>}
              </div>
              {data.overview && (
                <p style={{ color: '#c9d1d9', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '600px' }}>
                  {data.overview}
                </p>
              )}

              <div style={{ marginTop: '1.25rem' }}>
                <a href="#watch" className="btn-gradient" style={{ fontSize: '0.95rem' }}>
                  <i className="uil uil-play" /> Watch Now
                </a>
              </div>
            </div>
          </div>

          {/* Player placeholder */}
          <div id="watch" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '2.5rem' }}>
            <i className="uil uil-play-circle" style={{ fontSize: '3rem', color: '#00acc1', display: 'block', marginBottom: '0.75rem' }} />
            <p style={{ color: '#8b949e', fontSize: '0.95rem' }}>Video player will appear here. Add your embed links via the admin panel.</p>
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <MovieGrid heading="You May Also Like" movies={similar} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
