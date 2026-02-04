'use client';

import { Permission } from '@/lib/rbac';
import { can } from '@/lib/rbac-ui';
import { User } from '@/types/user';

type GuardProps = {
  user: User | null;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function Guard({ user, permission, children, fallback }: GuardProps) {
  if (!can(user, permission)) {
    return (
      fallback ?? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted">
          <span className="inline-flex h-2 w-2 rounded-full bg-orange-400" aria-hidden />
          <span>Viewer role: read-only</span>
        </div>
      )
    );
  }

  return <>{children}</>;
}
