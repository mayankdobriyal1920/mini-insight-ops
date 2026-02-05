'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginCard() {
  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-xl">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Mini InsightOps</p>
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="text-sm text-muted">Access your maps, dashboards, and event streams.</p>
      </div>
      <LoginForm />
      <DemoCredentials />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid form');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || 'Login failed');
      }

      router.push('/map');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-2 focus:border-accent focus:ring-2 focus:ring-accent/50"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-2 focus:border-accent focus:ring-2 focus:ring-accent/50"
          placeholder="********"
          autoComplete="current-password"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

function DemoCredentials() {
  const creds = [
    { email: 'admin@test.com', role: 'Admin' },
    { email: 'analyst@test.com', role: 'Analyst' },
    { email: 'viewer@test.com', role: 'Viewer' },
  ];

  return (
    <div className="mt-6 space-y-2 rounded-lg border border-border bg-surface-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Demo logins</p>
      <div className="space-y-2 text-sm">
        {creds.map((c) => (
          <div
            key={c.email}
            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
          >
            <div>
              <p className="font-medium text-foreground">{c.email}</p>
              <p className="text-xs text-muted">Role: {c.role}</p>
            </div>
            <span className="rounded-full bg-surface px-2 py-1 text-[11px] text-muted">password</span>
          </div>
        ))}
      </div>
    </div>
  );
}
