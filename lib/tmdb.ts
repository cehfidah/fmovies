const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p';
import { cache } from 'react';

export function poster(path: string | null, size = 'w342') {
  if (!path) return 'https://via.placeholder.com/342x513/161b22/00acc1?text=No+Poster';
  return `${TMDB_IMG}/${size}${path}`;
}

export function backdrop(path: string | null, size = 'w1280'): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMG}/${size}${path}`;
}

// ── Module-level server memory cache ──────────────────────────────────────────
// Persists across requests for the lifetime of the Node.js process.
// Fixes dev-mode where Next.js fetch Data Cache doesn't persist between requests,
// causing every navigation to hit TMDB and triggering rate limits.
//
// Using global object so the cache SURVIVES Next.js HMR module re-evaluation.
// Without this, every file save would reset the Map and clear all cached data.
const MEM_TTL = 24 * 60 * 60 * 1000; // 24 hours

type CacheEntry = { data: unknown; expires: number };
const g = global as typeof global & {
  __tmdbMem?: Map<string, CacheEntry>;
  __tmdbFlight?: Map<string, Promise<unknown>>;
};
const memCache: Map<string, CacheEntry> = (g.__tmdbMem ??= new Map());
const inFlight: Map<string, Promise<unknown>> = (g.__tmdbFlight ??= new Map());

function memGet(key: string): unknown | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { memCache.delete(key); return null; }
  return entry.data;
}

function memSet(key: string, data: unknown) {
  memCache.set(key, { data, expires: Date.now() + MEM_TTL });
}
// ──────────────────────────────────────────────────────────────────────────────

async function tmdb(endpoint: string, params: Record<string, string> = {}, forceFresh = false) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY is not set');
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', key);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  // forceFresh: add unique timestamp so URL is unique per call — defeats Next.js
  // per-request fetch deduplication even when generateMetadata + page retry
  // both call the same endpoint with cache:'no-store'.
  if (forceFresh) url.searchParams.set('_r', Date.now().toString());

  // Build a stable cache key (without the _r timestamp)
  const cacheKey = `${endpoint}?${new URLSearchParams({ ...params }).toString()}`;

  // Skip memory cache for forceFresh calls (retries after failure)
  if (!forceFresh) {
    const hit = memGet(cacheKey);
    if (hit !== null) return hit;

    // In-flight dedup: return existing Promise if this exact call is in progress
    if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);
  }

  const cacheOpt = forceFresh ? { cache: 'no-store' as const } : { next: { revalidate: 86400 } };

  const fetchOnce = async () => {
    let res = await fetch(url.toString(), cacheOpt);

    // Retry up to 2× on 429 / 5xx with exponential backoff
    if (!res.ok && (res.status >= 500 || res.status === 429)) {
      await new Promise(r => setTimeout(r, res.status === 429 ? 1200 : 600));
      res = await fetch(url.toString(), { cache: 'no-store' });
    }
    if (!res.ok && (res.status >= 500 || res.status === 429)) {
      await new Promise(r => setTimeout(r, 2000));
      res = await fetch(url.toString(), { cache: 'no-store' });
    }

    if (!res.ok) throw new Error(`TMDB ${endpoint} → ${res.status}`);
    const data = await res.json();
    if (!forceFresh) memSet(cacheKey, data);
    return data;
  };

  if (forceFresh) return fetchOnce();

  // Register in-flight promise so concurrent requests share it
  const promise = fetchOnce().finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, promise);
  return promise;
}

export const getTrending = (type: 'movie' | 'tv' | 'all' = 'all', window: 'day' | 'week' = 'week', page = 1) =>
  tmdb(`/trending/${type}/${window}`, { page: String(page) });

export const getPopularMovies = (page = 1) => tmdb('/movie/popular', { page: String(page) });
export const getPopularTV = (page = 1) => tmdb('/tv/popular', { page: String(page) });
export const getTopRatedMovies = (page = 1) => tmdb('/movie/top_rated', { page: String(page) });
export const getTopRatedTV = (page = 1) => tmdb('/tv/top_rated', { page: String(page) });

export const searchMulti = (query: string, page = 1) =>
  tmdb('/search/multi', { query, page: String(page) });

export const getMovieDetails = (id: number) =>
  tmdb(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' });

// Force-fresh version — bypasses Next.js deduplication cache, used for retries
export const getMovieDetailsFresh = (id: number) =>
  tmdb(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }, true);

// React cache() — shares ONE TMDB call between generateMetadata + page component
// so both use the same result instead of making separate requests
export const getMovieDetailsMemo = cache((id: number) =>
  tmdb(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }));

export const getTVDetails = (id: number) =>
  tmdb(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' });

// Force-fresh version — bypasses Next.js deduplication cache, used for retries
export const getTVDetailsFresh = (id: number) =>
  tmdb(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }, true);

// React cache() — shares ONE TMDB call between generateMetadata + page component
export const getTVDetailsMemo = cache((id: number) =>
  tmdb(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }));

export const discoverMovies = (params: Record<string, string> = {}) =>
  tmdb('/discover/movie', { sort_by: 'popularity.desc', ...params });

export const discoverTV = (params: Record<string, string> = {}) =>
  tmdb('/discover/tv', { sort_by: 'popularity.desc', ...params });

export const getGenres = (type: 'movie' | 'tv' = 'movie') =>
  tmdb(`/genre/${type}/list`);

/** Convert a title to a URL-safe slug */
export function slugify(title: string, year?: string | number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return year ? `${base}-${year}` : base;
}

/** Guess media type from a URL slug (basic heuristic) */
export function typeFromSlug(slug: string): 'movie' | 'tv' {
  return slug.includes('-season-') || slug.startsWith('tv-') ? 'tv' : 'movie';
}
