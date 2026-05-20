import { NextRequest, NextResponse } from 'next/server';
import { initDB, upsertSlugMapping } from '@/lib/db';
import mappings from '@/lib/slug_mappings.json';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDB();

    const entries = Object.entries(mappings as Record<string, {
      tmdb_id: number; imdb_id: string; media_type: string; title: string;
    }>);

    let inserted = 0;
    for (const [slug, entry] of entries) {
      await upsertSlugMapping(
        slug,
        entry.tmdb_id,
        entry.imdb_id,
        entry.media_type as 'movie' | 'tv',
        entry.title
      );
      inserted++;
    }

    return NextResponse.json({ ok: true, seeded: inserted });
  } catch (err: any) {
    console.error('[seed-slugs]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
