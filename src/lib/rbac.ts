import { User } from '@/types/user';
import { forbidden, unauthorized } from './response';

export type Role = 'Admin' | 'Analyst' | 'Viewer';

export type Permission =
  | 'events:read'
  | 'events:create'
  | 'events:update'
  | 'events:delete'
  | 'users:read'
  | 'users:updateRole';

const rolePermissions: Record<Role, Permission[]> = {
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

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function assertPermission(user: User | null | undefined, permission: Permission) {
  if (!user) {
    throw unauthorized('Authentication required');
  }
  if (!hasPermission(user.role, permission)) {
    throw forbidden('You lack required permission');
  }
}
