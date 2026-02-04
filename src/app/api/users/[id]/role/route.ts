import { getSessionUser } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac';
import { badRequest, notFound, ok } from '@/lib/response';
import { updateUserRole } from '@/lib/store';
import { Role } from '@/types/user';
import { z } from 'zod';

const bodySchema = z.object({
  role: z.enum(['Admin', 'Analyst', 'Viewer']),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'users:updateRole');
  } catch (resp) {
    return resp as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const updated = updateUserRole(params.id, parsed.data.role as Role);
  if (!updated) return notFound('User not found');

  return ok({ item: updated });
}
