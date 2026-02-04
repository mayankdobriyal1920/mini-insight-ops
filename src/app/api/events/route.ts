import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac';
import { ok, badRequest } from '@/lib/response';
import { parseEventQuery } from '@/lib/query';
import { applyFilters, applySort, paginate } from '@/lib/events-helpers';
import { InsightEvent } from '@/types/insight';
import { createEvent, listEvents } from '@/lib/store';
import { InsightEventCreateSchema } from '@/lib/validators';
import { NextResponse } from 'next/server';

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
  const sorted = applySort(filtered, query);
  const pageSize = Math.min(query.pageSize ?? 10, 500);
  const { items, meta } = paginate(sorted, query.page ?? 1, pageSize);

  return ok({ items, meta });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'events:create');
  } catch (resp) {
    return resp as Response;
  }

  const json = await req.json().catch(() => null);
  const parsed = InsightEventCreateSchema.safeParse(json);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const item: InsightEvent = createEvent(parsed.data);
  return NextResponse.json({ data: { item } }, { status: 201 });
}
