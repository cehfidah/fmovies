import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/db';
import mappings from '@/lib/slug_mappings.json';
import { GENRE_MAP, COUNTRY_MAP } from '@/lib/slug-map';
import { getPopularMovies, getPopularTV, getTopRatedMovies, getTopRatedTV, getTrending, getNowPlayingMovies, getUpcomingMovies, getOnAirTV, slugify } from '@/lib/tmdb';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';

export const revalidate = 86400; // regenerate once per day

async function fetchPages(fn: (page: number) => Promise<any>, pages = 5): Promise<any[]> {
  const results = await Promise.allSettled(
    Array.from({ length: pages }, (_, i) => fn(i + 1))
  );
  return results.flatMap(r => r.status === 'fulfilled' ? (r.value?.results || []) : []);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/home`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/trending`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/fmovies-movie`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/fmovies-series`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/top-imdb`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/filter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Genre pages
  const genreRoutes: MetadataRoute.Sitemap = Object.keys(GENRE_MAP).map(g => ({
    url: `${BASE}/genre/${g}`,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // Country pages
  const countryRoutes: MetadataRoute.Sitemap = Object.keys(COUNTRY_MAP).map(c => ({
    url: `${BASE}/country/${c}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Archived movie/series slug pages
  const slugRoutes: MetadataRoute.Sitemap = Object.entries(
    mappings as Record<string, { media_type: string }>
  ).map(([slug, entry]) => ({
    url: `${BASE}/${entry.media_type === 'movie' ? 'fmovies-movie' : 'fmovies-series'}/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // ── TMDB dynamic pages (popular + top-rated + trending) ──
  const [popularMovies, topRatedMovies, trendingMovies, nowPlayingMovies, upcomingMovies, popularTV, topRatedTV, trendingTV, onAirTV] =
    await Promise.all([
      fetchPages(getPopularMovies, 2),
      fetchPages(getTopRatedMovies, 2),
      fetchPages((p) => getTrending('movie', 'week', p), 1),
      fetchPages(getNowPlayingMovies, 1),
      fetchPages(getUpcomingMovies, 1),
      fetchPages(getPopularTV, 2),
      fetchPages(getTopRatedTV, 2),
      fetchPages((p) => getTrending('tv', 'week', p), 1),
      fetchPages(getOnAirTV, 1),
    ]);

  // Deduplicate by id
  const seenMovies = new Set<number>();
  const movieRoutes: MetadataRoute.Sitemap = [...popularMovies, ...topRatedMovies, ...trendingMovies, ...nowPlayingMovies, ...upcomingMovies]
    .filter(m => m?.id && m?.title && !seenMovies.has(m.id) && seenMovies.add(m.id))
    .map(m => ({
      url: `${BASE}/movie/${slugify(m.title, (m.release_date || '').slice(0, 4))}?id=${m.id}`,
      lastModified: m.release_date ? new Date(m.release_date) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }));

  const seenTV = new Set<number>();
  const tvRoutes: MetadataRoute.Sitemap = [...popularTV, ...topRatedTV, ...trendingTV, ...onAirTV]
    .filter(t => t?.id && t?.name && !seenTV.has(t.id) && seenTV.add(t.id))
    .map(t => ({
      url: `${BASE}/tv/${slugify(t.name, (t.first_air_date || '').slice(0, 4))}?id=${t.id}`,
      lastModified: t.first_air_date ? new Date(t.first_air_date) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }));

  // Published blog posts
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPosts(true);
    postRoutes = posts.map((p: any) => ({
      url: `${BASE}/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {}

  return [...staticRoutes, ...genreRoutes, ...countryRoutes, ...slugRoutes, ...movieRoutes, ...tvRoutes, ...postRoutes];
}
