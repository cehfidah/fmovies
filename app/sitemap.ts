import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/db';
import mappings from '@/lib/slug_mappings.json';
import { GENRE_MAP, COUNTRY_MAP } from '@/lib/slug-map';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';

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

  return [...staticRoutes, ...genreRoutes, ...countryRoutes, ...slugRoutes, ...postRoutes];
}
