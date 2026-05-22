import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { getPosts } from '@/lib/db';
import { submitToIndexNow } from '@/lib/indexnow';

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.fmoviesz.cyou';

/**
 * POST /api/indexnow
 * Body (optional): { urls: string[] }
 * If no urls provided, submits all published blog posts.
 * Requires admin auth.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let urls: string[] = [];

    const body = await req.json().catch(() => ({}));
    if (Array.isArray(body.urls) && body.urls.length > 0) {
      // Validate and sanitize provided URLs
      urls = body.urls
        .filter((u: unknown) => typeof u === 'string')
        .map((u: string) => u.trim())
        .filter((u: string) => u.startsWith('https://'));
    } else {
      // Default: submit all published posts
      const posts = await getPosts(true);
      urls = posts.map((p: any) => `${SITE}/${p.slug}`);
    }

    if (urls.length === 0) {
      return NextResponse.json({ ok: false, message: 'No URLs to submit' });
    }

    // IndexNow allows max 10,000 URLs per request; batch if needed
    const BATCH = 10000;
    for (let i = 0; i < urls.length; i += BATCH) {
      await submitToIndexNow(urls.slice(i, i + BATCH));
    }

    return NextResponse.json({ ok: true, submitted: urls.length, urls });
  } catch (err) {
    console.error('[POST /api/indexnow]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
