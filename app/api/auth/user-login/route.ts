import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase().slice(0, 255);
    const cleanPass = password.slice(0, 200);

    const rows = await sql`SELECT id, email, name, password_hash FROM site_users WHERE email = ${cleanEmail} LIMIT 1` as any[];
    const user = rows[0];

    if (!user) {
      await bcrypt.compare('dummy', '$2b$12$dummyhashtopreventtimingattacks0');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(cleanPass, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({ id: user.id, email: user.email, name: user.name, role: 'user' });
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    res.cookies.set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[user-login]', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
