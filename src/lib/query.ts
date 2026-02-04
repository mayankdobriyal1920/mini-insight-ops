import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EventQuerySchema } from './validators';

export type ParsedEventQuery = z.infer<typeof EventQuerySchema>;

export function parseEventQuery(url: URL): { ok: true; value: ParsedEventQuery } | { ok: false; response: NextResponse } {
  const search = url.searchParams;

  const raw = {
    q: search.get('q') ?? undefined,
    category: search.get('category') ?? undefined,
    severity: search.get('severity') ?? undefined,
    minScore: toNumber(search.get('minScore')),
    days: toNumber(search.get('days')),
    startDate: search.get('startDate') ?? undefined,
    endDate: search.get('endDate') ?? undefined,
    sortBy: search.get('sortBy') ?? undefined,
    sortDir: search.get('sortDir') ?? undefined,
    page: toNumber(search.get('page')),
    pageSize: toNumber(search.get('pageSize')),
  };

  const parsed = EventQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 },
      ),
    };
  }

  const value = parsed.data;
  return { ok: true, value };
}

function toNumber(value: string | null): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
