import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { User } from '@/types/user';
import {
  createSessionRecord,
  deleteSession,
  findUserByCredentials,
  getSessionUser as getSessionUserFromStore,
} from './store';

export const SESSION_COOKIE = 'io_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export type AuthResult =
  | { success: true; user: User; sessionId: string }
  | { success: false; error: 'INVALID_CREDENTIALS' };

export function verifyCredentials(email: string, password: string): AuthResult {
  const user = findUserByCredentials(email, password);
  if (!user) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  const sessionId = createSessionRecord(user.id);
  return { success: true, user, sessionId: user.id ?? sessionId };
}

async function readSessionId(req?: NextRequest) {
  if (req) {
    return req.cookies?.get?.(SESSION_COOKIE)?.value;
  }
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function getSessionUser(req?: NextRequest): Promise<User | null> {
  const sessionId = await readSessionId(req);
  return getSessionUserFromStore(sessionId);
}

export async function destroySession(req?: NextRequest) {
  const sessionId = await readSessionId(req);
  deleteSession(sessionId);
}

export function buildSessionCookie(sessionId: string) {
  return {
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}
