import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDB, createAdminUser } from '@/lib/db';

/**
 * GET /api/setup — Initialize DB tables and create the first admin user.
 * Protect this with a secret token to prevent unauthorized calls.
 * After first run, you should disable or remove this route.
 */
export async function GET(req: NextRequest) {
  // Require a setup secret to prevent unauthorized initialization
  const { searchParams } = req.nextUrl;
  const secret = searchParams.get('secret');
  const expectedSecret = process.env.SETUP_SECRET || process.env.JWT_SECRET;

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid setup secret. Provide ?secret=YOUR_JWT_SECRET' }, { status: 401 });
  }

  try {
    // Initialize database tables
    await initDB();

    // Create default admin user from env vars
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || '';

    if (!password) {
      return NextResponse.json({
        ok: false,
        message: 'DB initialized but no ADMIN_PASSWORD set. Add it to your env vars and re-run.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await createAdminUser(username, passwordHash);

    return NextResponse.json({
      ok: true,
      message: `Database initialized. Admin user "${username}" created (or already exists).`,
      created: !!admin,
    });
  } catch (err) {
    console.error('[setup]', err);
    return NextResponse.json({ error: 'Setup failed', detail: String(err) }, { status: 500 });
  }
}
