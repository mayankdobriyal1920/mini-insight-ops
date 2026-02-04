'use client';

import Link from 'next/link';
import { User } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = { user: User };

export default function TopBar({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoading(false);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div className="text-sm text-muted">
        Welcome back, Operator. Stay on top of your signals.
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/events"
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition hover:border-accent hover:text-foreground"
        >
          View Events
        </Link>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full border border-border bg-surface-muted px-3 py-2 text-sm text-foreground transition hover:border-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-foreground">
              {user.email.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left leading-tight">
              <p className="text-sm font-medium text-foreground">{user.email}</p>
              <p className="text-xs uppercase tracking-wide text-muted">{user.role}</p>
            </div>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{user.email}</p>
                <p className="text-xs text-muted">{user.role}</p>
              </div>
              <button
                disabled={loading}
                onClick={handleLogout}
                className="flex w-full items-center justify-between px-4 py-3 text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-60"
              >
                <span>Logout</span>
                {loading && <span className="text-xs text-muted">…</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
