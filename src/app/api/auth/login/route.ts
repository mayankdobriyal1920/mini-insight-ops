import { buildSessionCookie, verifyCredentials } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST', message: 'Email and password are required.' } },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const authResult = verifyCredentials(email, password);

  if (!authResult.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } },
      { status: 401 },
    );
  }

  const { sessionId, user } = authResult;
  const cookie = buildSessionCookie(sessionId);

  const res = NextResponse.json({ data: { user } }, { status: 200 });
  res.cookies.set(cookie);
  return res;
}
