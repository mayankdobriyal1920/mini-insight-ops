'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopBar from './top-bar';
import { User } from '@/types/user';

const navItems = [
  { href: '/map', label: 'Map', roles: ['Admin', 'Analyst', 'Viewer'] },
  { href: '/dashboard', label: 'Dashboard', roles: ['Admin', 'Analyst', 'Viewer'] },
  { href: '/events', label: 'Events', roles: ['Admin', 'Analyst', 'Viewer'] },
  { href: '/users', label: 'Users', roles: ['Admin'] },
];

type Props = { children: React.ReactNode; user: User };

export default function AppShell({ children, user }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen max-h-screen">
        <aside className="w-64 shrink-0 border-r border-border bg-surface-muted">
          <div className="flex items-center gap-2 px-6 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-strong font-semibold">
              MI
            </div>
            <div>
              <div className="text-sm uppercase tracking-widest text-muted">Mini</div>
              <div className="text-lg font-semibold text-foreground">InsightOps</div>
            </div>
          </div>
          <nav className="mt-2 flex flex-col gap-1 px-2">
            {navItems
              .filter((item) => item.roles.includes(user.role))
              .map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-accent/10 text-foreground'
                      : 'text-muted hover:bg-surface hover:text-foreground'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 rounded-full ${
                      active ? 'bg-accent-strong' : 'bg-muted/40 group-hover:bg-muted'
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-6 py-6 text-xs text-muted">
            Workspace · {new Date().getFullYear()}
          </div>
        </aside>
        <div className="flex flex-1 flex-col">
          <TopBar user={user} />
          <main className="flex-1 overflow-y-auto bg-background px-8 py-6">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
