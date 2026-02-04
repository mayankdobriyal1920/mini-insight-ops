import { getSessionUser } from '@/lib/auth';
import MapPageClient from './pageClient';

export default async function MapPage() {
  const user = await getSessionUser();
  return <MapPageClient user={user} />;
}
