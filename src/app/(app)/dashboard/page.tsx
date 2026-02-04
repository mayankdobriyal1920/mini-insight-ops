import { getSessionUser } from '@/lib/auth';
import DashboardPageClient from './pageClient';

export default async function DashboardPage() {
  const user = await getSessionUser();
  return <DashboardPageClient user={user} />;
}
