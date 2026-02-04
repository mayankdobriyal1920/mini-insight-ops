import { NextResponse } from 'next/server';

type Meta = Record<string, unknown> | undefined;

export function ok<T>(data: T, meta?: Meta) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function badRequest(details: unknown) {
  return NextResponse.json(
    { error: { code: 'BAD_REQUEST', message: 'Invalid request', details } },
    { status: 400 },
  );
}

export function unauthorized(message = 'Authentication required') {
  return NextResponse.json(
    { error: { code: 'UNAUTHENTICATED', message } },
    { status: 401 },
  );
}

export function forbidden(message = 'You do not have permission to perform this action') {
  return NextResponse.json({ error: { code: 'FORBIDDEN', message } }, { status: 403 });
}

export function notFound(message = 'Resource not found') {
  return NextResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });
}
