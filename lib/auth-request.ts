import { NextRequest } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/auth-core';

export async function getAuthUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}