import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase().slice(0, 255);
    const cleanName = (name || '').toString().trim().slice(0, 100);
    const cleanPass = password.slice(0, 200);

    if (cleanPass.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM site_users WHERE email = ${cleanEmail} LIMIT 1` as any[];
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hash = await bcrypt.hash(cleanPass, 12);
    const rows = await sql`
      INSERT INTO site_users (email, password_hash, name)
      VALUES (${cleanEmail}, ${hash}, ${cleanName || null})
      RETURNING id, email, name
    ` as any[];
    const user = rows[0];

    const token = await signToken({ id: user.id, email: user.email, name: user.name, role: 'user' });
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    res.cookies.set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
