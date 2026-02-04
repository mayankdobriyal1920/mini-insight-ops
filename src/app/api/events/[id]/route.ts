import { getSessionUser } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac';
import { badRequest, notFound, ok } from '@/lib/response';
import { NextRequest } from 'next/server';
import { getEvent, updateEvent, deleteEvent } from '@/lib/store';
import { InsightEventUpdateSchema } from '@/lib/validators';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'events:read');
  } catch (resp) {
    return resp as Response;
  }

  const event = getEvent(params.id);
  if (!event) return notFound('Event not found');
  return ok({ item: event });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'events:update');
  } catch (resp) {
    return resp as Response;
  }

  const json = await req.json().catch(() => null);
  const parsed = InsightEventUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const updated = updateEvent(params.id, parsed.data);
  if (!updated) return notFound('Event not found');
  return ok({ item: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'events:delete');
  } catch (resp) {
    return resp as Response;
  }

  const deleted = deleteEvent(params.id);
  if (!deleted) return notFound('Event not found');
  return ok({ ok: true });
}
