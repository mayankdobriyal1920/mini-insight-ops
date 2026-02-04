import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac';
import { parseEventQuery } from '@/lib/query';
import { applyFilters, applySort } from '@/lib/events-helpers';
import { listEvents } from '@/lib/store';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'events:read');
  } catch (resp) {
    return resp as Response;
  }

  const parsed = parseEventQuery(new URL(req.url));
  if (!parsed.ok) return parsed.response;
  const query = parsed.value;

  const events = listEvents();
  const filtered = applyFilters(events, query);
  const sorted = applySort(filtered, { ...query, sortBy: query.sortBy ?? 'createdAt' });

  const rows = [
    ['id', 'title', 'category', 'severity', 'score', 'confidence', 'impact', 'createdAt', 'tags'].join(','),
    ...sorted.map((e) =>
      [
        e.id,
        wrap(e.title),
        e.category,
        e.severity,
        e.metrics.score,
        e.metrics.confidence,
        e.metrics.impact,
        e.createdAt,
        wrap(e.tags.join('|')),
      ].join(','),
    ),
  ].join('\n');

  const res = new NextResponse(rows, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="insight-events_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
  return res;
}

function wrap(val: string) {
  const escaped = val.replace(/"/g, '""');
  return `"${escaped}"`;
}
