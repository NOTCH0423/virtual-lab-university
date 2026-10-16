import { ALL_ROLES, AdminUser, isSuperAdminRole } from '@/lib/admin';

export const STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'] as const;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidRole(r: unknown): r is string {
  return typeof r === 'string' && (ALL_ROLES as readonly string[]).includes(r);
}

/** ¿Puede `actor` asignar el rol `role`? Solo SUPER_ADMIN asigna ADMIN/SUPER_ADMIN. */
export function canAssignRole(actor: AdminUser, role: string) {
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return isSuperAdminRole(actor.role);
  return true;
}

/**
 * ¿Puede `actor` modificar/eliminar al usuario `target`?
 * - Nadie modifica a un SUPER_ADMIN (salvo él mismo, y solo nombre/email).
 * - Un ADMIN no puede modificar a otros ADMIN.
 */
export function canManage(actor: AdminUser, target: { id: string; role: string }) {
  const tRole = target.role.toUpperCase();
  if (target.id === actor.id) return true;
  if (tRole === 'SUPER_ADMIN') return false;
  if (tRole === 'ADMIN' && !isSuperAdminRole(actor.role)) return false;
  return true;
}
