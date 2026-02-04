import { getSessionUser } from '@/lib/auth';
import EventsPageClient from './pageClient';

export default async function EventsPage() {
  const user = await getSessionUser();
  return <EventsPageClient user={user} />;
}
