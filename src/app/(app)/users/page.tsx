import { getSessionUser } from '@/lib/auth';
import UsersPageClient from './pageClient';

export default async function UsersPage() {
  const user = await getSessionUser();
  return <UsersPageClient user={user} />;
}
