import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { COOKIE_NAME, signToken, verifyToken } from '@/lib/auth-core';

export { COOKIE_NAME, signToken, verifyToken };

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
