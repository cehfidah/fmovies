import { NextRequest, NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total_results: 0 });
  }

  try {
    const data = await searchMulti(q.slice(0, 200), page);
    // Filter out person results for cleaner responses
    const results = (data.results || []).filter((r: any) => r.media_type !== 'person');
    return NextResponse.json({ results, total_results: data.total_results, total_pages: data.total_pages });
  } catch (err) {
    console.error('[search]', err);
    return NextResponse.json({ results: [], total_results: 0 });
  }
}
