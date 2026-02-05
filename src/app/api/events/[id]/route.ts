import { getSessionUser } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac';
import { badRequest, notFound, ok } from '@/lib/response';
import { NextRequest } from 'next/server';
import { getEvent, updateEvent, deleteEvent } from '@/lib/store';
import { InsightEventUpdateSchema } from '@/lib/validators';

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'events:read');
  } catch (resp) {
    return resp as Response;
  }

  const { id } = await context.params;
  const event = getEvent(id);
  if (!event) return notFound('Event not found');
  return ok({ item: event });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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

  const { id } = await context.params;
  const updated = updateEvent(id, parsed.data);
  if (!updated) return notFound('Event not found');
  return ok({ item: updated });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'events:delete');
  } catch (resp) {
    return resp as Response;
  }

  const { id } = await context.params;
  const deleted = deleteEvent(id);
  if (!deleted) return notFound('Event not found');
  return ok({ ok: true });
}
