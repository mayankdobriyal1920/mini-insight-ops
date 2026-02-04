import { getSessionUser } from '@/lib/auth';
import { assertPermission } from '@/lib/rbac';
import { ok } from '@/lib/response';
import { listUsers } from '@/lib/store';

export async function GET() {
  const user = await getSessionUser();
  try {
    assertPermission(user, 'users:read');
  } catch (resp) {
    return resp as Response;
  }

  const items = listUsers();
  return ok({ items });
}
