'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/user';
import { apiGetUsers, apiUpdateUserRole } from '@/lib/api';

type Props = { user: User | null };

type RowState = {
  id: string;
  email: string;
  role: string;
};

export default function UsersPageClient({ user }: Props) {
  const [rows, setRows] = useState<RowState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const isAdmin = user?.role === 'Admin';

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    apiGetUsers()
      .then((res) => setRows(res.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, role: string) => {
    setSavingId(id);
    try {
      const res = await apiUpdateUserRole(id, role);
      setRows((prev) => prev.map((u) => (u.id === id ? res.item : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">Not authorized</h1>
        <p className="text-sm text-muted">You need Admin role to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted">Manage access roles</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/70 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}{' '}
          <button className="underline" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <div className="h-4 w-48 animate-pulse rounded bg-surface-muted" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
                    </td>
                  </tr>
                ))
              : rows.map((u) => (
                  <tr key={u.id} className="border-b border-border/60">
                    <td className="px-4 py-3 text-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-muted px-2 py-1 text-xs text-foreground">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={savingId === u.id || u.id === user?.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
                      >
                        {['Admin', 'Analyst', 'Viewer'].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {u.id === user?.id && (
                        <p className="text-xs text-muted">You cannot change your own role.</p>
                      )}
                      {savingId === u.id && (
                        <p className="text-xs text-muted">Saving…</p>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
