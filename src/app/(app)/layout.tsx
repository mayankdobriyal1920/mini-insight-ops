import AppShell from '@/components/layout/app-shell';
import { getSessionUser } from '@/lib/auth';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return <AppShell user={user}>{children}</AppShell>;
}
