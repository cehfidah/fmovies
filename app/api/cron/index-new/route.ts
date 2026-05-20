import { NextResponse } from 'next/server';
import { getNowPlayingMovies, getUpcomingMovies, getOnAirTV, getTrending, slugify } from '@/lib/tmdb';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://fmoviesz.cyou';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Protect cron — Vercel sends Authorization header with CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch today's new/upcoming content from TMDB
    const [nowPlaying, upcoming, onAir, trendingDay] = await Promise.all([
      getNowPlayingMovies(1).then((r: any) => r?.results || []),
      getUpcomingMovies(1).then((r: any) => r?.results || []),
      getOnAirTV(1).then((r: any) => r?.results || []),
      getTrending('all', 'day', 1).then((r: any) => r?.results || []),
    ]);

    // Build URL list
    const urls: string[] = [];

    for (const m of [...nowPlaying, ...upcoming]) {
      if (m?.id && m?.title) {
        urls.push(`${BASE}/movie/${slugify(m.title, (m.release_date || '').slice(0, 4))}?id=${m.id}`);
      }
    }
    for (const t of onAir) {
      if (t?.id && t?.name) {
        urls.push(`${BASE}/tv/${slugify(t.name, (t.first_air_date || '').slice(0, 4))}?id=${t.id}`);
      }
    }
    for (const item of trendingDay) {
      if (item?.media_type === 'movie' && item?.title) {
        urls.push(`${BASE}/movie/${slugify(item.title, (item.release_date || '').slice(0, 4))}?id=${item.id}`);
      } else if (item?.media_type === 'tv' && item?.name) {
        urls.push(`${BASE}/tv/${slugify(item.name, (item.first_air_date || '').slice(0, 4))}?id=${item.id}`);
      }
    }

    // Deduplicate
    const uniqueUrls = [...new Set(urls)].slice(0, 100); // IndexNow limit per request

    if (!INDEXNOW_KEY || uniqueUrls.length === 0) {
      return NextResponse.json({ ok: true, submitted: 0, urls: uniqueUrls.length, note: 'No key or no URLs' });
    }

    // Submit to IndexNow (picked up by Google, Bing, Yandex)
    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(BASE).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`,
        urlList: uniqueUrls,
      }),
    });

    return NextResponse.json({
      ok: true,
      submitted: uniqueUrls.length,
      indexNowStatus: indexNowRes.status,
      urls: uniqueUrls,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
