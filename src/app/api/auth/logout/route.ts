import { destroySession, SESSION_COOKIE } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  destroySession();

  const res = NextResponse.json({ data: { ok: true } });
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return res;
}
