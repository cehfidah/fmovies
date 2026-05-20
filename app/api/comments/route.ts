import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/** GET /api/comments?tmdb_id=123  — fetch comments for a movie/show */
export async function GET(req: NextRequest) {
  const tmdbId = req.nextUrl.searchParams.get('tmdb_id');
  if (!tmdbId || isNaN(Number(tmdbId))) {
    return NextResponse.json({ error: 'tmdb_id is required' }, { status: 400 });
  }
  try {
    const rows = await sql`
      SELECT c.id, c.content, c.created_at,
             COALESCE(u.name, c.guest_name, 'Anonymous') AS author
      FROM movie_comments c
      LEFT JOIN site_users u ON u.id = c.user_id
      WHERE c.tmdb_id = ${Number(tmdbId)}
      ORDER BY c.created_at DESC
      LIMIT 50
    ` as any[];
    return NextResponse.json({ comments: rows });
  } catch (err) {
    console.error('[comments GET]', err);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

/** POST /api/comments  — submit a comment */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tmdb_id, content, guest_name } = body;

    if (!tmdb_id || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'tmdb_id and content are required' }, { status: 400 });
    }

    const cleanContent = content.trim().slice(0, 2000);
    if (cleanContent.length < 2) {
      return NextResponse.json({ error: 'Comment too short' }, { status: 400 });
    }

    // Check for logged-in user via cookie
    let userId: number | null = null;
    const userToken = req.cookies.get('user_token')?.value;
    if (userToken) {
      try {
        const payload = await verifyToken(userToken);
        if (payload && typeof payload === 'object' && 'id' in payload) {
          userId = payload.id as number;
        }
      } catch {
        // not logged in, guest comment
      }
    }

    const cleanGuestName = userId ? null : (guest_name || 'Anonymous').toString().trim().slice(0, 80);

    const rows = await sql`
      INSERT INTO movie_comments (tmdb_id, user_id, guest_name, content)
      VALUES (${Number(tmdb_id)}, ${userId}, ${cleanGuestName}, ${cleanContent})
      RETURNING id, content, created_at
    ` as any[];

    return NextResponse.json({ ok: true, comment: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[comments POST]', err);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
