import { LoginCard } from './login-card';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect('/map');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-surface-muted to-background px-4 py-12">
      <LoginCard />
    </div>
  );
}
