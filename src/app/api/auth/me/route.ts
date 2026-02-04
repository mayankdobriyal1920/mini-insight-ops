import { getSessionUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'No active session.' } },
      { status: 401 },
    );
  }

  return NextResponse.json({ data: { user } });
}
