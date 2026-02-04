import { Permission } from './rbac';
import { User } from '@/types/user';

export function can(user: User | null | undefined, permission: Permission) {
  if (!user) return false;
  const rolePerms: Record<User['role'], Permission[]> = {
    Admin: [
      'events:read',
      'events:create',
      'events:update',
      'events:delete',
      'users:read',
      'users:updateRole',
    ],
    Analyst: ['events:read', 'events:create', 'events:update'],
    Viewer: ['events:read'],
  };
  return rolePerms[user.role]?.includes(permission) ?? false;
}

export function roleLabel(role: User['role']) {
  return role;
}

export function roleBadgeClasses(role: User['role']) {
  const base =
    'rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide border border-border';
  if (role === 'Admin') return `${base} bg-accent/20 text-foreground`;
  if (role === 'Analyst') return `${base} bg-surface-muted text-foreground`;
  return `${base} bg-background text-muted`;
}
